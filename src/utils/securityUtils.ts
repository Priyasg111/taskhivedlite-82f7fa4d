import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Input validation schemas
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    "Password must contain uppercase, lowercase, number and special character");

export const userInputSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z\s\-']+$/, "Invalid name format"),
  email: emailSchema,
  password: passwordSchema,
});

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, windowMinutes: 15 },
  SIGNUP_ATTEMPTS: { max: 3, windowMinutes: 60 },
  TASK_CREATION: { max: 10, windowMinutes: 60 },
  TRANSACTION: { max: 20, windowMinutes: 60 },
  GENERAL_API: { max: 100, windowMinutes: 60 }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 1000); // Limit length
};

// Validate and sanitize user input
export const validateAndSanitizeInput = (data: any, schema: z.ZodSchema) => {
  // First sanitize string inputs
  const sanitized = Object.keys(data).reduce((acc, key) => {
    acc[key] = typeof data[key] === 'string' ? sanitizeInput(data[key]) : data[key];
    return acc;
  }, {} as any);
  
  // Then validate with schema
  return schema.parse(sanitized);
};

// Server-side rate limiting using database tracking
export const checkRateLimit = async (
  userId: string | null,
  actionType: string,
  maxRequests: number = 100,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('check-rate-limit', {
      body: JSON.stringify({
        action_type: actionType,
        max_requests: maxRequests,
        window_minutes: windowMinutes
      })
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Fail open on error
    }

    return data?.allowed || false;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Fail open for safety
  }
};

// Server-side security event logging with database persistence
export const logSecurityEvent = async (
  userId: string | null,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: any
): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Log to console for immediate visibility
    console.log(`[SECURITY ${severity.toUpperCase()}] ${eventType}: ${description}`, {
      userId,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    // Log to database for persistence
    const { error } = await supabase.functions.invoke('log-security-event', {
      body: JSON.stringify({
        user_id: userId,
        event_type: eventType,
        severity,
        description,
        metadata
      })
    });

    if (error) {
      console.error('Failed to log security event to database:', error);
      // Fallback to localStorage as backup
      const securityLog = {
        userId,
        eventType,
        severity,
        description,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('security_events_backup') || '[]');
      existingLogs.push(securityLog);
      
      // Keep only last 50 events as backup
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('security_events_backup', JSON.stringify(existingLogs));
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Server-side account lockout check using database
export const checkAccountLockout = async (email: string): Promise<{
  locked: boolean;
  lockoutUntil?: string;
  failedAttempts: number;
}> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('check-account-lockout', {
      body: JSON.stringify({ email })
    });

    if (error) {
      console.error('Account lockout check error:', error);
      return { locked: false, failedAttempts: 0 };
    }

    return {
      locked: data?.locked || false,
      lockoutUntil: data?.lockout_until,
      failedAttempts: data?.failed_attempts || 0
    };
  } catch (error) {
    console.error('Account lockout check error:', error);
    return { locked: false, failedAttempts: 0 };
  }
};

// Server-side failed login attempt recording with database persistence
export const recordFailedLogin = async (email: string): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { error } = await supabase.functions.invoke('record-failed-login', {
      body: JSON.stringify({ email })
    });

    if (error) {
      console.error('Failed to record login attempt:', error);
      // Fallback to localStorage as backup
      const key = `failed_attempts_backup_${email}`;
      const stored = localStorage.getItem(key);
      const now = Date.now();
      
      if (stored) {
        const data = JSON.parse(stored);
        data.count++;
        data.lastAttempt = now;
        localStorage.setItem(key, JSON.stringify(data));
      } else {
        localStorage.setItem(key, JSON.stringify({ count: 1, lastAttempt: now }));
      }
    }
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
};

// Session timeout management
export const SESSION_TIMEOUT_MINUTES = 120; // 2 hours

export const setupSessionTimeout = () => {
  let timeoutId: NodeJS.Timeout;
  
  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await logSecurityEvent(null, 'session_timeout', 'low', 'User session timed out');
      await supabase.auth.signOut();
      window.location.href = '/login?message=Session expired. Please log in again.';
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
  };
  
  // Reset timeout on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimeout, true);
  });
  
  // Initial timeout setup
  resetTimeout();
  
  return () => {
    clearTimeout(timeoutId);
    events.forEach(event => {
      document.removeEventListener(event, resetTimeout, true);
    });
  };
};

// Secure data handling for sensitive information
export const secureDataHandler = {
  // Clear sensitive data from memory
  clearSensitiveData: (obj: any) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          delete obj[key];
        }
      });
    }
  },
  
  // Mask sensitive information for logging
  maskSensitiveInfo: (data: any): any => {
    if (typeof data === 'string') {
      // Mask email addresses
      data = data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
      // Mask potential credit card numbers
      data = data.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '****-****-****-****');
    }
    return data;
  }
};

// Content Security Policy headers (for server-side implementation)
export const CSP_HEADER = {
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' https:; " +
    "frame-src 'none'; " +
    "object-src 'none';"
};

// Transaction security validation - simplified version
export const validateTransaction = async (
  userId: string,
  amount: number,
  type: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    // Basic validation rules
    if (amount <= 0) {
      return { valid: false, reason: 'Amount must be positive' };
    }
    
    if (amount > 10000) {
      return { valid: false, reason: 'Amount exceeds maximum limit' };
    }
    
    // Check daily limits using localStorage for now
    const today = new Date().toDateString();
    const key = `daily_transactions_${userId}_${today}`;
    const dailyTransactions = JSON.parse(localStorage.getItem(key) || '[]');
    const dailyTotal = dailyTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    
    if (dailyTotal + amount > 5000) {
      return { valid: false, reason: 'Would exceed daily limit of $5000' };
    }
    
    // Store this transaction attempt
    dailyTransactions.push({ amount, type, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(dailyTransactions));
    
    return { valid: true };
  } catch (error) {
    console.error('Transaction validation error:', error);
    return { valid: false, reason: 'Validation error' };
  }
};