
import { useEffect, useRef, useState } from 'react';
import { pingSupabase, checkSupabaseOnline } from '@/utils/keepAlive';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to keep Supabase connection alive with periodic pings
 * @param interval Ping interval in milliseconds (default: 5 minutes)
 * @param checkOnline Whether to check if Supabase is online
 */
export const useKeepAlive = (interval = 5 * 60 * 1000, checkOnline = true) => {
  const timerRef = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  useEffect(() => {
    // Initial ping
    pingSupabase();
    
    // Set up recurring ping
    timerRef.current = window.setInterval(() => {
      pingSupabase();
    }, interval);
    
    // Check if Supabase is online if requested
    let cancelCheck: (() => void) | null = null;
    
    if (checkOnline) {
      // Start checking if Supabase is online
      cancelCheck = checkSupabaseOnline(() => {
        setIsOnline(true);
        // Show a toast notification when Supabase comes back online
        toast({
          title: "Connection Restored",
          description: "The connection to the server has been restored.",
          variant: "default"
        });
      });
      
      // Set up an error handler for the Supabase client
      const originalFetch = window.fetch;
      let consecutiveErrors = 0;
      
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          // If the request is going to Supabase and succeeds, reset consecutive errors
          if (args[0].toString().includes('supabase.co') && response.ok) {
            consecutiveErrors = 0;
          }
          
          return response;
        } catch (error) {
          // If the request is going to Supabase, increment consecutive errors
          if (args[0].toString().includes('supabase.co')) {
            consecutiveErrors++;
            
            // If we've had multiple consecutive errors, assume Supabase is offline
            if (consecutiveErrors >= 3 && isOnline) {
              setIsOnline(false);
              toast({
                title: "Connection Lost",
                description: "The connection to the server has been lost. Reconnecting...",
                variant: "destructive"
              });
              
              // Start checking if Supabase is online again
              if (cancelCheck) cancelCheck();
              cancelCheck = checkSupabaseOnline(() => {
                setIsOnline(true);
                toast({
                  title: "Connection Restored",
                  description: "The connection to the server has been restored.",
                  variant: "default"
                });
              });
            }
          }
          
          throw error;
        }
      };
      
      return () => {
        // Restore the original fetch
        window.fetch = originalFetch;
        
        // Cancel the check
        if (cancelCheck) cancelCheck();
        
        // Clear the ping interval
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
        }
      };
    }
    
    // Clean up interval on unmount
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      
      if (cancelCheck) {
        cancelCheck();
      }
    };
  }, [interval, checkOnline, isOnline]);

  return { isOnline };
};
