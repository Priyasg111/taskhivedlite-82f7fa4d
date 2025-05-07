
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import ProjectDashboard from "@/components/ProjectDashboard";
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
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (profileData) {
          const userType = profileData.user_type;
          setUserType(userType);
          
          // Redirect worker users away from dashboard
          if (userType === 'worker') {
            toast({
              title: "Access Restricted",
              description: "This dashboard is only available to employers.",
              variant: "destructive"
            });
            navigate("/complete-tasks");
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

  // If user is not an employer (e.g., worker or no user_type set)
  if (userType !== 'employer') {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-16 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-amber-100 text-amber-800 p-6 rounded-lg mb-8">
              <h1 className="text-2xl font-semibold mb-2">Employer Access Only</h1>
              <p>This dashboard is only available to employer accounts.</p>
            </div>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link to="/complete-tasks">Browse Available Tasks</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/">Return to Homepage</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render employer dashboard
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects, tasks, and payments.
          </p>
        </div>
        <ProjectDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
