
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BadgeIcon from "./BadgeIcon";

const NavbarBadge = () => {
  const { user } = useAuth();
  const [badgeLevel, setBadgeLevel] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserBadge = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('badge_level')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setBadgeLevel(data?.badge_level || 'beginner');
      } catch (error) {
        console.error("Error fetching user badge:", error);
      }
    };
    
    fetchUserBadge();
    
    // Subscribe to real-time updates for the user's profile
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user?.id}`
        },
        (payload) => {
          setBadgeLevel(payload.new.badge_level);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  if (!user || !badgeLevel) return null;
  
  return <BadgeIcon level={badgeLevel} size="sm" showLabel={false} />;
};

export default NavbarBadge;
