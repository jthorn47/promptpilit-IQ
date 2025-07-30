-- Create audit log table for tracking all system activities
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES public.company_settings(id),
    action_type TEXT NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'access', 'export'
    resource_type TEXT NOT NULL, -- 'user', 'employee', 'training', 'certificate', 'company', 'sso'
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'blocked'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session management table
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location_info JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 2FA settings table
CREATE TABLE public.user_2fa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    method TEXT NOT NULL DEFAULT 'totp', -- 'totp', 'sms', 'email'
    totp_secret TEXT,
    phone_number TEXT,
    backup_codes TEXT[], -- Encrypted backup codes
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security events table for monitoring suspicious activities
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- 'failed_login', 'suspicious_activity', 'account_lockout', 'password_reset'
    severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    source_ip INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_unresolved ON public.security_events(is_resolved) WHERE is_resolved = false;

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their company's audit logs"
ON public.audit_logs
FOR SELECT
USING (
    has_role(auth.uid(), 'company_admin') AND
    (company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid())
);

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all sessions"
ON public.user_sessions
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_2fa_settings
CREATE POLICY "Users can manage their own 2FA settings"
ON public.user_2fa_settings
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view 2FA settings"
ON public.user_2fa_settings
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for security_events
CREATE POLICY "Super admins can manage all security events"
ON public.security_events
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own security events"
ON public.security_events
FOR SELECT
USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_2fa_settings_updated_at
    BEFORE UPDATE ON public.user_2fa_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_company_id UUID DEFAULT NULL,
    p_action_type TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'success',
    p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, company_id, action_type, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, session_id, status, details
    )
    VALUES (
        p_user_id, p_company_id, p_action_type, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_ip_address::INET, p_user_agent, p_session_id, p_status, p_details
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE public.user_sessions
    SET is_active = false,
        updated_at = now()
    WHERE expires_at < now()
    AND is_active = true;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Delete very old inactive sessions (older than 30 days)
    DELETE FROM public.user_sessions
    WHERE is_active = false
    AND updated_at < (now() - interval '30 days');
    
    RETURN v_deleted_count;
END;
$$;