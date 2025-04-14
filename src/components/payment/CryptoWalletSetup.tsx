
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bitcoin, 
  Wallet, 
  Loader, 
  Check, 
  Unlink, 
  LinkIcon,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CryptoWalletSetupProps {
  onComplete: (data: any, preferredToken?: string) => Promise<void>;
  initialData: any;
  preferredToken: string | null;
  saving: boolean;
}

const supportedTokens = [
  { value: "USDC", label: "USDC", description: "USD Coin (ERC-20)" },
  { value: "ETH", label: "ETH", description: "Ethereum" },
  { value: "BTC", label: "BTC", description: "Bitcoin" },
  { value: "SOL", label: "SOL", description: "Solana" }
];

const CryptoWalletSetup = ({ 
  onComplete, 
  initialData, 
  preferredToken,
  saving 
}: CryptoWalletSetupProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [walletMethod, setWalletMethod] = useState<"walletconnect" | "magic" | null>(
    initialData?.method || null
  );
  const [walletAddress, setWalletAddress] = useState<string>(
    initialData?.address || ""
  );
  const [token, setToken] = useState<string>(
    preferredToken || supportedTokens[0].value
  );
  const [emailWallet, setEmailWallet] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // In a real implementation, this would integrate with WalletConnect
  const connectWithWalletConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet connection
      const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      setWalletAddress(mockAddress);
      
      // Save to database
      const walletData = {
        method: "walletconnect",
        address: mockAddress,
        type: "crypto",
        connected_at: new Date().toISOString()
      };
      
      await onComplete(walletData, token);
      
      toast({
        title: "Wallet connected",
        description: "Your crypto wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: "There was a problem connecting your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // In a real implementation, this would integrate with Magic.link
  const connectWithMagic = async () => {
    if (!emailWallet.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Simulate Magic.link connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWalletMethod("magic");
      setWalletAddress(emailWallet);
      
      // Save to database
      const walletData = {
        method: "magic",
        address: emailWallet,
        type: "crypto",
        connected_at: new Date().toISOString()
      };
      
      await onComplete(walletData, token);
      
      toast({
        title: "Email wallet connected",
        description: "Your Magic.link wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Error connecting Magic.link wallet:", error);
      toast({
        title: "Connection failed",
        description: "There was a problem connecting your email wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!user) return;
      
      // Update the wallet status in the database
      await supabase
        .from('user_profiles')
        .update({
          wallet_address: null, 
          wallet_status: 'none',
          payout_details: null
        })
        .eq('id', user.id);
      
      setWalletMethod(null);
      setWalletAddress("");
      
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been successfully disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Error",
        description: "There was a problem disconnecting your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const updatePreferredToken = async (selectedToken: string) => {
    setToken(selectedToken);
    
    if (walletMethod && walletAddress) {
      try {
        // Save to database
        await onComplete(
          {
            method: walletMethod,
            address: walletAddress,
            type: "crypto",
            updated_at: new Date().toISOString()
          }, 
          selectedToken
        );
        
        toast({
          title: "Token preference updated",
          description: `Your preferred crypto is now set to ${selectedToken}.`,
        });
      } catch (error) {
        console.error("Error updating token preference:", error);
        toast({
          title: "Update failed",
          description: "There was a problem updating your token preference. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Crypto Wallet Setup</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Connect your crypto wallet to receive payments in your preferred token.
        </p>
      </div>
      
      {!walletMethod ? (
        <div className="grid gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Select your preferred token</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {supportedTokens.map((tokenOption) => (
                <Button
                  key={tokenOption.value}
                  type="button"
                  variant={token === tokenOption.value ? "default" : "outline"}
                  className="h-auto py-3 px-4"
                  onClick={() => setToken(tokenOption.value)}
                >
                  <div className="flex flex-col items-center text-center">
                    <span>{tokenOption.value}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {tokenOption.description}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-700" />
                  </div>
                  <h4 className="font-medium">Web3 Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet.
                  </p>
                  <Button 
                    onClick={connectWithWalletConnect}
                    disabled={isConnecting || saving}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="mx-auto bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center">
                    <Bitcoin className="h-6 w-6 text-purple-700" />
                  </div>
                  <h4 className="font-medium">Email Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your email as a crypto wallet with Magic.link (no wallet setup needed).
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="your@email.com"
                      value={emailWallet}
                      onChange={(e) => setEmailWallet(e.target.value)}
                    />
                    <Button 
                      onClick={connectWithMagic}
                      disabled={isConnecting || saving || !emailWallet}
                    >
                      {isConnecting ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Wallet Connected</h4>
                      <Badge variant="outline" className="text-xs">
                        {walletMethod === "walletconnect" ? "Web3 Wallet" : "Magic.link"}
                      </Badge>
                    </div>
                    <p className="text-sm break-all font-mono bg-muted px-2 py-1 rounded mt-1">
                      {walletAddress}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={disconnectWallet}
                    disabled={isConnecting || saving}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    {isConnecting ? (
                      <Loader className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="mr-1 h-4 w-4" />
                    )}
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Preferred token</h4>
              <p className="text-xs text-muted-foreground">
                Choose which cryptocurrency you'd like to receive payments in.
              </p>
            </div>
            <Select value={token} onValueChange={updatePreferredToken}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((tokenOption) => (
                  <SelectItem key={tokenOption.value} value={tokenOption.value}>
                    <div className="flex items-center">
                      <span>{tokenOption.value}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        - {tokenOption.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Important:</strong> Make sure your connected wallet supports {token} on the correct network. 
              Sending funds to an incompatible wallet may result in loss of funds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoWalletSetup;
