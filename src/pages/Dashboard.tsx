
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkUserTypeAndRedirect = async () => {
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
          .select('user_type, role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (profileData) {
          // Prioritize user_type, fall back to role if needed
          const userType = profileData.user_type || profileData.role;
          setUserType(userType);
          
          console.log("Dashboard - User type detected:", userType);
          
          // Redirect based on role/user type
          if (userType === 'worker') {
            console.log("Redirecting to worker dashboard");
            navigate("/worker-dashboard");
            return;
          } else if (userType === 'employer' || userType === 'client') {
            console.log("Redirecting to employer dashboard");
            navigate("/employer-dashboard");
            return;
          } else {
            // No valid role found
            console.error("Invalid user type:", userType);
            toast({
              title: "Access Error",
              description: "Your account doesn't have a valid role assigned",
              variant: "destructive"
            });
          }
        } else {
          // No profile found, redirect to unauthorized
          console.error("No profile found for user");
          navigate("/unauthorized");
        }
      } catch (err) {
        console.error("Error checking user type:", err);
        setError("Unable to determine your user type. Please try again later.");
      } finally {
        setIsChecking(false);
      }
    };
    
    checkUserTypeAndRedirect();
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
            <h1 className="text-2xl font-semibold">Loading dashboard...</h1>
            <p className="mt-2 text-muted-foreground">Please wait while we determine your access level.</p>
          </div>
        </main>
        <Footer />
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
        <Footer />
      </div>
    );
  }

  // Fallback content - this shouldn't render since we redirect
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-amber-100 text-amber-800 p-6 rounded-lg mb-8">
            <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
            <p>Please wait while we redirect you to the appropriate dashboard.</p>
          </div>
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link to="/worker-dashboard">Worker Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/employer-dashboard">Employer Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
