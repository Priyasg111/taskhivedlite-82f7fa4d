
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          clients:client_id(name, email),
          workers:worker_id(name, email, user_profiles(wallet_address, wallet_status))
        `)
        .order("updated_at", { ascending: false });
        
      if (error) throw error;
      setTasks(data || []);
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
        .from("tasks")
        .update({
          status: "verified",
          payment_status: "pending",
        })
        .eq("id", taskId);
        
      if (error) throw error;
      
      // Trigger payout flow via webhook to Make/Zebec
      const task = tasks.find(t => t.id === taskId);
      const workerWalletAddress = task?.workers?.user_profiles?.wallet_address;
      
      if (workerWalletAddress) {
        // In a real implementation, this would call an edge function to trigger Make/Zebec
        // For demo purposes, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the task payment status
        await supabase
          .from("tasks")
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
        .from("tasks")
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              {loading ? (
                <div className="text-center p-4">Loading tasks...</div>
              ) : tasks.filter(t => t.status === "completed").length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No tasks pending review
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks
                    .filter(t => t.status === "completed")
                    .map(task => (
                      <div key={task.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              By {task.workers?.name || "Unknown worker"}
                            </p>
                          </div>
                          <Badge>Pending Review</Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm">
                            Client: {task.clients?.name || "Unknown"}
                          </p>
                          <p className="text-sm">
                            Payment: ${task.payment?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm">
                            Time Taken: {task.time_taken || "0"} minutes
                          </p>
                        </div>
                        
                        {!task.workers?.user_profiles?.wallet_address && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <p className="text-xs text-yellow-800">
                              Worker has not connected a wallet yet. Approval will be on hold.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => rejectTask(task.id)}
                            disabled={!!processingTask}
                          >
                            {processingTask === task.id ? "Processing..." : "Reject"}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => approveTask(task.id)}
                            disabled={!!processingTask || !task.workers?.user_profiles?.wallet_address}
                          >
                            {processingTask === task.id ? "Processing..." : "Approve & Pay"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="verified" className="mt-4">
              {loading ? (
                <div className="text-center p-4">Loading tasks...</div>
              ) : tasks.filter(t => t.status === "verified").length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No verified tasks
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks
                    .filter(t => t.status === "verified")
                    .map(task => (
                      <div key={task.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              By {task.workers?.name || "Unknown worker"}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm">
                            Client: {task.clients?.name || "Unknown"}
                          </p>
                          <p className="text-sm">
                            Payment: ${task.payment?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm">
                            Payment Status: {task.payment_status || "pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-4">
              {loading ? (
                <div className="text-center p-4">Loading tasks...</div>
              ) : tasks.filter(t => t.status === "rejected").length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No rejected tasks
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks
                    .filter(t => t.status === "rejected")
                    .map(task => (
                      <div key={task.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              By {task.workers?.name || "Unknown worker"}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
