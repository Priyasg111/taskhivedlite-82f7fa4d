
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

interface AdminDataProviderProps {
  children: (props: {
    tasks: Task[];
    loading: boolean;
    processingTask: string | null;
    approveTask: (taskId: string) => Promise<void>;
    rejectTask: (taskId: string) => Promise<void>;
  }) => React.ReactNode;
}

const AdminDataProvider = ({ children }: AdminDataProviderProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      // Get all tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select("*")
        .order("updated_at", { ascending: false });
        
      if (tasksError) throw tasksError;
      
      // Get additional user information separately
      const enhancedTasks: Task[] = [];
      
      for (const task of tasksData || []) {
        const enhancedTask: Task = { ...task };
        
        // Get client info if client_id exists
        if (task.client_id) {
          try {
            const { data: clientData, error: clientError } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', task.client_id)
              .single();
              
            if (!clientError && clientData) {
              enhancedTask.client_email = clientData.email;
              enhancedTask.client_name = clientData.full_name || 'Unknown Client';
            }
          } catch (error) {
            console.error("Error fetching client data:", error);
          }
        }
        
        // Get worker info if worker_id exists
        if (task.worker_id) {
          try {
            const { data: workerData, error: workerError } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', task.worker_id)
              .single();
              
            if (!workerError && workerData) {
              enhancedTask.worker_email = workerData.email;
              enhancedTask.worker_name = workerData.full_name || 'Unknown Worker';
            }
          } catch (error) {
            console.error("Error fetching worker data:", error);
          }
          
          // Get worker wallet info
          try {
            const { data: workerProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('wallet_address, wallet_status')
              .eq('id', task.worker_id)
              .single();
              
            if (!profileError && workerProfile) {
              enhancedTask.worker_wallet_address = workerProfile.wallet_address;
              enhancedTask.worker_wallet_status = workerProfile.wallet_status;
            }
          } catch (error) {
            console.error("Error fetching worker profile:", error);
          }
        }
        
        enhancedTasks.push(enhancedTask);
      }
      
      setTasks(enhancedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const approveTask = async (taskId: string) => {
    setProcessingTask(taskId);
    try {
      // Update task status
      const { error } = await supabase
        .from('tasks')
        .update({
          status: "verified",
          payment_status: "pending",
        })
        .eq("id", taskId);
        
      if (error) throw error;
      
      // Trigger payout flow via webhook to Make/Zebec
      const task = tasks.find(t => t.id === taskId);
      const workerWalletAddress = task?.worker_wallet_address;
      
      if (workerWalletAddress) {
        // In a real implementation, this would call an edge function to trigger Make/Zebec
        // For demo purposes, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the task payment status
        await supabase
          .from('tasks')
          .update({
            payment_status: "processing",
          })
          .eq("id", taskId);
          
        toast({
          title: "Payout initiated",
          description: "USDC payment is being processed via Zebec.",
        });
      }
      
      await loadTasks();
    } catch (error) {
      console.error("Error approving task:", error);
      toast({
        title: "Error",
        description: "Failed to approve task.",
        variant: "destructive",
      });
    } finally {
      setProcessingTask(null);
    }
  };
  
  const rejectTask = async (taskId: string) => {
    setProcessingTask(taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: "rejected",
        })
        .eq("id", taskId);
        
      if (error) throw error;
      
      toast({
        title: "Task rejected",
        description: "The task has been rejected and sent back to the worker.",
      });
      
      await loadTasks();
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast({
        title: "Error",
        description: "Failed to reject task.",
        variant: "destructive",
      });
    } finally {
      setProcessingTask(null);
    }
  };

  return (
    <>
      {children({
        tasks,
        loading,
        processingTask,
        approveTask,
        rejectTask
      })}
    </>
  );
};

export default AdminDataProvider;
