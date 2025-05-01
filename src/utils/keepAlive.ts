
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a lightweight ping to Supabase to keep the connection alive
 * This prevents cold starts and keeps the service responsive
 */
export const pingSupabase = async (): Promise<void> => {
  try {
    // Instead of using an RPC function, we'll invoke our edge function
    const { data, error } = await supabase.functions.invoke('get-timestamp');
    
    if (error) {
      // Log error silently - don't expose to users
      console.debug('Supabase keep-alive ping error:', error.message);
    } else {
      console.debug('Supabase keep-alive ping successful', data?.timestamp);
    }
  } catch (err) {
    // Silent error handling to avoid affecting users
    console.debug('Error in keep-alive ping:', err);
  }
};
