
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  payment: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Payment must be a positive number",
  }),
  estimatedTime: z.string().min(1, "Please enter estimated completion time"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  deadline: z.string().min(1, "Please enter a deadline"),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
