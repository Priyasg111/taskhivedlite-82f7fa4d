
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { CustomUser } from '@/types/auth';
import { formatUserWithMetadata } from '@/utils/authUtils';
import { checkUserVerificationStatus } from './authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useAuthState = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const checkVerificationStatus = async (userId: string) => {
    try {
      const isUserVerified = await checkUserVerificationStatus(userId);
      setIsVerified(isUserVerified);
      
      if (!isUserVerified) {
        // If on a protected route and not verified, redirect to verification page
        const protectedRoutes = ['/payments-dashboard', '/complete-tasks'];
        const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
        
        if (isProtectedRoute) {
          toast({
            title: "Verification Required",
            description: "Please complete identity verification to access this feature",
            variant: "destructive"
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        if (session?.user) {
          const customUser = formatUserWithMetadata(session.user);
          setUser(customUser);
          
          // Check verification status whenever auth changes
          checkVerificationStatus(customUser.id);
        } else {
          setUser(null);
          setIsVerified(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const customUser = formatUserWithMetadata(session.user);
        setUser(customUser);
        
        // Check verification status on initial load
        checkVerificationStatus(customUser.id);
      } else {
        setUser(null);
        setIsVerified(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { user, session, isLoading, isVerified, setUser };
};
