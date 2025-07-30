-- Phase 2B: API Standards, Security, Monitoring & Error Handling

-- Rate Limiting Tables
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    requests_per_minute INTEGER NOT NULL DEFAULT 60,
    requests_per_hour INTEGER NOT NULL DEFAULT 1000,
    requests_per_day INTEGER NOT NULL DEFAULT 10000,
    current_minute_count INTEGER DEFAULT 0,
    current_hour_count INTEGER DEFAULT 0,
    current_day_count INTEGER DEFAULT 0,
    minute_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    hour_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    day_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API Response Standards Table
CREATE TABLE public.api_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1',
    response_format JSONB NOT NULL DEFAULT '{}',
    error_codes JSONB DEFAULT '{}',
    status_codes INTEGER[] DEFAULT '{200,201,400,401,403,404,500}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Audit Table
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'credential_rotation', 'webhook_validation_failed', 'suspicious_activity'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    source_ip INET,
    user_agent TEXT,
    event_data JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integration Health Monitoring
CREATE TABLE public.integration_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
    check_type TEXT NOT NULL, -- 'connectivity', 'authentication', 'rate_limit', 'webhook_delivery'
    status TEXT NOT NULL, -- 'healthy', 'warning', 'unhealthy'
    response_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Retry Configuration
CREATE TABLE public.retry_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
    operation_type TEXT NOT NULL, -- 'webhook', 'api_call', 'sync'
    max_attempts INTEGER NOT NULL DEFAULT 3,
    initial_delay_seconds INTEGER NOT NULL DEFAULT 60,
    max_delay_seconds INTEGER NOT NULL DEFAULT 3600,
    backoff_multiplier NUMERIC NOT NULL DEFAULT 2.0,
    retry_on_status_codes INTEGER[] DEFAULT '{500,502,503,504}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced webhook logs for retry tracking
ALTER TABLE public.webhook_logs ADD COLUMN IF NOT EXISTS retry_policy_id UUID REFERENCES public.retry_policies(id);
ALTER TABLE public.webhook_logs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.webhook_logs ADD COLUMN IF NOT EXISTS backoff_delay_seconds INTEGER DEFAULT 60;

-- Performance metrics aggregation
CREATE TABLE public.integration_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms NUMERIC DEFAULT 0,
    error_rate NUMERIC DEFAULT 0,
    uptime_percentage NUMERIC DEFAULT 100,
    data_transferred_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(integration_id, metric_date)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retry_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_rate_limits_integration_id ON public.rate_limits(integration_id);
CREATE INDEX idx_rate_limits_api_key_id ON public.rate_limits(api_key_id);
CREATE INDEX idx_security_events_integration_id ON public.security_events(integration_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_health_checks_integration_id ON public.integration_health_checks(integration_id);
CREATE INDEX idx_health_checks_checked_at ON public.integration_health_checks(checked_at);
CREATE INDEX idx_retry_policies_integration_id ON public.retry_policies(integration_id);
CREATE INDEX idx_integration_metrics_date ON public.integration_metrics(metric_date);
CREATE INDEX idx_integration_metrics_integration_id ON public.integration_metrics(integration_id);

-- RLS Policies
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

CREATE POLICY "API response templates are viewable by authenticated users"
ON public.api_response_templates
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage API response templates"
ON public.api_response_templates
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

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

CREATE POLICY "System can manage health checks"
ON public.integration_health_checks
FOR ALL
USING (true);

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

CREATE POLICY "Company admins can view their integration metrics"
ON public.integration_metrics
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = integration_metrics.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can view all integration metrics"
ON public.integration_metrics
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

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

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_integration_id UUID,
    p_api_key_id UUID,
    p_endpoint TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rate_limit_record RECORD;
    current_time TIMESTAMP WITH TIME ZONE := now();
BEGIN
    -- Get rate limit configuration
    SELECT * INTO rate_limit_record
    FROM public.rate_limits
    WHERE (integration_id = p_integration_id OR api_key_id = p_api_key_id)
    AND endpoint = p_endpoint
    AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- No rate limit configured, allow request
        RETURN true;
    END IF;
    
    -- Reset counters if time windows have elapsed
    IF current_time > rate_limit_record.minute_reset_at + interval '1 minute' THEN
        UPDATE public.rate_limits
        SET current_minute_count = 0,
            minute_reset_at = current_time
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_minute_count := 0;
    END IF;
    
    IF current_time > rate_limit_record.hour_reset_at + interval '1 hour' THEN
        UPDATE public.rate_limits
        SET current_hour_count = 0,
            hour_reset_at = current_time
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_hour_count := 0;
    END IF;
    
    IF current_time > rate_limit_record.day_reset_at + interval '1 day' THEN
        UPDATE public.rate_limits
        SET current_day_count = 0,
            day_reset_at = current_time
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_day_count := 0;
    END IF;
    
    -- Check limits
    IF rate_limit_record.current_minute_count >= rate_limit_record.requests_per_minute OR
       rate_limit_record.current_hour_count >= rate_limit_record.requests_per_hour OR
       rate_limit_record.current_day_count >= rate_limit_record.requests_per_day THEN
        RETURN false;
    END IF;
    
    -- Increment counters
    UPDATE public.rate_limits
    SET current_minute_count = current_minute_count + 1,
        current_hour_count = current_hour_count + 1,
        current_day_count = current_day_count + 1
    WHERE id = rate_limit_record.id;
    
    RETURN true;
END;
$$;

-- Function to calculate next retry time
CREATE OR REPLACE FUNCTION public.calculate_next_retry(
    p_attempt_number INTEGER,
    p_initial_delay_seconds INTEGER,
    p_max_delay_seconds INTEGER,
    p_backoff_multiplier NUMERIC
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    delay_seconds INTEGER;
BEGIN
    -- Calculate exponential backoff delay
    delay_seconds := LEAST(
        p_initial_delay_seconds * (p_backoff_multiplier ^ (p_attempt_number - 1)),
        p_max_delay_seconds
    )::INTEGER;
    
    RETURN now() + (delay_seconds || ' seconds')::INTERVAL;
END;
$$;

-- Insert default API response template
INSERT INTO public.api_response_templates (name, version, response_format, error_codes) VALUES
('Standard REST API', 'v1', 
 '{"success": true, "data": {}, "message": "", "timestamp": "", "request_id": ""}',
 '{"400": "Bad Request", "401": "Unauthorized", "403": "Forbidden", "404": "Not Found", "429": "Too Many Requests", "500": "Internal Server Error"}'),
('GraphQL API', 'v1',
 '{"data": {}, "errors": [], "extensions": {}}',
 '{"VALIDATION_ERROR": "Invalid query syntax", "AUTHENTICATION_ERROR": "Invalid credentials", "AUTHORIZATION_ERROR": "Insufficient permissions"}');

-- Insert default retry policies
INSERT INTO public.retry_policies (integration_id, operation_type, max_attempts, initial_delay_seconds, max_delay_seconds, backoff_multiplier, retry_on_status_codes) 
SELECT 
    i.id,
    'webhook',
    3,
    60,
    3600,
    2.0,
    ARRAY[500, 502, 503, 504]
FROM public.integrations i
WHERE NOT EXISTS (
    SELECT 1 FROM public.retry_policies rp 
    WHERE rp.integration_id = i.id AND rp.operation_type = 'webhook'
);