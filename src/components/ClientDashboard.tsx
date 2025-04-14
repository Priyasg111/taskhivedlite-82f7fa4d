
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define interface to match our database table
interface UserProfile {
  id: string;
  role: 'admin' | 'client' | 'worker';
  credits: number;
  wallet_address: string | null;
  wallet_status: string | null;
  created_at: string;
  updated_at: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(5);
  
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select("credits")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        setCredits(data?.credits || 0);
      } catch (error) {
        console.error("Error fetching credits:", error);
        toast({
          title: "Error fetching credits",
          description: "Could not load your current credit balance.",
          variant: "destructive",
        });
      }
    };
    
    loadCredits();
  }, [user, toast]);

  const handlePurchaseCredits = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to purchase credits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate the amount based on the credits
      // For example, $1 per credit
      const amount = purchaseAmount;
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { amount, credits: purchaseAmount },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error creating the checkout session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Task Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-brand-blue" />
            </div>
            <div>
              <div className="text-3xl font-bold">{credits}</div>
              <div className="text-sm text-muted-foreground">Available credits for posting tasks</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="text-sm font-medium">Purchase Task Credits</div>
            <div className="flex gap-4 items-center">
              <Input 
                type="number" 
                min="1" 
                value={purchaseAmount} 
                onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span>credits for ${purchaseAmount.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handlePurchaseCredits} 
              disabled={loading || purchaseAmount < 1}
              className="w-full"
            >
              {loading ? "Processing..." : `Purchase Credits with Stripe`}
            </Button>
            
            <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5" />
              <span>Each credit allows you to post one task. Payments are processed securely via Stripe.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would be populated with actual transaction data from Supabase */}
            <div className="text-center text-muted-foreground py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No recent purchases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
