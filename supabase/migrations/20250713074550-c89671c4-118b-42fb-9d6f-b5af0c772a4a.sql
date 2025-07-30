-- Create seat-based access control tables

-- Course Packages Table (1, 2, or 5 seats)
CREATE TABLE IF NOT EXISTS public.user_course_seats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    package_id UUID REFERENCES public.course_packages(id),
    total_seats INTEGER NOT NULL CHECK (total_seats IN (1, 2, 5)),
    used_seats INTEGER NOT NULL DEFAULT 0,
    remaining_seats INTEGER GENERATED ALWAYS AS (total_seats - used_seats) STORED,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Course Access (tracks which specific courses are unlocked)
CREATE TABLE IF NOT EXISTS public.user_course_access (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    training_module_id UUID REFERENCES public.training_modules(id) NOT NULL,
    seat_package_id UUID REFERENCES public.user_course_seats(id) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    certificate_generated BOOLEAN NOT NULL DEFAULT false,
    certificate_id UUID REFERENCES public.certificates(id),
    ip_address INET,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, training_module_id)
);

-- Video Access Tokens (secure tokenized streaming)
CREATE TABLE IF NOT EXISTS public.video_access_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    training_module_id UUID REFERENCES public.training_modules(id) NOT NULL,
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    video_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Sessions (prevent simultaneous logins)
CREATE TABLE IF NOT EXISTS public.user_video_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Audit Logs
CREATE TABLE IF NOT EXISTS public.video_security_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    training_module_id UUID REFERENCES public.training_modules(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('course_unlock', 'video_access', 'token_generated', 'token_used', 'certificate_generated', 'suspicious_activity')),
    event_details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_course_seats_user_id ON public.user_course_seats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_access_user_module ON public.user_course_access(user_id, training_module_id);
CREATE INDEX IF NOT EXISTS idx_video_access_tokens_token_hash ON public.video_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_video_access_tokens_user_module ON public.video_access_tokens(user_id, training_module_id);
CREATE INDEX IF NOT EXISTS idx_user_video_sessions_user_active ON public.user_video_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_video_security_audit_user_event ON public.video_security_audit(user_id, event_type);

-- Enable Row Level Security
ALTER TABLE public.user_course_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_security_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_course_seats
CREATE POLICY "Users can view their own course seats" 
ON public.user_course_seats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course seats" 
ON public.user_course_seats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all course seats" 
ON public.user_course_seats 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- RLS Policies for user_course_access
CREATE POLICY "Users can view their own course access" 
ON public.user_course_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course access" 
ON public.user_course_access 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all course access" 
ON public.user_course_access 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- RLS Policies for video_access_tokens
CREATE POLICY "Users can view their own video tokens" 
ON public.video_access_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert video tokens" 
ON public.video_access_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update video tokens" 
ON public.video_access_tokens 
FOR UPDATE 
USING (true);

-- RLS Policies for user_video_sessions
CREATE POLICY "Users can view their own video sessions" 
ON public.user_video_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage video sessions" 
ON public.user_video_sessions 
FOR ALL 
USING (true);

-- RLS Policies for video_security_audit
CREATE POLICY "Users can view their own audit logs" 
ON public.video_security_audit 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" 
ON public.video_security_audit 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" 
ON public.video_security_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_video_tables()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_course_seats_updated_at
    BEFORE UPDATE ON public.user_course_seats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_video_tables();

CREATE TRIGGER update_user_course_access_updated_at
    BEFORE UPDATE ON public.user_course_access
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_video_tables();