
import { supabase } from "@/integrations/supabase/client";
import { CustomUser } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

/**
 * Attempts to create a user profile after signup
 */
export const createUserProfile = async (userId: string, email: string, role: string = 'worker'): Promise<void> => {
  // Let's check if user_profiles entry was created
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select()
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Profile check error:', profileError);
    // If profile doesn't exist, try to create it manually
    if (profileError.code === 'PGRST116') {
      console.log("Profile not found, creating manually...");
      
      // Try using RPC function with proper type casting for both return and params
      const { error: insertError } = await supabase.rpc<{id: string, email: string, role: string}, {
        user_uuid: string;
        user_email: string;
        user_role: string;
      }>('create_user_profile', {
        user_uuid: userId,
        user_email: email,
        user_role: role
      });
      
      if (insertError) {
        console.error('Manual profile creation failed:', insertError);
        console.log("Trying direct insert as fallback...");
        
        // Fallback to direct insert if RPC fails
        const { error: directInsertError } = await supabase
          .from('user_profiles')
          .insert([{ 
            id: userId, 
            email: email,
            role: role, 
            experience: 0,
            credits: 0
          }]);
          
        if (directInsertError) {
          console.error('Direct insert failed:', directInsertError);
          toast({
            title: "Warning",
            description: "Account created but profile setup incomplete. Some features may be limited.",
            variant: "destructive"
          });
        } else {
          console.log("Direct profile creation successful");
        }
      } else {
        console.log("RPC profile creation successful");
      }
    }
  } else {
    console.log("User profile exists:", profileData);
  }
};

/**
 * Formats a user object with proper metadata
 */
export const formatUserWithMetadata = (supabaseUser: User): CustomUser => {
  // Type cast and ensure user with metadata is properly set
  const customUser = supabaseUser as CustomUser;
  // Make sure name and experience are directly accessible
  customUser.name = customUser.user_metadata?.name || '';
  customUser.experience = customUser.user_metadata?.experience || 0;
  return customUser;
};
