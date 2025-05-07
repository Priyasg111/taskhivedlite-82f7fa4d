
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Dashboard from "@/components/Dashboard";
import ProjectDashboard from "@/components/ProjectDashboard";
import MessageCenter from "@/components/MessageCenter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);

  // Fetch user type when the user is available
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user type:", error);
          return;
        }
        
        setUserType(data.user_type);
      } catch (err) {
        console.error("Failed to fetch user type:", err);
      }
    };
    
    fetchUserType();
  }, [user]);

  // Determine if user is a worker based on user_type
  const isWorkerType = userType === 'worker';
  
  // Determine if user is an employer based on user_type
  const isEmployerType = userType === 'employer';

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        {!user && (
          <div className="mb-12 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Complete Tasks, Earn Rewards - <span className="text-yellow-500">Verified by AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join TaskHive to work on microtasks from anywhere. Our AI system verifies your work, ensuring fair payment for quality results.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-muted/50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium mb-2">Flexible Work</h3>
                <p className="text-muted-foreground">Complete tasks anywhere, anytime. Work as much or as little as you want.</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium mb-2">Instant Verification</h3>
                <p className="text-muted-foreground">Our AI system verifies your work immediately, so you get paid faster.</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium mb-2">Crypto Payments</h3>
                <p className="text-muted-foreground">Receive payments in cryptocurrency directly to your wallet.</p>
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <Tabs defaultValue="available-tasks" className="space-y-8">
            <TabsList>
              <TabsTrigger value="available-tasks">Available Tasks</TabsTrigger>
              {isEmployerType && (
                <TabsTrigger value="projects">Projects</TabsTrigger>
              )}
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="payments">{isWorkerType ? "My Earnings" : "Payments"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available-tasks">
              <Dashboard />
            </TabsContent>
            
            {isEmployerType && (
              <TabsContent value="projects">
                <ProjectDashboard />
              </TabsContent>
            )}
            
            <TabsContent value="messages">
              <MessageCenter />
            </TabsContent>
            
            <TabsContent value="payments">
              <div className="py-4">
                <Link to="/payments" className="text-yellow-500 hover:underline">
                  Go to full {isWorkerType ? "earnings" : "payment"} dashboard →
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 TaskHive - AI-Verified Microtask Marketplace
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

export default Index;
