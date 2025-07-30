-- Create integration_sessions table for secure credential access
CREATE TABLE public.integration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT NOT NULL UNIQUE,
    app_name TEXT NOT NULL,
    client_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    connection_id TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_audit_log table for tracking credential access
CREATE TABLE public.integration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT NOT NULL,
    client_id UUID NOT NULL,
    action TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    purpose TEXT,
    session_token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create oauth_configurations table for storing OAuth app settings
CREATE TABLE public.oauth_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    auth_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    scope TEXT,
    redirect_uri TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_integration_sessions_token ON public.integration_sessions(session_token);
CREATE INDEX idx_integration_sessions_expires ON public.integration_sessions(expires_at);
CREATE INDEX idx_integration_audit_log_app_client ON public.integration_audit_log(app_name, client_id);
CREATE INDEX idx_integration_audit_log_created ON public.integration_audit_log(created_at DESC);
CREATE INDEX idx_oauth_configurations_app ON public.oauth_configurations(app_name);

-- Enable RLS
ALTER TABLE public.integration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for integration_sessions (server-side only)
CREATE POLICY "Only system can manage integration sessions"
ON public.integration_sessions
FOR ALL
USING (false);

-- Create policies for integration_audit_log
CREATE POLICY "Super admins can view integration audit logs"
ON public.integration_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert integration audit logs"
ON public.integration_audit_log
FOR INSERT
WITH CHECK (true);

-- Create policies for oauth_configurations
CREATE POLICY "Super admins can manage OAuth configurations"
ON public.oauth_configurations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert sample OAuth configurations for common integrations
INSERT INTO public.oauth_configurations (app_name, client_id, client_secret, auth_url, token_url, scope, redirect_uri) VALUES
('quickbooks', 'QUICKBOOKS_CLIENT_ID_PLACEHOLDER', 'QUICKBOOKS_CLIENT_SECRET_PLACEHOLDER', 'https://appcenter.intuit.com/connect/oauth2', 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 'com.intuit.quickbooks.accounting', 'https://your-domain.com/auth/quickbooks/callback'),
('hubspot', 'HUBSPOT_CLIENT_ID_PLACEHOLDER', 'HUBSPOT_CLIENT_SECRET_PLACEHOLDER', 'https://app.hubspot.com/oauth/authorize', 'https://api.hubapi.com/oauth/v1/token', 'contacts crm.objects.contacts.read crm.objects.contacts.write', 'https://your-domain.com/auth/hubspot/callback'),
('stripe', 'STRIPE_CLIENT_ID_PLACEHOLDER', 'STRIPE_CLIENT_SECRET_PLACEHOLDER', 'https://connect.stripe.com/oauth/authorize', 'https://connect.stripe.com/oauth/token', 'read_write', 'https://your-domain.com/auth/stripe/callback');

-- Add function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_integration_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.integration_sessions 
    WHERE expires_at < now();
END;
$$;

-- Add trigger for oauth_configurations updated_at
CREATE TRIGGER update_oauth_configurations_updated_at
    BEFORE UPDATE ON public.oauth_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();