
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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
