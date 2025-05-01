
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a lightweight query to the profiles table to keep the Supabase connection alive
 * This prevents cold starts and keeps the service responsive
 */
export const pingSupabase = async (): Promise<void> => {
  try {
    // Performing a lightweight query to the profiles table
    // Just selecting a single ID with a limit of 1
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      // Log error silently - don't expose to users
      console.debug('Supabase keep-alive ping error:', error.message);
    } else {
      console.debug('Supabase keep-alive ping successful', new Date().toISOString());
    }
  } catch (err) {
    // Silent error handling to avoid affecting users
    console.debug('Error in keep-alive ping:', err);
  }
};
