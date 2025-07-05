
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s\-']+$/, { 
      message: "Name can only contain letters, spaces, hyphens, and apostrophes" 
    }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: "Password must contain uppercase letter, lowercase letter, number, and special character (@$!%*?&)"
    }),
  dateOfBirth: z.string().refine((date) => {
    if (!date) return false;
    
    const birthDate = new Date(date);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Check if age is within the valid range (18-90)
    return age >= 18 && age <= 90;
  }, { message: "You must be between 18 and 90 years old to sign up" })
});

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
};

export const validateForm = (
  formData: SignupFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  try {
    signupSchema.parse(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
    }
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
