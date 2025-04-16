
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCategorySelect from "./task/TaskCategorySelect";
import TaskDifficultySelect from "./task/TaskDifficultySelect";
import TaskDetailsInputs from "./task/TaskDetailsInputs";
import TaskPaymentTimeInputs from "./task/TaskPaymentTimeInputs";
import { taskFormSchema, TaskFormData } from "./task/TaskPostFormSchema";

const TaskPostForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      payment: "",
      estimatedTime: "",
      difficulty: "Medium",
      deadline: "",
    },
  });

  async function onSubmit(values: TaskFormData) {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(values);
      toast({
        title: "Task posted successfully!",
        description: "Workers can now start completing your task.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error posting task",
        description: "There was a problem posting your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Post a New Task</CardTitle>
        <CardDescription>
          Create a task for our global workforce to complete. AI will verify the quality when work is submitted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TaskDetailsInputs form={form} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TaskCategorySelect form={form} />
              <TaskDifficultySelect form={form} />
            </div>
            
            <TaskPaymentTimeInputs form={form} />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Task"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TaskPostForm;
