-- Database Security Policies and Enhancements
-- ===================================================

-- Enable RLS on all main tables if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON user_profiles;
CREATE POLICY "Public profiles viewable by authenticated users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tasks RLS Policies
DROP POLICY IF EXISTS "Users can view public tasks" ON tasks;
CREATE POLICY "Users can view public tasks" ON tasks
    FOR SELECT USING (
        status = 'available' OR 
        auth.uid() = employer_id OR 
        auth.uid() = worker_id
    );

DROP POLICY IF EXISTS "Employers can create tasks" ON tasks;
CREATE POLICY "Employers can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Task owners can update their tasks" ON tasks;
CREATE POLICY "Task owners can update their tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = employer_id OR 
        (auth.uid() = worker_id AND status IN ('in_progress', 'completed'))
    );

-- Transactions RLS Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = recipient_id
    );

DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "System can create transactions" ON transactions
    FOR INSERT WITH CHECK (true); -- Handled by edge functions with proper auth

-- Verification Metadata RLS Policies
DROP POLICY IF EXISTS "Users can view their own verification data" ON user_verification_metadata;
CREATE POLICY "Users can view their own verification data" ON user_verification_metadata
    FOR SELECT USING (auth.uid() = user_id);

-- Database Constraints and Validation
ALTER TABLE user_profiles 
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_badge_level CHECK (badge_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD CONSTRAINT check_credits_non_negative CHECK (credits >= 0);

ALTER TABLE tasks
ADD CONSTRAINT check_payment_amount_positive CHECK (payment_amount > 0),
ADD CONSTRAINT check_valid_status CHECK (status IN ('available', 'in_progress', 'completed', 'cancelled')),
ADD CONSTRAINT check_difficulty_level CHECK (difficulty IN ('easy', 'medium', 'hard'));

ALTER TABLE transactions
ADD CONSTRAINT check_amount_positive CHECK (amount > 0),
ADD CONSTRAINT check_valid_transaction_type CHECK (type IN ('deposit', 'payment', 'withdrawal')),
ADD CONSTRAINT check_valid_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- Audit Logging Function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), auth.uid(), NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid(), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW), auth.uid(), NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable audit logging on sensitive tables
DROP TRIGGER IF EXISTS audit_user_profiles ON user_profiles;
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

DROP TRIGGER IF EXISTS audit_transactions ON transactions;
CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action_type TEXT NOT NULL,
    ip_address INET,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Limiting Function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID DEFAULT NULL,
    p_action_type TEXT DEFAULT 'general',
    p_ip_address INET DEFAULT NULL,
    p_max_requests INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Clean up old entries
    DELETE FROM rate_limits 
    WHERE window_start < (NOW() - '24 hours'::INTERVAL);
    
    -- Count current requests in window
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM rate_limits
    WHERE 
        (p_user_id IS NULL OR user_id = p_user_id) AND
        (p_ip_address IS NULL OR ip_address = p_ip_address) AND
        action_type = p_action_type AND
        window_start >= (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
    
    -- If under limit, increment counter
    IF current_count < p_max_requests THEN
        INSERT INTO rate_limits (user_id, action_type, ip_address, count)
        VALUES (p_user_id, p_action_type, p_ip_address, 1)
        ON CONFLICT (user_id, action_type, ip_address) 
        DO UPDATE SET 
            count = rate_limits.count + 1,
            window_start = CASE 
                WHEN rate_limits.window_start < (NOW() - (p_window_minutes || ' minutes')::INTERVAL)
                THEN NOW()
                ELSE rate_limits.window_start
            END;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Failed Login Attempts Tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT
);

-- Account Lockout Function
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT, p_ip_address INET DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    failed_attempts INTEGER;
    lockout_until TIMESTAMP WITH TIME ZONE;
    result JSONB;
BEGIN
    -- Clean up old failed attempts (older than 1 hour)
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < (NOW() - '1 hour'::INTERVAL);
    
    -- Count recent failed attempts for this email
    SELECT COUNT(*) INTO failed_attempts
    FROM failed_login_attempts
    WHERE email = p_email 
    AND attempt_time > (NOW() - '15 minutes'::INTERVAL);
    
    -- Check if account should be locked
    IF failed_attempts >= 5 THEN
        lockout_until := NOW() + '30 minutes'::INTERVAL;
        result := jsonb_build_object(
            'locked', true,
            'lockout_until', lockout_until,
            'failed_attempts', failed_attempts
        );
    ELSE
        result := jsonb_build_object(
            'locked', false,
            'failed_attempts', failed_attempts
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transaction Limits and Validation
CREATE TABLE IF NOT EXISTS transaction_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    daily_limit DECIMAL(10,2) DEFAULT 1000.00,
    monthly_limit DECIMAL(10,2) DEFAULT 10000.00,
    single_transaction_limit DECIMAL(10,2) DEFAULT 500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Log
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_severity TEXT,
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_events (user_id, event_type, severity, description, ip_address, user_agent, metadata)
    VALUES (p_user_id, p_event_type, p_severity, p_description, p_ip_address, p_user_agent, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;