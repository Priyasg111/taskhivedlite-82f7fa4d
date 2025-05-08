
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login with returnTo parameter
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnTo=${currentPath}`} replace />;
  }
  
  return <>{children}</>;
};
