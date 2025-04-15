
import { supabase } from "@/integrations/supabase/client";
import { CustomUser } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export const createUserProfile = async (userId: string, email: string, role: string = 'worker'): Promise<void> => {
  try {
    console.log(`Creating user profile for ${userId} with role ${role}`);
    
    const { data, error } = await supabase.rpc('create_user_profile', {
      user_uuid: userId,
      user_email: email,
      user_role: role
    });
    
    if (error) {
      console.error('Profile creation failed:', error);
      toast({
        title: "Warning",
        description: "Account created but profile setup incomplete. Some features may be limited.",
        variant: "destructive"
      });
      throw error; // Throwing the error to be caught by the signup function
    } else {
      console.log("Profile creation successful:", data);
      toast({
        title: "Success",
        description: "Profile setup complete!",
      });
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw error;
  }
};

export const formatUserWithMetadata = (supabaseUser: User): CustomUser => {
  const customUser = supabaseUser as CustomUser;
  customUser.name = customUser.user_metadata?.name || '';
  customUser.experience = customUser.user_metadata?.experience || 0;
  return customUser;
};
