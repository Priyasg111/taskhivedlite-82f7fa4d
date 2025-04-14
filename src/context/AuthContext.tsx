
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extend the Supabase User type to include our custom metadata
interface CustomUser extends SupabaseUser {
  name?: string;
  experience: number;
  user_metadata: {
    name?: string;
    experience?: number;
  };
}

interface AuthContextType {
  user: CustomUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateExperience: (hours: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        if (session?.user) {
          // Type cast and ensure user with metadata is properly set
          const customUser = session.user as CustomUser;
          // Make sure name and experience are directly accessible
          customUser.name = customUser.user_metadata?.name || '';
          customUser.experience = customUser.user_metadata?.experience || 0;
          setUser(customUser);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Type cast and ensure user with metadata is properly set
        const customUser = session.user as CustomUser;
        // Make sure name and experience are directly accessible
        customUser.name = customUser.user_metadata?.name || '';
        customUser.experience = customUser.user_metadata?.experience || 0;
        setUser(customUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Starting signup process for:", email);
      
      // First, attempt user creation
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            experience: 0 // New users start with 0 hours
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Signup Error Details:', error);
        throw error;
      }
      
      console.log("Signup response:", data);
      
      // In case auto-confirmation is enabled
      if (data.user) {
        // Type cast and add the properties
        const customUser = data.user as CustomUser;
        customUser.name = name;
        customUser.experience = 0;
        setUser(customUser);
        
        console.log("User created successfully:", customUser.id);
      }
      
      // Don't return data here - this fixes the TypeScript error
    } catch (error: any) {
      console.error('Signup Catch Block Error:', error);
      
      // Check for specific error patterns
      if (error.message?.includes("User already registered")) {
        throw new Error("This email is already registered. Please try logging in instead.");
      } else if (error.message?.includes("permission denied") || error.message?.includes("Database error")) {
        // This might be a permission issue with user_profiles - try to handle gracefully
        console.error("Database permission error detected");
        throw new Error("Unable to complete signup. The system is currently experiencing issues. Please try again later.");
      } else {
        throw new Error(error.message || "Failed to create account");
      }
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
          // Update the user with the new experience
          const updatedUser = { ...user } as CustomUser;
          updatedUser.experience = newExperience;
          updatedUser.user_metadata.experience = newExperience;
          setUser(updatedUser);
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signup, logout, updateExperience }}>
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
