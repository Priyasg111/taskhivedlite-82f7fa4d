
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
 * Checks if an email is already registered
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Perform a direct database query for case-insensitive email check
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email')
      .ilike('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
    
    // If we got data back, the email exists
    return !!data;
  } catch (err) {
    console.error("Exception checking email:", err);
    return false;
  }
};

/**
 * Signs up a new user
 */
export const signupUser = async (name: string, email: string, password: string, role: string = 'worker'): Promise<CustomUser | null> => {
  // First check if the email already exists
  const emailExists = await checkEmailExists(email);
  
  if (emailExists) {
    throw new Error("This email is already registered. Please log in instead or reset your password.");
  }
  
  // Sanitize and normalize role input to avoid any potential database type issues
  const safeRole = role === 'client' ? 'client' : 'worker';
  
  console.log("Starting signup for user with email:", email, "and role:", safeRole);
  
  try {
    // First, create the user with basic auth info
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          experience: 0,
          role: safeRole,
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
    
    console.log("User created successfully:", data.user.id);
    
    // Now create a user profile explicitly
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: email,
          role: safeRole,
          credits: 0,
          badge_level: 'beginner'
        });
        
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't throw here, we still want to continue with the welcome email
      } else {
        console.log("User profile created successfully");
      }
    } catch (profileErr) {
      console.error("Exception creating user profile:", profileErr);
      // Don't throw here, we still want to continue with the welcome email
    }

    try {
      console.log("Attempting to send welcome email to:", email);
      
      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: JSON.stringify({
          name,
          email,
          role: safeRole,
          welcomeType: "initial"
        })
      });
      
      if (emailError) {
        console.error("Error sending welcome email:", emailError);
      } else {
        console.log("Welcome email sent successfully");
      }
    } catch (emailError) {
      console.error("Exception sending welcome email:", emailError);
    }
    
    return formatUserWithMetadata(data.user);
  } catch (error) {
    console.error("Signup process failed:", error);
    throw error;
  }
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
