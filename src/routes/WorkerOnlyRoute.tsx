
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";

export const WorkerOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [isCheckingUserType, setIsCheckingUserType] = useState(true);
  
  // Fetch user type when the user is available
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        setIsCheckingUserType(false);
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
          setIsCheckingUserType(false);
          return;
        }
        
        // Prioritize user_type, fall back to role if needed
        setUserType(data.user_type || data.role);
      } catch (err) {
        console.error("Failed to fetch user type:", err);
      } finally {
        setIsCheckingUserType(false);
      }
    };
    
    fetchUserType();
  }, [user]);
  
  if (isLoading || isCheckingUserType) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  // Allow unauthenticated users but redirect to login
  if (!user) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnTo=${currentPath}`} replace />;
  }
  
  // Check if user has worker role or is worker type
  if (userType !== 'worker') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
