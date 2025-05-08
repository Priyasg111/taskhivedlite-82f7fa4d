
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import NavBar from "@/components/NavBar";
import RoleBasedPayments from "@/components/payments/RoleBasedPayments";
import Footer from "@/components/Footer";

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
          .select('user_type, role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user type:", error);
        } else {
          // Prioritize user_type, fall back to role
          setUserType(data?.user_type || data?.role || null);
        }
      } catch (err) {
        console.error("Error checking user type:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserType();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {userType === 'employer' || userType === 'client' ? 'Project Payments' : 'Earnings Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userType === 'employer' || userType === 'client' 
              ? 'Manage your project payments, add funds, and pay workers for completed tasks.'
              : 'Track your earnings, withdraw funds, and view payment history.'}
          </p>
        </div>
        
        <RoleBasedPayments />
      </main>
      <Footer />
    </div>
  );
};

export default Payments;
