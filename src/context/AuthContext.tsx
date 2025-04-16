
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { AuthContextType, CustomUser } from '@/types/auth';
import { formatUserWithMetadata } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const navigate = useNavigate();

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
  }, []);
  
  const checkVerificationStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('kyc_status')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      const isUserVerified = data.kyc_status === 'verified';
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // After login, check verification status
      if (data.user) {
        await checkVerificationStatus(data.user.id);
        
        // If the user is not verified, show a message
        if (!isVerified) {
          toast({
            title: "Verification Required",
            description: "Please complete identity verification to access all features",
            variant: "default" // Changed from "warning" to "default"
          });
        }
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = 'worker'): Promise<CustomUser | null> => {
    setIsLoading(true);
    
    try {
      // First check if the email already exists by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If we don't get a "user not found" error, then the user likely exists
      if (!signInError || !signInError.message.includes("user not found")) {
        throw new Error("This email is already registered. Please try logging in instead.");
      }
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            experience: 0,
            role,
            verified: false
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Failed to create user account");
      }

      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: JSON.stringify({
            name,
            email,
            role,
            welcomeType: "initial"
          })
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      
      const customUser = formatUserWithMetadata(data.user);
      setUser(customUser);
      
      // New users are not verified by default
      setIsVerified(false);
      
      toast({
        title: "Success!",
        description: "Your account has been created successfully. Please complete identity verification.",
      });
      
      // Redirect to verification page after signup
      navigate('/');
      
      return customUser;
    } catch (error: any) {
      console.error("Signup process error:", error);
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        throw new Error("This email is already registered. Please try logging in instead.");
      }
      throw new Error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateExperience = (hours: number) => {
    if (user) {
      const currentExperience = user.experience || 0;
      const newExperience = currentExperience + hours;
      
      supabase.auth.updateUser({
        data: { experience: newExperience }
      }).then(({ data, error }) => {
        if (error) {
          console.error("Error updating experience:", error);
        } else if (data.user) {
          const updatedUser = { ...user } as CustomUser;
          updatedUser.experience = newExperience;
          updatedUser.user_metadata.experience = newExperience;
          setUser(updatedUser);
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isVerified, 
      login, 
      signup, 
      logout, 
      updateExperience 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
