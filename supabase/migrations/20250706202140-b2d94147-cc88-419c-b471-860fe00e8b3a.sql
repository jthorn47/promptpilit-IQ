-- Phase 2B: Advanced Integration Features
-- Rate Limiting System
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    limit_type TEXT NOT NULL DEFAULT 'requests_per_minute', -- 'requests_per_minute', 'requests_per_hour', 'requests_per_day'
    limit_value INTEGER NOT NULL DEFAULT 60,
    current_usage INTEGER NOT NULL DEFAULT 0,
    reset_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 minute'),
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API Response Templates
CREATE TABLE public.api_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    endpoint_pattern TEXT NOT NULL,
    response_template JSONB NOT NULL DEFAULT '{}',
    error_mappings JSONB NOT NULL DEFAULT '{}',
    cache_duration_seconds INTEGER DEFAULT 300,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Events Tracking
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'suspicious_activity', 'rate_limit_exceeded', 'auth_failure', 'data_breach_attempt'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    source_ip INET,
    user_agent TEXT,
    request_details JSONB DEFAULT '{}',
    response_details JSONB DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integration Health Checks
CREATE TABLE public.integration_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
    check_type TEXT NOT NULL DEFAULT 'api_connectivity', -- 'api_connectivity', 'webhook_delivery', 'auth_validity'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failure', 'timeout'
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    check_details JSONB DEFAULT '{}',
    next_check_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '5 minutes'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Retry Policies
CREATE TABLE public.retry_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL, -- 'webhook', 'api_call', 'sync'
    max_attempts INTEGER NOT NULL DEFAULT 3,
    base_delay_seconds INTEGER NOT NULL DEFAULT 1,
    max_delay_seconds INTEGER NOT NULL DEFAULT 300,
    backoff_multiplier NUMERIC NOT NULL DEFAULT 2.0,
    retry_conditions JSONB DEFAULT '{}', -- HTTP status codes, error types to retry on
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integration Metrics
CREATE TABLE public.integration_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL, -- 'api_calls', 'webhook_deliveries', 'errors', 'response_time'
    metric_value NUMERIC NOT NULL,
    aggregation_period TEXT NOT NULL DEFAULT 'hourly', -- 'hourly', 'daily', 'weekly'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update webhook_logs table with retry information
ALTER TABLE public.webhook_logs 
ADD COLUMN IF NOT EXISTS retry_policy_id UUID REFERENCES public.retry_policies(id),
ADD COLUMN IF NOT EXISTS backoff_delay_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS circuit_breaker_state TEXT DEFAULT 'closed', -- 'closed', 'open', 'half_open'
ADD COLUMN IF NOT EXISTS failure_threshold INTEGER DEFAULT 5;

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retry_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_metrics ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_rate_limits_integration_id ON public.rate_limits(integration_id);
CREATE INDEX idx_rate_limits_api_key_id ON public.rate_limits(api_key_id);
CREATE INDEX idx_rate_limits_reset_time ON public.rate_limits(reset_time);
CREATE INDEX idx_security_events_integration_id ON public.security_events(integration_id);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_health_checks_integration_id ON public.integration_health_checks(integration_id);
CREATE INDEX idx_health_checks_next_check ON public.integration_health_checks(next_check_at);
CREATE INDEX idx_metrics_integration_id ON public.integration_metrics(integration_id);
CREATE INDEX idx_metrics_period ON public.integration_metrics(period_start, period_end);

-- RLS Policies
-- Rate Limits
CREATE POLICY "Company admins can manage their rate limits"
ON public.rate_limits
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = rate_limits.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can manage all rate limits"
ON public.rate_limits
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- API Response Templates
CREATE POLICY "Authenticated users can view response templates"
ON public.api_response_templates
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Super admins can manage response templates"
ON public.api_response_templates
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Security Events
CREATE POLICY "Company admins can view their security events"
ON public.security_events
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = security_events.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can manage all security events"
ON public.security_events
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can create security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Health Checks
CREATE POLICY "Company admins can view their health checks"
ON public.integration_health_checks
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = integration_health_checks.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can manage all health checks"
ON public.integration_health_checks
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can manage health checks"
ON public.integration_health_checks
FOR ALL
USING (true);

-- Retry Policies
CREATE POLICY "Company admins can manage their retry policies"
ON public.retry_policies
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = retry_policies.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can manage all retry policies"
ON public.retry_policies
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Integration Metrics
CREATE POLICY "Company admins can view their metrics"
ON public.integration_metrics
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = integration_metrics.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can view all metrics"
ON public.integration_metrics
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can create metrics"
ON public.integration_metrics
FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_response_templates_updated_at
    BEFORE UPDATE ON public.api_response_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retry_policies_updated_at
    BEFORE UPDATE ON public.retry_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_integration_id UUID DEFAULT NULL,
    p_api_key_id UUID DEFAULT NULL,
    p_limit_type TEXT DEFAULT 'requests_per_minute'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rate_limit RECORD;
    v_current_time TIMESTAMP WITH TIME ZONE := now();
BEGIN
    -- Get rate limit configuration
    SELECT * INTO v_rate_limit
    FROM public.rate_limits
    WHERE (integration_id = p_integration_id OR api_key_id = p_api_key_id)
    AND limit_type = p_limit_type
    AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no rate limit configured, allow request
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check if we need to reset the window
    IF v_current_time >= v_rate_limit.reset_time THEN
        -- Reset the usage counter
        UPDATE public.rate_limits
        SET current_usage = 1,
            window_start = v_current_time,
            reset_time = CASE 
                WHEN p_limit_type = 'requests_per_minute' THEN v_current_time + interval '1 minute'
                WHEN p_limit_type = 'requests_per_hour' THEN v_current_time + interval '1 hour'
                WHEN p_limit_type = 'requests_per_day' THEN v_current_time + interval '1 day'
                ELSE v_current_time + interval '1 minute'
            END,
            updated_at = v_current_time
        WHERE id = v_rate_limit.id;
        
        RETURN true;
    END IF;
    
    -- Check if under limit
    IF v_rate_limit.current_usage < v_rate_limit.limit_value THEN
        -- Increment usage
        UPDATE public.rate_limits
        SET current_usage = current_usage + 1,
            updated_at = v_current_time
        WHERE id = v_rate_limit.id;
        
        RETURN true;
    END IF;
    
    -- Rate limit exceeded
    RETURN false;
END;
$$;

-- Calculate next retry delay with exponential backoff
CREATE OR REPLACE FUNCTION public.calculate_next_retry(
    p_retry_policy_id UUID,
    p_attempt_number INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_policy RECORD;
    v_delay INTEGER;
BEGIN
    -- Get retry policy
    SELECT * INTO v_policy
    FROM public.retry_policies
    WHERE id = p_retry_policy_id;
    
    IF NOT FOUND THEN
        RETURN 60; -- Default 1 minute
    END IF;
    
    -- Calculate exponential backoff delay
    v_delay := v_policy.base_delay_seconds * (v_policy.backoff_multiplier ^ (p_attempt_number - 1));
    
    -- Cap at max delay
    IF v_delay > v_policy.max_delay_seconds THEN
        v_delay := v_policy.max_delay_seconds;
    END IF;
    
    RETURN v_delay;
END;
$$;

-- Insert default retry policies for existing integrations
INSERT INTO public.retry_policies (integration_id, operation_type, max_attempts, base_delay_seconds, backoff_multiplier)
SELECT 
    i.id,
    'webhook',
    3,
    2,
    2.0
FROM public.integrations i
WHERE NOT EXISTS (
    SELECT 1 FROM public.retry_policies rp 
    WHERE rp.integration_id = i.id AND rp.operation_type = 'webhook'
);

-- Insert default rate limits for existing integrations
INSERT INTO public.rate_limits (integration_id, limit_type, limit_value)
SELECT 
    i.id,
    'requests_per_minute',
    60
FROM public.integrations i
WHERE NOT EXISTS (
    SELECT 1 FROM public.rate_limits rl 
    WHERE rl.integration_id = i.id AND rl.limit_type = 'requests_per_minute'
);

-- Insert API response templates for existing providers
INSERT INTO public.api_response_templates (integration_provider_id, endpoint_pattern, response_template, error_mappings)
VALUES
('hubspot', '/contacts/v1/*', '{"status": "success", "data": {}}', '{"400": "Bad Request", "401": "Unauthorized", "429": "Rate Limited"}'),
('stripe', '/v1/*', '{"object": "response"}', '{"400": "Bad Request", "401": "Unauthorized", "402": "Request Failed"}'),
('slack', '/api/*', '{"ok": true}', '{"invalid_auth": "Invalid token", "rate_limited": "Rate limit exceeded"}')
WHERE NOT EXISTS (SELECT 1 FROM public.api_response_templates WHERE integration_provider_id = 'hubspot');