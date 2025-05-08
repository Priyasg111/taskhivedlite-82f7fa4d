import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  
  // Redirect if already logged in based on role
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('user_type, role')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            // Prioritize user_type field, fall back to role if needed
            const userType = profileData.user_type || profileData.role;
            
            // If returnTo parameter exists, use that for redirection
            if (returnTo) {
              navigate(returnTo);
              return;
            }
            
            // Otherwise redirect based on user type
            if (userType === 'worker') {
              navigate("/worker-dashboard");
            } else if (userType === 'employer' || userType === 'client') {
              navigate("/employer-dashboard");
            } else {
              navigate("/dashboard"); // Default to dashboard which will route appropriately
            }
          } else {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          navigate("/dashboard");
        } finally {
          setIsCheckingRole(false);
        }
      } else {
        setIsCheckingRole(false);
      }
    };
    
    checkUserRole();
  }, [user, navigate, returnTo]);

  // Show loading while checking role
  if (user && isCheckingRole) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <LoginForm />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 TaskHived - AI-Verified Microtask Marketplace
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
