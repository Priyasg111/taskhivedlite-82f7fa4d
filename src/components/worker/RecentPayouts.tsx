
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Task } from "@/types/task";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RecentPayouts = () => {
  const [completedPayouts, setCompletedPayouts] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCompletedPayouts = async () => {
      if (!user) return;
      
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('payout_method')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setPayoutMethod(profileData.payout_method);
        }
          
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('worker_id', user.id)
          .eq('payment_status', 'paid')
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setCompletedPayouts(data || []);
      } catch (err) {
        console.error("Error fetching completed payouts:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompletedPayouts();
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : completedPayouts.length > 0 ? (
          <div className="space-y-4">
            {completedPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="font-medium">{payout.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Paid on {new Date(payout.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">${payout.payment.toFixed(2)}</div>
                  <Badge variant="outline" className="text-xs">Paid</Badge>
                </div>
              </div>
            ))}
            
            {!payoutMethod && (
              <div className="mt-4 p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                <p>Your payment method is not configured. Set up your payment method to receive future payments.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/payment-setup">Configure Payment Method</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No recent payouts</p>
            {!payoutMethod && (
              <>
                <p className="mt-2 text-sm">Set up your payment method to receive payments</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/payment-setup">Configure Payment Method</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPayouts;
