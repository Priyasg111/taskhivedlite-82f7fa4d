
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, XCircle, DollarSign, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define interfaces to match our database tables
interface UserProfile {
  id: string;
  role: 'admin' | 'client' | 'worker';
  credits: number;
  wallet_address: string | null;
  wallet_status: string | null;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  client_id: string;
  worker_id: string | null;
  title: string;
  description: string;
  payment: number;
  time_taken: number | null;
  status: string;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
}

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"verified" | "unverified" | "none">("none");
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingPayouts, setPendingPayouts] = useState<Task[]>([]);
  const [emailWallet, setEmailWallet] = useState("");
  
  useEffect(() => {
    const loadWalletInfo = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select("wallet_address, wallet_status")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.wallet_address) {
          setWalletAddress(data.wallet_address);
          setWalletStatus((data.wallet_status as "verified" | "unverified" | "none") || "unverified");
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      }
    };
    
    const loadPendingPayouts = async () => {
      if (!user) return;
      
      try {
        const { data: taskData, error } = await supabase
          .from('tasks')
          .select('*')
          .eq("worker_id", user.id)
          .eq("status", "verified")
          .eq("payment_status", "pending");
          
        if (error) throw error;
        
        // Enhance task data with client information
        const enhancedTasks: Task[] = [];
        
        for (const task of taskData || []) {
          const enhancedTask: Task = { ...task };
          
          // Get client info if client_id exists
          if (task.client_id) {
            const { data: clientData } = await supabase
              .from('auth')
              .select('email, raw_user_meta_data')
              .eq('id', task.client_id)
              .single();
              
            if (clientData) {
              enhancedTask.client_email = clientData.email;
              enhancedTask.client_name = clientData.raw_user_meta_data?.name || 'Unknown Client';
            }
          }
          
          enhancedTasks.push(enhancedTask);
        }
        
        setPendingPayouts(enhancedTasks);
      } catch (error) {
        console.error("Error fetching pending payouts:", error);
      }
    };
    
    loadWalletInfo();
    loadPendingPayouts();
  }, [user]);

  const connectWallet = async () => {
    // This would integrate with WalletConnect in a real implementation
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWalletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
      // Update the database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          wallet_address: mockWalletAddress,
          wallet_status: "verified"
        })
        .eq("id", user?.id);
        
      if (error) throw error;
      
      setWalletAddress(mockWalletAddress);
      setWalletStatus("verified");
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected and verified.",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: "There was an error connecting your wallet.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const connectEmailWallet = async () => {
    if (!emailWallet || !emailWallet.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Simulate Magic.link integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          wallet_address: emailWallet,
          wallet_status: "verified"
        })
        .eq("id", user?.id);
        
      if (error) throw error;
      
      setWalletAddress(emailWallet);
      setWalletStatus("verified");
      
      toast({
        title: "Email wallet connected",
        description: "Your Magic.link wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Error connecting email wallet:", error);
      toast({
        title: "Connection failed",
        description: "There was an error connecting your email wallet.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Crypto Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {walletAddress ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Connected Wallet</div>
                  <code className="text-xs break-all bg-muted p-2 rounded block mt-1 max-w-md">
                    {walletAddress}
                  </code>
                </div>
                <Badge 
                  variant={walletStatus === "verified" ? "outline" : "destructive"} 
                  className="text-xs"
                >
                  {walletStatus === "verified" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                This wallet will be used to receive your USDC payments when tasks are approved.
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setWalletAddress("");
                  setWalletStatus("none");
                }}
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium">Connect a Wallet</div>
                  <div className="text-sm text-muted-foreground">Connect your crypto wallet to receive payouts</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={connectWallet} 
                  className="w-full" 
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect with WalletConnect"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Connect with Magic.link</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Use your email address as a Web3 wallet
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={emailWallet} 
                      onChange={(e) => setEmailWallet(e.target.value)} 
                    />
                    <Button 
                      onClick={connectEmailWallet} 
                      disabled={isConnecting || !emailWallet}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length > 0 ? (
            <div className="space-y-4">
              {pendingPayouts.map((task) => (
                <div key={task.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      For client: {task.clients?.name || "Unknown"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">${task.payment.toFixed(2)}</div>
                    <Badge variant="outline" className="text-xs">Verified - Pending Payment</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <ArrowDown className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No pending payouts</p>
              <p className="text-sm mt-2">Complete tasks to earn USDC</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No recent payouts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerDashboard;
