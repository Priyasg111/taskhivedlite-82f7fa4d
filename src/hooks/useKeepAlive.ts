
import { useEffect, useRef } from 'react';
import { pingSupabase } from '@/utils/keepAlive';

/**
 * Hook to keep Supabase connection alive with periodic pings
 * @param interval Ping interval in milliseconds (default: 5 minutes)
 */
export const useKeepAlive = (interval = 5 * 60 * 1000) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial ping
    pingSupabase();
    
    // Set up recurring ping
    timerRef.current = window.setInterval(() => {
      pingSupabase();
    }, interval);
    
    // Clean up interval on unmount
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [interval]);

  return null;
};
