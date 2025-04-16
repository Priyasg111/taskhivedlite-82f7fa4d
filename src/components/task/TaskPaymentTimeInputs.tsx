
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TaskFormData } from "./TaskPostFormSchema";

interface TaskPaymentTimeInputsProps {
  form: UseFormReturn<TaskFormData>;
}

const TaskPaymentTimeInputs = ({ form }: TaskPaymentTimeInputsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="payment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Amount (USDC)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                step="0.01" 
                min="0"
                placeholder="15.00" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="estimatedTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Time</FormLabel>
            <FormControl>
              <Input placeholder="E.g., 30-45 minutes" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="deadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskPaymentTimeInputs;
