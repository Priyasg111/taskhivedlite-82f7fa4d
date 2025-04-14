
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import FormInput from "@/components/form/FormInput";
import FormError from "@/components/form/FormError";
import RoleSelector from "@/components/form/RoleSelector";
import { SignupFormData, validateForm } from "@/components/form/ValidationSchema";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [formData, setFormData] = useState<SignupFormData & { role: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "worker" // Default role
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Clear general error when any field changes
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
    console.clear(); // Clear console for clean debugging
    console.log("Form submission started...");
    
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      console.log("Form validation failed");
      return;
    }

    setIsLoading(true);
    console.log(`Form is valid, attempting signup for: ${formData.email} with role: ${formData.role}`);

    try {
      // Show debug toast to confirm form submission
      toast({
        title: "Processing...",
        description: "Attempting to create your account",
      });
      
      // Force display any errors in UI by catching specifically here
      const result = await signup(formData.name, formData.email, formData.password, formData.role)
        .catch(err => {
          console.error("Signup Error (inner catch):", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
          
          // Show a toast and set error state
          toast({
            title: "Signup Error",
            description: err.message || "An error occurred during signup",
            variant: "destructive"
          });
          
          setGeneralError(err.message || "An error occurred during signup");
          return null;
        });
      
      if (result === null) {
        // Error was caught and displayed in the inner catch
        console.log("Signup failed in inner catch block");
        return;
      }
      
      console.log("Signup success, account created!");
      
      // Show explicit success message before navigation
      toast({
        title: "Account created!",
        description: "Your account was created successfully.",
      });
      
      // Navigate to homepage on successful signup
      navigate("/");
    } catch (error: any) {
      console.error("Signup Error (outer catch):", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Make sure to always display an error message
      setGeneralError(error.message || "An unexpected error occurred. Please try again.");
      
      // Also show a toast for better visibility
      toast({
        title: "Error creating account",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
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
          <FormInput
            id="name"
            name="name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.name}
          />
          
          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.email}
          />
          
          <FormInput
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.password}
          />
          
          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.confirmPassword}
          />
          
          <RoleSelector 
            selectedRole={formData.role}
            onChange={handleRoleChange}
            disabled={isLoading}
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
