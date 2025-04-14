
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, ExternalLink, Loader, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeConnectSetupProps {
  onComplete: (data: any) => Promise<void>;
  initialData: any;
  saving: boolean;
}

const StripeConnectSetup = ({ 
  onComplete, 
  initialData, 
  saving
}: StripeConnectSetupProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'not_started' | 'pending' | 'connected'>(
    initialData?.account_id ? 'connected' : 'not_started'
  );
  const [isLoading, setIsLoading] = useState(false);

  // In a real implementation, this would interact with the Stripe Connect API
  const connectWithStripe = async () => {
    setIsLoading(true);
    
    try {
      // Simulate a connection with Stripe Connect
      // In a real implementation, you'd redirect to Stripe Connect onboarding
      // or use Stripe Connect embedded components
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const mockAccountData = {
        account_id: `acct_${Math.random().toString(36).substring(2, 15)}`,
        status: 'connected',
        type: 'stripe',
        last_four: '4242',
        created_at: new Date().toISOString()
      };
      
      await onComplete(mockAccountData);
      setStatus('connected');
      
      toast({
        title: "Successfully connected with Stripe",
        description: "Your account is now set up to receive payments.",
      });
    } catch (error) {
      console.error("Error connecting with Stripe:", error);
      toast({
        title: "Connection failed",
        description: "There was a problem connecting your Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh connection status with Stripe
  const refreshConnectionStatus = async () => {
    setIsLoading(true);
    
    try {
      // Simulate checking Stripe account status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Status updated",
        description: "Your Stripe Connect account is active and ready to receive payments.",
      });
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast({
        title: "Refresh failed",
        description: "Could not update your Stripe account status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Stripe Connect</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Connect your Stripe account to receive payments directly to your bank account.
        </p>
      </div>
      
      {status === 'connected' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-medium">Stripe Connected</h4>
                  <p className="text-sm text-muted-foreground">
                    Account ID: {initialData?.account_id || '••••••'}
                    {initialData?.last_four ? ` (••••${initialData.last_four})` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshConnectionStatus}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-4 w-4" />
                  )}
                  Refresh Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-6 px-4 bg-muted/50 rounded-lg border">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">Connect Your Account</h4>
          <p className="mb-6 text-muted-foreground text-sm max-w-md mx-auto">
            Stripe Connect allows you to receive payments directly to your bank account. We'll guide you through the setup process.
          </p>
          <Button 
            onClick={connectWithStripe}
            disabled={isLoading || saving}
            className="min-w-[200px]"
          >
            {isLoading || saving ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Connect with Stripe
          </Button>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
        <p>
          <strong>Note:</strong> In production, this would integrate with the actual Stripe Connect API 
          to create and manage connected accounts. You'll need a Stripe API key and proper backend 
          integration to use this feature in production.
        </p>
      </div>
    </div>
  );
};

export default StripeConnectSetup;
