
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface ConnectedWalletProps {
  walletAddress: string;
  walletStatus: "verified" | "unverified" | "none";
  onDisconnect: () => void;
}

const ConnectedWallet = ({ walletAddress, walletStatus, onDisconnect }: ConnectedWalletProps) => {
  return (
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
      
      <Button variant="outline" onClick={onDisconnect}>
        Disconnect Wallet
      </Button>
    </div>
  );
};

export default ConnectedWallet;
