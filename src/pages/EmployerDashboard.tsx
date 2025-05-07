
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    credits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!user) return;
      
      try {
        // Fetch task stats
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('status')
          .eq('client_id', user.id);
          
        if (taskError) throw taskError;
        
        const activeTasks = taskData.filter(task => task.status === 'active').length;
        const completedTasks = taskData.filter(task => task.status === 'verified').length;
        const pendingTasks = taskData.filter(task => task.status === 'pending').length;
        
        // Fetch credits
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setStats({
          activeTasks,
          completedTasks,
          pendingTasks,
          credits: profileData.credits || 0
        });
      } catch (error) {
        console.error('Error fetching employer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployerData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Post tasks, review completed work, and manage your projects.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats.activeTasks}</CardTitle>
                  <CardDescription>Active Tasks</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats.completedTasks}</CardTitle>
                  <CardDescription>Completed Tasks</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats.pendingTasks}</CardTitle>
                  <CardDescription>Pending Review</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats.credits}</CardTitle>
                  <CardDescription>Available Credits</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/post-task">Post New Task</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/payment-setup">Buy Credits</Link>
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Tasks you've posted recently</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Task list would go here */}
                <div className="text-center py-12 text-muted-foreground">
                  <p>You don't have any tasks yet.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/post-task">Post your first task</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 TaskHived - AI-Verified Microtask Marketplace
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployerDashboard;
