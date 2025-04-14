
import { useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from '@/types/task';

interface AdminDataProviderProps {
  children: (props: {
    tasks: Task[];
    loading: boolean;
    processingTask: string | null;
    approveTask: (taskId: string) => Promise<void>;
    rejectTask: (taskId: string) => Promise<void>;
  }) => ReactNode;
}

const AdminDataProvider = ({ children }: AdminDataProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const { data: taskData, error } = await supabase
        .from('tasks')
        .select('*')
        .in('status', ['completed', 'verified', 'rejected']);
        
      if (error) throw error;

      // Enhance tasks with client and worker data
      const enhancedTasks: Task[] = [];
      
      for (const task of taskData || []) {
        const enhancedTask: Task = { ...task };
        
        // Get client info if client_id exists
        if (task.client_id) {
          const { data: clientData } = await supabase
            .from('auth')
            .select('email, raw_user_meta_data')
            .eq('id', task.client_id)
            .single();
            
          if (clientData) {
            enhancedTask.client_email = clientData.email;
            enhancedTask.client_name = clientData.raw_user_meta_data?.name || 'Unknown Client';
          }
        }
        
        // Get worker info if worker_id exists
        if (task.worker_id) {
          const { data: workerData } = await supabase
            .from('auth')
            .select('email, raw_user_meta_data')
            .eq('id', task.worker_id)
            .single();
            
          if (workerData) {
            enhancedTask.worker_email = workerData.email;
            enhancedTask.worker_name = workerData.raw_user_meta_data?.name || 'Unknown Worker';
          }
          
          // Get worker wallet info
          const { data: walletData } = await supabase
            .from('user_profiles')
            .select('wallet_address, wallet_status')
            .eq('id', task.worker_id)
            .single();
            
          if (walletData) {
            enhancedTask.worker_wallet_address = walletData.wallet_address;
            enhancedTask.worker_wallet_status = walletData.wallet_status;
          }
        }
        
        enhancedTasks.push(enhancedTask);
      }
      
      setTasks(enhancedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveTask = async (taskId: string) => {
    try {
      setProcessingTask(taskId);
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'verified',
          payment_status: 'pending'
        })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'verified', payment_status: 'pending' } 
          : task
      ));
      
      toast({
        title: "Task approved",
        description: "The task has been verified and is ready for payment",
      });
    } catch (error) {
      console.error("Error approving task:", error);
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive",
      });
    } finally {
      setProcessingTask(null);
    }
  };

  const rejectTask = async (taskId: string) => {
    try {
      setProcessingTask(taskId);
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'rejected',
          payment_status: 'rejected'
        })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'rejected', payment_status: 'rejected' } 
          : task
      ));
      
      toast({
        title: "Task rejected",
        description: "The task has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast({
        title: "Error",
        description: "Failed to reject task",
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
