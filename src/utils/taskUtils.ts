
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Task, TaskSubmission, TaskSubmissionResult } from "@/types/task";

export interface TaskFormSubmission {
  title: string;
  description: string;
  payment: number;
  attachment?: File | null;
  category: string;
  difficulty: string;
  deadline: string;
  estimatedTime: string;
}

export const submitTask = async (task: TaskFormSubmission, userId: string) => {
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
      created_at: new Date().toISOString(),
      category: task.category,
      difficulty: task.difficulty,
      deadline: task.deadline,
      estimatedTime: task.estimatedTime
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

// Function to submit a completed task
export const submitCompletedTask = async (submission: TaskSubmission): Promise<TaskSubmissionResult> => {
  try {
    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit tasks.",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }

    let fileData = null;
    if (submission.file) {
      // Convert the file to base64
      const arrayBuffer = await submission.file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      fileData = {
        name: submission.file.name,
        content: base64,
        contentType: submission.file.type
      };
    }

    // Call the edge function to submit the completed task
    const { data, error } = await supabase.functions.invoke("submit-completed-task", {
      body: {
        task_id: submission.task_id,
        comment: submission.comment,
        file_data: fileData
      }
    });

    if (error) {
      console.error("Edge function error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit the task. Please try again.",
        variant: "destructive"
      });
      return {
        status: 'rejected',
        task: {} as Task,
        message: error.message || "Failed to submit the task"
      };
    }

    // Show appropriate toast based on the response
    if (data.status === 'completed') {
      toast({
        title: "Task Completed",
        description: "Your task submission was successful!",
      });
    } else if (data.status === 'under_review') {
      toast({
        title: "Under Review",
        description: "Your submission is under manual review.",
      });
    }

    return {
      status: data.status,
      task: data.task,
      message: data.message
    };
  } catch (error: any) {
    console.error('Task completion error:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to submit task. Please try again.",
      variant: "destructive"
    });
    return {
      status: 'rejected',
      task: {} as Task,
      message: error.message || "An unexpected error occurred"
    };
  }
};

// Get a task by ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};
