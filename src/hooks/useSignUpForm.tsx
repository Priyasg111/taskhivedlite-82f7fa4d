
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { SignupFormData, validateForm } from "@/components/form/ValidationSchema";

export interface SignUpFormState {
  formData: SignupFormData & { role: string };
  errors: Record<string, string>;
  generalError: string;
  isLoading: boolean;
  agreeToTerms: boolean;
}

export function useSignUpForm() {
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
  
  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
    
    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
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
          description: "This email is already in use. Please log in or use Forgot Password to recover your account.",
          variant: "destructive",
          action: (
            <button 
              className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary/90"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password
            </button>
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

  return {
    formState: {
      formData,
      errors,
      generalError,
      isLoading,
      agreeToTerms
    },
    setAgreeToTerms,
    handleChange,
    handleDateChange,
    handleRoleChange,
    handleSubmit
  };
}
