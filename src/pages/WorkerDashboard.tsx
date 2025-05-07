
import NavBar from "@/components/NavBar";
import WorkerDataProvider from "@/components/worker/WorkerDataProvider";
import WalletConnect from "@/components/worker/WalletConnect";
import PayoutsList from "@/components/worker/PayoutsList";
import RecentPayouts from "@/components/worker/RecentPayouts";
import UserBadge from "@/components/user/UserBadge";
import { useAuth } from "@/context/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    badge_level: string;
    verified_tasks: number;
    avg_score: number;
  } | null>(null);
  const [recentComment, setRecentComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('badge_level, verified_tasks, avg_score')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Fetch most recent verified task comment
        const { data: recentTaskData, error: taskError } = await supabase
          .from('tasks')
          .select('comment')
          .eq('worker_id', user.id)
          .eq('status', 'verified')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!taskError && recentTaskData) {
          setRecentComment(recentTaskData.comment);
        }
        
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching user profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfileData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks, track your earnings, and view your performance.
          </p>
        </div>
        
        <WorkerDataProvider>
          {({ 
            walletAddress, 
            walletStatus, 
            pendingPayouts, 
            setWalletAddress, 
            setWalletStatus,
            isLoading
          }) => (
            <div className="space-y-6">
              {isLoading || loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  {userProfile && (
                    <UserBadge 
                      badgeLevel={userProfile.badge_level || 'beginner'} 
                      verifiedTasks={userProfile.verified_tasks || 0}
                      avgScore={userProfile.avg_score || 0}
                      recentComment={recentComment || undefined}
                    />
                  )}
                  <WalletConnect
                    walletAddress={walletAddress}
                    walletStatus={walletStatus}
                    setWalletAddress={setWalletAddress}
                    setWalletStatus={setWalletStatus}
                  />
                  <PayoutsList pendingPayouts={pendingPayouts} />
                  <RecentPayouts />
                </>
              )}
            </div>
          )}
        </WorkerDataProvider>
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

export default WorkerDashboard;
