
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface TaskSubmission {
  title: string;
  description: string;
  payment: number;
  attachment?: File | null;
}

export const submitTask = async (task: TaskSubmission, userId: string) => {
  try {
    // First, check for duplicate task
    const { data: existingTask, error: duplicateError } = await supabase
      .from('tasks')
      .select('id')
      .eq('client_id', userId)
      .eq('title', task.title)
      .single();

    if (existingTask) {
      toast({
        title: "Duplicate Task",
        description: "A task with this title already exists.",
        variant: "destructive"
      });
      return null;
    }

    // Prepare task data
    const taskData = {
      title: task.title,
      description: task.description,
      payment: task.payment,
      client_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Insert task
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;

    // Optional: Handle attachment upload if provided
    if (task.attachment) {
      const fileExt = task.attachment.name.split('.').pop();
      const fileName = `${data.id}.${fileExt}`;
      const filePath = `task-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, task.attachment);

      if (uploadError) {
        console.error('Attachment upload failed:', uploadError);
      }
    }

    toast({
      title: "Task Submitted",
      description: "Your task has been successfully created.",
    });

    return data;
  } catch (error) {
    console.error('Task submission error:', error);
    toast({
      title: "Error",
      description: "Failed to submit task. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
