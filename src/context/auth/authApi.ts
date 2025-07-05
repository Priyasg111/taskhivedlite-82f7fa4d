
import { supabase } from "@/integrations/supabase/client";
import { CustomUser } from "@/types/auth";
import { formatUserWithMetadata } from '@/utils/authUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Logs in a user with email and password with enhanced security
 */
export const loginUser = async (email: string, password: string) => {
  const { checkAccountLockout, recordFailedLogin, logSecurityEvent } = await import('@/utils/securityUtils');
  
  // Check if account is locked due to failed attempts
  const lockoutStatus = await checkAccountLockout(email);
  if (lockoutStatus.locked) {
    await logSecurityEvent(null, 'blocked_login_attempt', 'medium', `Login blocked for ${email} due to too many failed attempts`);
    throw new Error(`Account temporarily locked. Please try again later.`);
  }
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    // Record failed login attempt
    await recordFailedLogin(email);
    await logSecurityEvent(null, 'failed_login', 'low', `Failed login attempt for ${email}`);
    throw error;
  }
  
  // Log successful login
  await logSecurityEvent(data.user?.id || null, 'successful_login', 'low', `Successful login for ${email}`);
  
  return data;
};

/**
 * Checks if an email is already registered
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Perform a direct database query for case-insensitive email check
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email')
      .ilike('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
    
    // If we got data back, the email exists
    return !!data;
  } catch (err) {
    console.error("Exception checking email:", err);
    return false;
  }
};

/**
 * Signs up a new user with enhanced security validation
 */
export const signupUser = async (name: string, email: string, password: string, role: string = 'worker', userType: string = 'worker'): Promise<CustomUser | null> => {
  const { validateAndSanitizeInput, userInputSchema, checkRateLimit, logSecurityEvent } = await import('@/utils/securityUtils');
  
  // Rate limit signup attempts
  const canProceed = await checkRateLimit(null, 'signup', 3, 60);
  if (!canProceed) {
    await logSecurityEvent(null, 'rate_limit_exceeded', 'medium', 'Signup rate limit exceeded');
    throw new Error('Too many signup attempts. Please try again later.');
  }
  
  // Validate and sanitize input
  try {
    const sanitizedData = validateAndSanitizeInput({ name, email, password }, userInputSchema);
    name = sanitizedData.name;
    email = sanitizedData.email;
    password = sanitizedData.password;
  } catch (validationError) {
    await logSecurityEvent(null, 'invalid_signup_data', 'low', 'Invalid signup data provided');
    throw new Error('Invalid input data provided');
  }
  // First check if the email already exists
  const emailExists = await checkEmailExists(email);
  
  if (emailExists) {
    throw new Error("This email is already registered. Please log in instead or reset your password.");
  }
  
  // Validate and normalize role to only allow 'worker' or 'client'
  // Define a properly typed role value instead of using const assertion
  const safeRole = role === 'client' ? 'client' : 'worker';
  // TypeScript will infer this as 'worker' | 'client' type
  
  console.log("Starting signup for user with email:", email, "role:", safeRole, "user type:", userType);
  
  try {
    // First, create the user with basic auth info
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          experience: 0,
          role: safeRole,
          user_type: userType,
          verified: false
        },
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error("Signup error:", error);
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Failed to create user account");
    }
    
    console.log("User created successfully:", data.user.id);
    
    // Now create a user profile explicitly
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: email,
          role: safeRole,
          user_type: userType,
          credits: 0,
          badge_level: 'beginner'
        });
        
      if (profileError) {
        console.error("Error creating user profile:", profileError);
      } else {
        console.log("User profile created successfully");
      }
    } catch (profileErr) {
      console.error("Exception creating user profile:", profileErr);
    }
    
    // Create user verification metadata explicitly
    try {
      const verificationData = {
        user_id: data.user.id,
        role: safeRole as 'worker' | 'client', // Use a type assertion here to satisfy the type requirement
        verification_email_sent_at: safeRole === 'worker' ? new Date().toISOString() : null,
        follow_up_pending: safeRole === 'client',
        email_verified: false
      };
      
      console.log("Creating verification metadata:", verificationData);
      
      const { error: verificationError } = await supabase
        .from('user_verification_metadata')
        .insert(verificationData);
        
      if (verificationError) {
        console.error("Error creating verification metadata:", verificationError);
      } else {
        console.log("Verification metadata created successfully");
      }
    } catch (verificationErr) {
      console.error("Exception creating verification metadata:", verificationErr);
    }

    try {
      console.log("Attempting to send welcome email to:", email);
      
      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: JSON.stringify({
          name,
          email,
          role: safeRole, // This is already typed correctly
          welcomeType: "initial"
        })
      });
      
      if (emailError) {
        console.error("Error sending welcome email:", emailError);
      } else {
        console.log("Welcome email sent successfully");
      }
    } catch (emailError) {
      console.error("Exception sending welcome email:", emailError);
    }
    
    return formatUserWithMetadata(data.user);
  } catch (error) {
    console.error("Signup process failed:", error);
    throw error;
  }
};

/**
 * Logs out the current user
 */
export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

/**
 * Updates the user's experience
 */
export const updateUserExperience = async (userId: string, newExperience: number) => {
  return await supabase.auth.updateUser({
    data: { experience: newExperience }
  });
};

/**
 * Checks the verification status of a user
 */
export const checkUserVerificationStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  
  return data.kyc_status === 'verified';
};
