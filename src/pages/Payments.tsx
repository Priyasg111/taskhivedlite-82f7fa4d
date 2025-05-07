
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import NavBar from "@/components/NavBar";
import PaymentSystem from "@/components/PaymentSystem";
import Footer from "@/components/Footer";
import WorkerDashboard from "@/components/WorkerDashboard";

const Payments = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user type:", error);
        } else {
          setUserType(data?.user_type || null);
        }
      } catch (err) {
        console.error("Error checking user type:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserType();
  }, [user]);

  // Show loading while checking user type
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {userType === 'employer' ? 'Project Payments' : 'Earnings Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userType === 'employer' 
              ? 'Manage your project payments, view invoices, and payment history.'
              : 'Manage your earnings, connect your wallet, and withdraw funds.'}
          </p>
        </div>
        
        {userType === 'employer' ? <PaymentSystem /> : <WorkerDashboard />}
      </main>
      <Footer />
    </div>
  );
};

export default Payments;
