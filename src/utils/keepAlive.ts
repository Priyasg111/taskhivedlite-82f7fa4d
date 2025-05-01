
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

/**
 * Checks if Supabase is online by pinging an endpoint
 * @param onOnline Callback that fires when Supabase comes online
 * @returns Function to cancel the check
 */
export const checkSupabaseOnline = (onOnline?: () => void): () => void => {
  const interval = 10 * 1000; // 10 seconds
  let intervalId: number | null = null;
  
  // Function to ping Supabase
  const checkConnection = async () => {
    try {
      console.debug('Checking if Supabase is online...');
      
      // Using the edge function we already have
      const { data, error } = await supabase.functions.invoke('get-timestamp');
      
      // If we get a response (even with an error), Supabase is online
      if (data || (error && error.status !== 0)) {
        console.debug('Supabase is online!', data);
        
        // Clear the interval since we've confirmed Supabase is online
        if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
        
        // Call the onOnline callback if provided
        if (onOnline) {
          onOnline();
        }
      }
    } catch (err) {
      // If we get here, Supabase is likely still offline
      console.debug('Supabase appears to be offline:', err);
    }
  };
  
  // Start checking immediately
  checkConnection();
  
  // Then check every 10 seconds
  intervalId = window.setInterval(checkConnection, interval);
  
  // Return a function to cancel the check
  return () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
  };
};
