
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
import { Checkbox } from "@/components/ui/checkbox";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState<SignupFormData & { role: string; dateOfBirth: string }>({
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

  const validateAge = (dateOfBirth: string): boolean => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    console.clear();
    console.log("Form submission started...");
    
    // Validate age
    if (!validateAge(formData.dateOfBirth)) {
      setErrors(prev => ({ ...prev, dateOfBirth: "You must be at least 18 years old to register" }));
      return;
    }

    // Check terms agreement
    if (!agreeToTerms) {
      setGeneralError("You must agree to the terms and conditions");
      return;
    }
    
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      console.log("Form validation failed");
      return;
    }

    setIsLoading(true);
    console.log(`Form is valid, attempting signup for: ${formData.email} with role: ${formData.role}`);

    try {
      toast({
        title: "Processing...",
        description: "Attempting to create your account",
      });
      
      const result = await signup(formData.name, formData.email, formData.password, formData.role)
        .catch(err => {
          console.error("Signup Error (inner catch):", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
          
          toast({
            title: "Signup Error",
            description: err.message || "An error occurred during signup",
            variant: "destructive"
          });
          
          setGeneralError(err.message || "An error occurred during signup");
          return null;
        });
      
      if (result === null) {
        console.log("Signup failed in inner catch block");
        return;
      }
      
      console.log("Signup success, account created!");
      
      toast({
        title: "Account created!",
        description: "Your account was created successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Signup Error (outer catch):", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      setGeneralError(error.message || "An unexpected error occurred. Please try again.");
      
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
            id="dateOfBirth"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.dateOfBirth}
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

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground"
            >
              I confirm that I am at least 18 years old and agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>
          
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
