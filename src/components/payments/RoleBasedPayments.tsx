
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import EmployerPayments from "./EmployerPayments";
import WorkerPayments from "./WorkerPayments";
import { Loader } from "lucide-react";

const RoleBasedPayments = () => {
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
          const type = data?.user_type || data?.role;
          setUserType(type);
          console.log("Payment System - User type:", type);
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
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Return appropriate payment component based on user type
  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Sign in to access payment features</h2>
        <p className="text-muted-foreground">Please log in to view your personalized payment options</p>
      </div>
    );
  }

  if (userType === 'employer' || userType === 'client') {
    return <EmployerPayments />;
  } else {
    return <WorkerPayments />;
  }
};

export default RoleBasedPayments;
