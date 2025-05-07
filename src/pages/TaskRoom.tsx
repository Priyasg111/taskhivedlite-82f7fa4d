import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, DollarSign, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // If user is not a worker, redirect to unauthorized page
        if (profileData.role !== 'worker') {
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
        
        {/* Task Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Tasks</CardTitle>
              <CardDescription>Tasks currently assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{metrics.activeTasks}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Completed Tasks</CardTitle>
              <CardDescription>Successfully verified tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{metrics.completedTasks}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Pending Reviews</CardTitle>
              <CardDescription>Tasks waiting for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{metrics.pendingReviews}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button 
            className="h-24 text-lg justify-start px-6" 
            onClick={() => navigate("/complete-tasks")}
          >
            <ArrowRight className="mr-2" />
            Browse New Tasks
          </Button>
          
          <Button 
            className="h-24 text-lg justify-start px-6" 
            variant="outline"
            onClick={() => navigate("/worker-dashboard")}
          >
            <FileText className="mr-2" />
            My Submissions
          </Button>
          
          <Button 
            className="h-24 text-lg justify-start px-6" 
            variant="outline"
            onClick={() => navigate("/payments")}
          >
            <DollarSign className="mr-2" />
            Earnings Summary
          </Button>
          
          <Button 
            className="h-24 text-lg justify-start px-6" 
            variant="outline"
            onClick={() => {}}
          >
            <User className="mr-2" />
            Edit Profile
          </Button>
        </div>
        
        {/* Recent Task Activity Feed */}
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4 mb-8">
          {activities.length > 0 ? (
            activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {activity.task_name?.substring(0, 2) || 'TA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No recent activity to display</p>
          )}
        </div>
        
        {/* Tasks Table */}
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'verified' ? 'bg-green-100 text-green-800' :
                        task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/complete-tasks/${task.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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

export default TaskRoom;
