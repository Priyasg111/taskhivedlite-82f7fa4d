
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { CustomUser } from '@/types/auth';
import AuthContext from './AuthContext';
import { useAuthState } from './useAuthState';
import { loginUser, signupUser, logoutUser, updateUserExperience } from './authApi';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isLoading, isVerified, setUser } = useAuthState();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const { user } = await loginUser(email, password);
      
      // After login, check verification status in useAuthState will handle this
      
      // If the user is not verified, we'll show a message in useAuthState
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in");
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = 'worker', userType: string = 'worker'): Promise<CustomUser | null> => {
    try {
      const customUser = await signupUser(name, email, password, role, userType);
      setUser(customUser);
      
      // New users are not verified by default
      
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
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateExperience = (hours: number) => {
    if (user) {
      const currentExperience = user.experience || 0;
      const newExperience = currentExperience + hours;
      
      updateUserExperience(user.id, newExperience).then(({ data, error }) => {
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
