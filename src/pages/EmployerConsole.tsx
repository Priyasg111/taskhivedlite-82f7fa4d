import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Star, Plus, List, Settings, BarChart2, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EmployerConsole = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    tasks: 0,
    workers: 0,
    reviews: 0
  });
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    action: string;
    description: string;
    timestamp: Date;
  }>>([]);
  const [workers, setWorkers] = useState<Array<{
    id: string;
    name: string;
    currentTask: string | null;
    status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

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
        
        // If user is not an employer/client, redirect to unauthorized page
        if (profileData.role !== 'employer' && profileData.role !== 'client') {
          navigate("/unauthorized");
          return;
        }
        
        // Continue loading data for employer
        fetchEmployerData();
      } catch (err) {
        console.error("Error checking user role:", err);
        navigate("/unauthorized");
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const fetchEmployerData = async () => {
    if (!user) return;
    
    try {
      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        // Extract username from email
        const email = profileData.email || '';
        const userName = email.split('@')[0] || 'Employer';
        setUserName(userName);
      }

      // For demo purposes, set some mock data
      setMetrics({
        tasks: 12,
        workers: 8,
        reviews: 24
      });

      setRecentActivities([
        { 
          id: '1', 
          action: 'Task Completed', 
          description: 'Data entry task completed by John D.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
        },
        { 
          id: '2', 
          action: 'Task Verified', 
          description: 'Content review passed AI verification',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) 
        },
        { 
          id: '3', 
          action: 'Worker Joined', 
          description: 'Sarah M. accepted your task invitation',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) 
        },
        { 
          id: '4', 
          action: 'Payment Processed', 
          description: 'Successfully paid out 5 completed tasks',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
        }
      ]);

      setWorkers([
        { id: '1', name: 'John Doe', currentTask: 'Data Entry for Q1 Reports', status: 'In Progress' },
        { id: '2', name: 'Sarah Miller', currentTask: 'Content Translation', status: 'In Progress' },
        { id: '3', name: 'David Wilson', currentTask: null, status: 'Available' },
        { id: '4', name: 'Emily Brown', currentTask: 'Image Tagging', status: 'In Progress' },
        { id: '5', name: 'Michael Jones', currentTask: null, status: 'Available' }
      ]);
    } catch (error) {
      console.error('Error fetching employer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
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
      <div className="flex-1 flex">
        {/* Optional Sidebar */}
        <div className="hidden md:block w-64 bg-sidebar-background text-sidebar-foreground border-r p-4">
          <div className="space-y-2 py-4">
            <h2 className="text-lg font-semibold px-4 mb-2">Employer Console</h2>
            <div className="space-y-1">
              <Link to="/employer-console" className="flex items-center py-2 px-4 rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                <Activity className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/employer-dashboard" className="flex items-center py-2 px-4 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Tasks</span>
              </Link>
              <Link to="/payments" className="flex items-center py-2 px-4 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                <span>Payments</span>
              </Link>
              <Link to="/profile" className="flex items-center py-2 px-4 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome Text */}
              <div>
                <h1 className="text-3xl font-bold">Welcome, {userName || 'Employer'}</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your tasks and workers from this dashboard.
                </p>
              </div>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl flex items-center">
                      <Briefcase className="mr-2 h-6 w-6 text-primary" />
                      {metrics.tasks}
                    </CardTitle>
                    <CardDescription>Active Tasks</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl flex items-center">
                      <Users className="mr-2 h-6 w-6 text-primary" />
                      {metrics.workers}
                    </CardTitle>
                    <CardDescription>Active Workers</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl flex items-center">
                      <Star className="mr-2 h-6 w-6 text-primary" />
                      {metrics.reviews}
                    </CardTitle>
                    <CardDescription>Reviews</CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild className="flex flex-col items-center justify-center h-24 text-base">
                  <Link to="/post-task">
                    <Plus className="h-8 w-8 mb-2" />
                    Post Task
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex flex-col items-center justify-center h-24 text-base">
                  <Link to="/employer-dashboard">
                    <List className="h-8 w-8 mb-2" />
                    View Tasks
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex flex-col items-center justify-center h-24 text-base">
                  <Link to="/workers">
                    <Users className="h-8 w-8 mb-2" />
                    Manage Workers
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex flex-col items-center justify-center h-24 text-base">
                  <Link to="/insights">
                    <BarChart2 className="h-8 w-8 mb-2" />
                    Insights
                  </Link>
                </Button>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" /> 
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start pb-4 border-b last:border-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {recentActivities.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Workers Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Active Workers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Current Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workers.map((worker) => (
                          <TableRow key={worker.id}>
                            <TableCell className="font-medium">{worker.name}</TableCell>
                            <TableCell>{worker.currentTask || 'None'}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                worker.status === 'In Progress' 
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                              }`}>
                                {worker.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Message</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
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

export default EmployerConsole;
