
import { Loader } from "lucide-react";
import WorkerDataProvider from "./worker/WorkerDataProvider";
import WalletConnect from "./worker/WalletConnect";
import PayoutsList from "./worker/PayoutsList";
import RecentPayouts from "./worker/RecentPayouts";
import UserBadge from "./user/UserBadge";
import { useAuth } from "@/context/AuthContext";
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
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
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
  );
};

export default WorkerDashboard;
