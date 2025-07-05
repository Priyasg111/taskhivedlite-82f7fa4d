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
  // Sanitize only specific fields, preserve passwords as-is
  const sanitized = Object.keys(data).reduce((acc, key) => {
    if (key === 'password') {
      // Don't sanitize passwords - they need special characters
      acc[key] = data[key];
    } else if (typeof data[key] === 'string') {
      // Only sanitize name and email fields
      acc[key] = sanitizeInput(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);
  
  // Then validate with schema
  return schema.parse(sanitized);
};

// Server-side rate limiting using database tracking with fallback
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
      console.warn('Rate limit check failed, using client fallback:', error);
      return clientSideRateLimit(actionType, maxRequests, windowMinutes);
    }

    return data?.allowed || false;
  } catch (error) {
    console.warn('Rate limit check error, using client fallback:', error);
    return clientSideRateLimit(actionType, maxRequests, windowMinutes);
  }
};

// Client-side fallback rate limiting (temporary until database is set up)
const clientSideRateLimit = (actionType: string, maxRequests: number, windowMinutes: number): boolean => {
  const key = `rate_limit_${actionType}`;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const stored = localStorage.getItem(key);
  let attempts = stored ? JSON.parse(stored) : [];
  
  // Remove old attempts outside the window
  attempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (attempts.length >= maxRequests) {
    return false; // Rate limited
  }
  
  // Add current attempt
  attempts.push(now);
  localStorage.setItem(key, JSON.stringify(attempts));
  
  return true; // Allowed
};

// Server-side security event logging with database persistence and enhanced fallback
export const logSecurityEvent = async (
  userId: string | null,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: any
): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  // Always log to console for immediate visibility
  console.log(`[SECURITY ${severity.toUpperCase()}] ${eventType}: ${description}`, {
    userId,
    metadata,
    timestamp
  });
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Try to log to database first
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
      console.warn('Database security logging failed, using local fallback:', error);
      throw error; // Force fallback
    }
  } catch (error) {
    // Enhanced fallback to localStorage with structured format
    try {
      const securityLog = {
        id: crypto.randomUUID(),
        userId,
        eventType,
        severity,
        description,
        metadata,
        timestamp,
        source: 'client_fallback'
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('security_events_backup') || '[]');
      existingLogs.push(securityLog);
      
      // Keep only last 100 events and clean old ones
      existingLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (existingLogs.length > 100) {
        existingLogs.splice(100);
      }
      
      localStorage.setItem('security_events_backup', JSON.stringify(existingLogs));
      
      // For critical events, also store separately for immediate attention
      if (severity === 'critical') {
        const criticalEvents = JSON.parse(localStorage.getItem('critical_security_events') || '[]');
        criticalEvents.push(securityLog);
        localStorage.setItem('critical_security_events', JSON.stringify(criticalEvents));
      }
    } catch (fallbackError) {
      console.error('Security event logging completely failed:', fallbackError);
    }
  }
};

// Server-side account lockout check using database with client fallback
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
      console.warn('Database lockout check failed, using client fallback:', error);
      return clientSideLockoutCheck(email);
    }

    return {
      locked: data?.locked || false,
      lockoutUntil: data?.lockout_until,
      failedAttempts: data?.failed_attempts || 0
    };
  } catch (error) {
    console.warn('Account lockout check error, using client fallback:', error);
    return clientSideLockoutCheck(email);
  }
};

// Client-side fallback for account lockout (temporary until database is set up)
const clientSideLockoutCheck = (email: string): { locked: boolean; lockoutUntil?: string; failedAttempts: number } => {
  const key = `failed_attempts_${email}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return { locked: false, failedAttempts: 0 };
  }
  
  const data = JSON.parse(stored);
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  // Reset if more than 1 hour has passed
  if (now - data.lastAttempt > 60 * 60 * 1000) {
    localStorage.removeItem(key);
    return { locked: false, failedAttempts: 0 };
  }
  
  // Check if locked (5+ attempts in 15 minutes)
  if (data.count >= 5 && (now - data.lastAttempt) < fifteenMinutes) {
    const lockoutUntil = new Date(data.lastAttempt + 30 * 60 * 1000).toISOString();
    return { 
      locked: true, 
      lockoutUntil,
      failedAttempts: data.count 
    };
  }
  
  return { locked: false, failedAttempts: data.count };
};

// Server-side failed login attempt recording with database persistence and enhanced fallback
export const recordFailedLogin = async (email: string): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { error } = await supabase.functions.invoke('record-failed-login', {
      body: JSON.stringify({ email })
    });

    if (error) {
      console.warn('Database failed login recording failed, using client fallback:', error);
      throw error; // Force fallback
    }
  } catch (error) {
    // Enhanced client-side fallback with better data structure
    const key = `failed_attempts_${email}`;
    const stored = localStorage.getItem(key);
    const now = Date.now();
    
    if (stored) {
      const data = JSON.parse(stored);
      data.count++;
      data.lastAttempt = now;
      data.attempts.push(now);
      
      // Keep only last 10 attempts
      if (data.attempts.length > 10) {
        data.attempts = data.attempts.slice(-10);
      }
      
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, JSON.stringify({ 
        count: 1, 
        lastAttempt: now,
        attempts: [now],
        email: email
      }));
    }
    
    // Log security event for failed login tracking
    await logSecurityEvent(null, 'failed_login_recorded', 'low', `Failed login recorded for ${email} (client fallback)`);
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