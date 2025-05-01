
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a lightweight ping to Supabase to keep the connection alive
 * This prevents cold starts and keeps the service responsive
 */
export const pingSupabase = async (): Promise<void> => {
  try {
    // Making a minimal query that doesn't affect any data
    // Just checking the connection by getting the server timestamp
    const { error } = await supabase.rpc('get_server_timestamp');
    
    if (error) {
      // Log error silently - don't expose to users
      console.debug('Supabase keep-alive ping error:', error.message);
    } else {
      console.debug('Supabase keep-alive ping successful');
    }
  } catch (err) {
    // Silent error handling to avoid affecting users
    console.debug('Error in keep-alive ping:', err);
  }
};
