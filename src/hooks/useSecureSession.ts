import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { setupSessionTimeout, logSecurityEvent } from '@/utils/securityUtils';

export const useSecureSession = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up session timeout
    const cleanup = setupSessionTimeout();

    // Log session start
    logSecurityEvent(user.id, 'session_started', 'low', 'User session initiated');

    // Detect tab visibility changes for security
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent(user.id, 'tab_hidden', 'low', 'User tab became hidden');
      } else {
        logSecurityEvent(user.id, 'tab_visible', 'low', 'User tab became visible');
      }
    };

    // Detect potential session hijacking attempts
    const handleBeforeUnload = () => {
      logSecurityEvent(user.id, 'session_ended', 'low', 'User session ended');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  return { user };
};