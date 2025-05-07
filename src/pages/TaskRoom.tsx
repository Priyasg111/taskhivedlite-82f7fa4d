
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import NavBar from "@/components/NavBar";
import TaskOverviewCards from "@/components/worker/TaskOverviewCards";
import TaskActionButtons from "@/components/worker/TaskActionButtons";
import ActivityFeed from "@/components/worker/ActivityFeed";
import TasksTable from "@/components/worker/TasksTable";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

type TaskActivity = {
  id: string;
  message: string;
  created_at: string;
  task_name?: string;
  task_id?: string;
};

type TaskItem = {
  id: string;
  title: string;
  deadline?: string;
  status: 'assigned' | 'submitted' | 'verified' | 'rejected';
};

const TaskRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    completedTasks: 0,
    pendingReviews: 0
  });
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Check user role
    const checkUserRole = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('role, user_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // If user is not a worker, redirect to unauthorized page
        if (profileData.role !== 'worker' && profileData.user_type !== 'worker') {
          navigate("/unauthorized");
          return;
        }
        
        // Continue loading data for worker
        fetchUserData();
      } catch (err) {
        console.error("Error checking user role:", err);
        navigate("/unauthorized");
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Extract first name from user metadata or email
      if (user.user_metadata?.name) {
        const nameParts = user.user_metadata.name.split(' ');
        setFirstName(nameParts[0]);
      } else if (user.email) {
        setFirstName(user.email.split('@')[0]);
      }
      
      // Fetch task metrics
      const { data: activeTasks, error: activeError } = await supabase
        .from('tasks')
        .select('id')
        .eq('worker_id', user.id)
        .in('status', ['open', 'assigned']);
        
      const { data: completedTasks, error: completedError } = await supabase
        .from('tasks')
        .select('id')
        .eq('worker_id', user.id)
        .eq('status', 'verified');
        
      const { data: pendingReviews, error: pendingError } = await supabase
        .from('tasks')
        .select('id')
        .eq('worker_id', user.id)
        .eq('status', 'submitted');
      
      if (!activeError && !completedError && !pendingError) {
        setMetrics({
          activeTasks: activeTasks?.length || 0,
          completedTasks: completedTasks?.length || 0,
          pendingReviews: pendingReviews?.length || 0
        });
      }
      
      // Fetch recent activities
      const { data: recentActivities, error: activityError } = await supabase
        .from('tasks')
        .select('id, title, status, updated_at')
        .eq('worker_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (!activityError && recentActivities) {
        const formattedActivities: TaskActivity[] = recentActivities.map(task => {
          let message = '';
          
          switch (task.status) {
            case 'assigned':
              message = `You were assigned task "${task.title}"`;
              break;
            case 'submitted':
              message = `You submitted task "${task.title}"`;
              break;
            case 'verified':
              message = `Task "${task.title}" was verified and completed`;
              break;
            case 'rejected':
              message = `Task "${task.title}" needs revision`;
              break;
            default:
              message = `Task "${task.title}" status updated to ${task.status}`;
          }
          
          return {
            id: task.id,
            message,
            created_at: task.updated_at,
            task_name: task.title,
            task_id: task.id
          };
        });
        
        setActivities(formattedActivities);
      }
      
      // Fetch current tasks
      const { data: currentTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .eq('worker_id', user.id)
        .in('status', ['assigned', 'submitted', 'verified'])
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!tasksError && currentTasks) {
        setTasks(currentTasks.map(task => ({
          id: task.id,
          title: task.title,
          deadline: new Date(new Date(task.created_at).getTime() + 7*24*60*60*1000).toISOString().split('T')[0],
          status: task.status as any
        })));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Welcome, {firstName} 👋</h1>
        <p className="text-muted-foreground mb-8">Your personal task dashboard</p>
        
        <TaskOverviewCards metrics={metrics} />
        <TaskActionButtons />
        
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <ActivityFeed activities={activities} />
        
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
        <TasksTable tasks={tasks} />
      </main>
      <Footer />
    </div>
  );
};

export default TaskRoom;
