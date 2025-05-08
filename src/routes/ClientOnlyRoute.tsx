
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";

export const ClientOnlyRoute = ({ children }: { children: React.ReactNode }) => {
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
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user type:", error);
          setIsCheckingUserType(false);
          return;
        }
        
        setUserType(data.user_type);
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
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has client role or is employer type
  if (user.user_metadata?.role !== 'client' && userType !== 'employer') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
