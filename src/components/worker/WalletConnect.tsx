
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ConnectedWallet from "./wallet/ConnectedWallet";
import WalletConnectionOptions from "./wallet/WalletConnectionOptions";

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
    setIsConnecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockWalletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const handleDisconnect = () => {
    setWalletAddress("");
    setWalletStatus("none");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Your Crypto Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <ConnectedWallet
            walletAddress={walletAddress}
            walletStatus={walletStatus}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <WalletConnectionOptions
            isConnecting={isConnecting}
            emailWallet={emailWallet}
            onEmailWalletChange={setEmailWallet}
            onConnectWallet={connectWallet}
            onConnectEmailWallet={connectEmailWallet}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
