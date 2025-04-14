
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from "@/components/NavBar";
import ClientDashboard from "@/components/ClientDashboard";
import WorkerDashboard from "@/components/WorkerDashboard";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define the interface to match our database table
interface UserProfile {
  id: string;
  role: 'admin' | 'client' | 'worker';
  credits: number;
  wallet_address: string | null;
  wallet_status: string | null;
  created_at: string;
  updated_at: string;
}

const PaymentsDashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<"admin" | "client" | "worker" | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Fetch user role from database
    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        // Set user role (default to worker if not specified)
        setUserRole((data?.role as "admin" | "client" | "worker") || "worker");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("worker"); // Default
      }
    };
    
    fetchUserRole();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payments Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {userRole === "client" 
              ? "Manage your task credits and payment history."
              : userRole === "worker" 
                ? "Connect your wallet and track your earnings."
                : "Manage tasks, workers, and payments."}
          </p>
        </div>
        
        {userRole === "admin" ? (
          <AdminPanel />
        ) : (
          <Tabs defaultValue={userRole === "client" ? "client" : "worker"} className="space-y-8">
            <TabsList>
              {userRole === "client" && <TabsTrigger value="client">Client Dashboard</TabsTrigger>}
              {(userRole === "worker" || !userRole) && <TabsTrigger value="worker">Worker Dashboard</TabsTrigger>}
            </TabsList>
            
            {userRole === "client" && (
              <TabsContent value="client">
                <ClientDashboard />
              </TabsContent>
            )}
            
            {(userRole === "worker" || !userRole) && (
              <TabsContent value="worker">
                <WorkerDashboard />
              </TabsContent>
            )}
          </Tabs>
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

export default PaymentsDashboard;
