import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [returnPath, setReturnPath] = useState("/dashboard"); // Default return path
  
  // Get returnTo from query parameters or from location state
  useEffect(() => {
    // Check query parameters first (higher priority)
    const returnToParam = searchParams.get('returnTo');
    if (returnToParam) {
      setReturnPath(returnToParam);
    } else if (location.state?.returnUrl) {
      // Fall back to location state if set
      setReturnPath(location.state.returnUrl);
    }
  }, [searchParams, location.state]);
  
  // Get any message from the location state
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      
      // Get user type from database to determine redirection
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_type, role')
          .eq('id', userData.user.id)
          .single();
        
        // Show success toast
        toast({
          title: "Login successful!",
          description: "Welcome back to TaskHived",
        });
        
        console.log("LoginForm - Login successful, user profile:", profileData);
        
        // Decide where to navigate based on user type and return path
        if (profileData) {
          // Prioritize user_type, fall back to role if needed
          const userType = profileData.user_type || profileData.role;
          console.log("LoginForm - User type:", userType, "Return path:", returnPath);
          
          // If returnPath is specified, prioritize that
          if (returnPath && returnPath !== '/dashboard') {
            console.log("LoginForm - Redirecting to return path:", returnPath);
            navigate(returnPath);
            return;
          }
          
          // Otherwise route based on role
          if (userType === 'worker') {
            console.log("LoginForm - Redirecting to worker dashboard");
            navigate('/worker-dashboard');
            return;
          } else if (userType === 'employer' || userType === 'client') {
            console.log("LoginForm - Redirecting to employer dashboard");
            navigate('/employer-dashboard');
            return;
          }
        }
        
        // Fallback to dashboard if no specific routing applied
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Log in to your TaskHived account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button 
                type="button" 
                variant="link" 
                className="p-0 text-sm"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate("/signup")}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
