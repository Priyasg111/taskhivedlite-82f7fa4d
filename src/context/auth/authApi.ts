
import { supabase } from "@/integrations/supabase/client";
import { CustomUser } from "@/types/auth";
import { formatUserWithMetadata } from '@/utils/authUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Logs in a user with email and password
 */
export const loginUser = async (email: string, password: string) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

/**
 * Signs up a new user
 */
export const signupUser = async (name: string, email: string, password: string, role: string = 'worker'): Promise<CustomUser | null> => {
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
  
  return formatUserWithMetadata(data.user);
};

/**
 * Logs out the current user
 */
export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

/**
 * Updates the user's experience
 */
export const updateUserExperience = async (userId: string, newExperience: number) => {
  return await supabase.auth.updateUser({
    data: { experience: newExperience }
  });
};

/**
 * Checks the verification status of a user
 */
export const checkUserVerificationStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  
  return data.kyc_status === 'verified';
};
