
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import FormError from "@/components/form/FormError";
import { SignupFormData, validateForm } from "@/components/form/ValidationSchema";
import FormFields from "@/components/signup/FormFields";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState<SignupFormData & { role: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "worker",
    dateOfBirth: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});
    
    // Check terms agreement
    if (!agreeToTerms) {
      setGeneralError("You must agree to the terms and conditions");
      return;
    }
    
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      toast({
        title: "Processing...",
        description: "Attempting to create your account",
      });
      
      const result = await signup(formData.name, formData.email, formData.password, formData.role);
      
      if (result === null) {
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Account created!",
        description: "Your account was created successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific case for existing user
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        setErrors(prev => ({ 
          ...prev, 
          email: "This email is already registered. Would you like to reset your password?" 
        }));
        
        toast({
          title: "Email already registered",
          description: "This email is already in use. Please use Forgot Password to recover your account.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password
            </Button>
          )
        });
      } else {
        setGeneralError(error.message || "An unexpected error occurred. Please try again.");
        
        toast({
          title: "Error creating account",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        <CardDescription className="text-center">
          Sign up to start earning on AI-verified tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormError error={generalError} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleRoleChange={handleRoleChange}
            setAgreeToTerms={setAgreeToTerms}
            agreeToTerms={agreeToTerms}
            isLoading={isLoading}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate("/login")}
            disabled={isLoading}
          >
            Log in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
