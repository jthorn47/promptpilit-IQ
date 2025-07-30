-- Create integration providers table
CREATE TABLE public.integration_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT NOT NULL, -- 'crm', 'email', 'storage', 'analytics', 'communication', 'payment'
    auth_type TEXT NOT NULL DEFAULT 'api_key', -- 'api_key', 'oauth2', 'webhook', 'basic_auth'
    config_schema JSONB DEFAULT '{}', -- JSON schema for configuration
    webhook_events TEXT[] DEFAULT '{}', -- Available webhook events
    rate_limits JSONB DEFAULT '{}', -- Rate limiting configuration
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table for user/company integrations
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- User-defined name for this integration
    configuration JSONB DEFAULT '{}', -- Encrypted configuration data
    credentials JSONB DEFAULT '{}', -- Encrypted credentials
    webhook_url TEXT, -- Webhook endpoint for this integration
    webhook_secret TEXT, -- Secret for webhook validation
    status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook logs table for tracking webhook deliveries
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    http_method TEXT NOT NULL DEFAULT 'POST',
    headers JSONB DEFAULT '{}',
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    response_time_ms INTEGER,
    event_type TEXT,
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'retrying'
    error_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage logs table for monitoring and rate limiting
CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    http_method TEXT NOT NULL,
    user_agent TEXT,
    ip_address INET,
    request_size INTEGER,
    response_size INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    rate_limit_remaining INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_integrations_company_id ON public.integrations(company_id);
CREATE INDEX idx_integrations_provider_id ON public.integrations(provider_id);
CREATE INDEX idx_integrations_status ON public.integrations(status);
CREATE INDEX idx_webhook_logs_integration_id ON public.webhook_logs(integration_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_scheduled_for ON public.webhook_logs(scheduled_for);
CREATE INDEX idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);

-- RLS Policies for integration_providers
CREATE POLICY "Integration providers are viewable by authenticated users"
ON public.integration_providers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage integration providers"
ON public.integration_providers
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for integrations
CREATE POLICY "Company admins can manage their company integrations"
ON public.integrations
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin', company_id));

CREATE POLICY "Super admins can manage all integrations"
ON public.integrations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for webhook_logs
CREATE POLICY "Company admins can view their integration webhook logs"
ON public.webhook_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.integrations i 
        WHERE i.id = webhook_logs.integration_id 
        AND has_company_role(auth.uid(), 'company_admin', i.company_id)
    )
);

CREATE POLICY "Super admins can view all webhook logs"
ON public.webhook_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can manage webhook logs"
ON public.webhook_logs
FOR ALL
USING (true);

-- RLS Policies for api_usage_logs
CREATE POLICY "API key owners can view their usage logs"
ON public.api_usage_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.api_keys ak 
        WHERE ak.id = api_usage_logs.api_key_id 
        AND ak.created_by = auth.uid()
    )
);

CREATE POLICY "Super admins can view all API usage logs"
ON public.api_usage_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_integration_providers_updated_at
    BEFORE UPDATE ON public.integration_providers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default integration providers
INSERT INTO public.integration_providers (name, display_name, description, category, auth_type, config_schema, webhook_events) VALUES
('hubspot', 'HubSpot', 'CRM and marketing automation platform', 'crm', 'api_key', 
 '{"api_key": {"type": "string", "required": true, "description": "HubSpot API Key"}}',
 ARRAY['contact.created', 'contact.updated', 'deal.created', 'deal.updated']),
 
('stripe', 'Stripe', 'Payment processing platform', 'payment', 'api_key',
 '{"secret_key": {"type": "string", "required": true, "description": "Stripe Secret Key"}, "webhook_secret": {"type": "string", "required": false, "description": "Webhook endpoint secret"}}',
 ARRAY['payment.succeeded', 'payment.failed', 'subscription.created', 'subscription.updated']),
 
('slack', 'Slack', 'Team communication platform', 'communication', 'oauth2',
 '{"webhook_url": {"type": "string", "required": true, "description": "Slack Incoming Webhook URL"}}',
 ARRAY['message.sent', 'channel.created']),
 
('zapier', 'Zapier', 'Automation platform', 'automation', 'webhook',
 '{"webhook_url": {"type": "string", "required": true, "description": "Zapier Webhook URL"}}',
 ARRAY['trigger.activated']),
 
('mailchimp', 'Mailchimp', 'Email marketing platform', 'email', 'api_key',
 '{"api_key": {"type": "string", "required": true, "description": "Mailchimp API Key"}, "server_prefix": {"type": "string", "required": true, "description": "Server prefix (e.g., us1)"}}',
 ARRAY['subscriber.added', 'subscriber.updated', 'campaign.sent']),
 
('google_analytics', 'Google Analytics', 'Web analytics platform', 'analytics', 'oauth2',
 '{"tracking_id": {"type": "string", "required": true, "description": "Google Analytics Tracking ID"}}',
 ARRAY[]),
 
('twilio', 'Twilio', 'Communication platform', 'communication', 'api_key',
 '{"account_sid": {"type": "string", "required": true, "description": "Twilio Account SID"}, "auth_token": {"type": "string", "required": true, "description": "Twilio Auth Token"}}',
 ARRAY['sms.sent', 'sms.received', 'call.completed']);

-- Function to process webhook queue
CREATE OR REPLACE FUNCTION public.process_webhook_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    processed_count INTEGER := 0;
    webhook_record RECORD;
BEGIN
    -- Get pending webhooks that are ready to be processed
    FOR webhook_record IN
        SELECT * FROM public.webhook_logs
        WHERE status IN ('pending', 'retrying')
        AND scheduled_for <= now()
        AND attempt_number <= max_attempts
        ORDER BY scheduled_for ASC
        LIMIT 100
    LOOP
        -- Mark as processing
        UPDATE public.webhook_logs
        SET status = 'processing',
            attempt_number = attempt_number + 1
        WHERE id = webhook_record.id;
        
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$;