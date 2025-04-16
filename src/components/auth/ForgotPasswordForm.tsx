
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FormError from "@/components/form/FormError";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Revert to Supabase's default reset UI
        redirectTo: null
      });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
    } catch (err) {
      console.error("Error requesting password reset:", err);
      // Don't expose whether the email exists or not for security
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            If an account exists with the email {email}, we've sent password reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Please check your inbox and spam folder. The link will expire in 30 minutes.
          </p>
          <Button 
            onClick={() => navigate("/login")} 
            variant="outline"
            className="mr-2"
          >
            Back to Login
          </Button>
          <Button onClick={() => {
            setEmail("");
            setIsSubmitted(false);
          }}>
            Try a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you password reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormError error={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate("/login")}
            disabled={isSubmitting}
          >
            Back to Login
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
