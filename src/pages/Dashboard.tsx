
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnUserType = async () => {
      // If auth is still loading, wait
      if (authLoading) return;
      
      // If user is not logged in, redirect to login
      if (!user) {
        navigate("/login", { 
          state: { 
            returnUrl: "/dashboard",
            message: "Please log in to access your dashboard"
          }
        });
        return;
      }
      
      try {
        // Get user type from profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (profileData) {
          const userType = profileData.user_type;
          
          // Redirect based on user type
          if (userType === 'worker') {
            navigate("/task-room");
          } else if (userType === 'employer') {
            navigate("/employer-console");
          } else {
            // Fallback based on role if user_type doesn't help
            if (user.user_metadata?.role === 'worker') {
              navigate("/task-room");
            } else if (user.user_metadata?.role === 'client') {
              navigate("/employer-console");
            } else {
              navigate("/unauthorized");
            }
          }
        } else {
          // No profile found, redirect to unauthorized
          navigate("/unauthorized");
        }
      } catch (err) {
        console.error("Error checking user type:", err);
        setError("Unable to determine your user type. Please try again later.");
      } finally {
        setIsChecking(false);
      }
    };
    
    redirectBasedOnUserType();
  }, [user, navigate, authLoading]);

  // Show loading while checking auth or role
  if (authLoading || (user && isChecking)) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container max-w-7xl py-16 px-4 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold">Redirecting to your dashboard...</h1>
            <p className="mt-2 text-muted-foreground">Please wait while we determine your access level.</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error if there's a problem
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-16 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-8">
              <h1 className="text-2xl font-semibold mb-2">Access Error</h1>
              <p>{error}</p>
            </div>
            <Button asChild size="lg">
              <Link to="/">Return to Homepage</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // This should rarely be seen as we should redirect before this renders
  return null;
};

export default Dashboard;
