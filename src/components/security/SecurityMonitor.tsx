import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { logSecurityEvent } from '@/utils/securityUtils';

const SecurityMonitor = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activities
    const monitorSuspiciousActivity = () => {
      // Monitor rapid clicking/form submissions
      let clickCount = 0;
      const resetClickCount = () => { clickCount = 0; };
      
      const handleClick = () => {
        clickCount++;
        if (clickCount > 50) { // Threshold for rapid clicking
          logSecurityEvent(user.id, 'suspicious_activity', 'medium', 'Rapid clicking detected');
          clickCount = 0;
        }
      };

      // Monitor console access (potential developer tools usage)
      const detectConsoleUsage = () => {
        let devtools = { open: false };
        
        setInterval(() => {
          if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
            if (!devtools.open) {
              devtools.open = true;
              logSecurityEvent(user.id, 'devtools_opened', 'low', 'Developer tools may have been opened');
            }
          } else {
            devtools.open = false;
          }
        }, 1000);
      };

      // Monitor for copy/paste of sensitive data
      const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text') || '';
        if (pastedText.length > 1000) { // Large paste operations
          logSecurityEvent(user.id, 'large_paste_operation', 'low', 'Large text paste detected');
        }
      };

      document.addEventListener('click', handleClick);
      document.addEventListener('paste', handlePaste);
      detectConsoleUsage();
      
      // Reset click counter every minute
      const clickInterval = setInterval(resetClickCount, 60000);

      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('paste', handlePaste);
        clearInterval(clickInterval);
      };
    };

    const cleanup = monitorSuspiciousActivity();
    return cleanup;
  }, [user]);

  return null; // This is a monitoring component with no UI
};

export default SecurityMonitor;