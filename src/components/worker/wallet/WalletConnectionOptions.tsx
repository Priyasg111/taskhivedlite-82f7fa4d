
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";

interface WalletConnectionOptionsProps {
  isConnecting: boolean;
  emailWallet: string;
  onEmailWalletChange: (value: string) => void;
  onConnectWallet: () => void;
  onConnectEmailWallet: () => void;
}

const WalletConnectionOptions = ({
  isConnecting,
  emailWallet,
  onEmailWalletChange,
  onConnectWallet,
  onConnectEmailWallet
}: WalletConnectionOptionsProps) => {
  return (
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
          onClick={onConnectWallet} 
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
              onChange={(e) => onEmailWalletChange(e.target.value)} 
            />
            <Button 
              onClick={onConnectEmailWallet} 
              disabled={isConnecting || !emailWallet}
            >
              Connect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionOptions;
