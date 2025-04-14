
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WalletConnectProps {
  walletAddress: string;
  walletStatus: "verified" | "unverified" | "none";
  setWalletAddress: (address: string) => void;
  setWalletStatus: (status: "verified" | "unverified" | "none") => void;
}

const WalletConnect = ({ 
  walletAddress, 
  walletStatus, 
  setWalletAddress, 
  setWalletStatus 
}: WalletConnectProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailWallet, setEmailWallet] = useState("");

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
  );
};

export default WalletConnect;
