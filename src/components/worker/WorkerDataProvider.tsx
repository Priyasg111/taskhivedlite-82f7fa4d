
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

interface WorkerDataProviderProps {
  children: (data: {
    walletAddress: string;
    walletStatus: "verified" | "unverified" | "none";
    pendingPayouts: Task[];
    setWalletAddress: (address: string) => void;
    setWalletStatus: (status: "verified" | "unverified" | "none") => void;
    isLoading: boolean;
  }) => React.ReactNode;
}

const WorkerDataProvider = ({ children }: WorkerDataProviderProps) => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"verified" | "unverified" | "none">("none");
  const [pendingPayouts, setPendingPayouts] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setIsLoading(true);
      
      try {
        // Load wallet info
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select("wallet_address, wallet_status")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData?.wallet_address) {
          setWalletAddress(profileData.wallet_address);
          setWalletStatus((profileData.wallet_status as "verified" | "unverified" | "none") || "unverified");
        }
        
        // Load pending payouts
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq("worker_id", user.id)
          .eq("status", "verified")
          .eq("payment_status", "pending");
          
        if (taskError) throw taskError;
        
        // Enhance task data with client information
        const enhancedTasks: Task[] = [];
        
        for (const task of taskData || []) {
          const enhancedTask: Task = { ...task };
          
          // Get client info if client_id exists
          if (task.client_id) {
            const { data: userData } = await supabase
              .from('auth')
              .select('email, raw_user_meta_data')
              .eq('id', task.client_id)
              .single();
              
            if (userData) {
              enhancedTask.client_email = userData.email;
              enhancedTask.client_name = userData.raw_user_meta_data?.name || 'Unknown Client';
            }
          }
          
          enhancedTasks.push(enhancedTask);
        }
        
        setPendingPayouts(enhancedTasks);
      } catch (error) {
        console.error("Error loading worker data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  return (
    <>
      {children({
        walletAddress,
        walletStatus,
        pendingPayouts,
        setWalletAddress,
        setWalletStatus,
        isLoading
      })}
    </>
  );
};

export default WorkerDataProvider;
