-- CRM Email Module - Microsoft 365 Integration Database Schema

-- Table for storing user Microsoft 365 OAuth connections
CREATE TABLE public.crm_email_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email_address TEXT NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connection_status TEXT NOT NULL DEFAULT 'pending',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT crm_email_connections_user_id_unique UNIQUE(user_id),
    CONSTRAINT crm_email_connections_status_check CHECK (connection_status IN ('pending', 'connected', 'error', 'revoked'))
);

-- Table for storing email message metadata
CREATE TABLE public.crm_email_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    message_id TEXT NOT NULL, -- Microsoft Graph message ID
    thread_id TEXT,
    subject TEXT,
    sender_email TEXT,
    sender_name TEXT,
    recipients JSONB, -- Array of {email, name} objects
    cc_recipients JSONB,
    bcc_recipients JSONB,
    body_preview TEXT,
    body_content TEXT,
    is_html BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    has_attachments BOOLEAN DEFAULT false,
    message_type TEXT NOT NULL DEFAULT 'received',
    tracking_enabled BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT crm_email_messages_type_check CHECK (message_type IN ('sent', 'received', 'draft'))
);

-- Table for email open tracking
CREATE TABLE public.crm_email_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.crm_email_messages(id) ON DELETE CASCADE,
    tracking_token TEXT NOT NULL UNIQUE,
    recipient_email TEXT NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user email settings and preferences
CREATE TABLE public.crm_email_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    default_signature TEXT,
    enable_tracking BOOLEAN DEFAULT true,
    enable_notifications BOOLEAN DEFAULT true,
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_frequency_minutes INTEGER DEFAULT 5,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for audit logs and security monitoring
CREATE TABLE public.crm_email_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT crm_email_audit_action_check CHECK (action_type IN ('connect', 'disconnect', 'send', 'receive', 'track_open', 'sync', 'settings_update'))
);

-- Enable Row Level Security
ALTER TABLE public.crm_email_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_email_connections
CREATE POLICY "Users can manage their own email connections" 
ON public.crm_email_connections 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Easeworks staff can view email connections" 
ON public.crm_email_connections 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for crm_email_messages
CREATE POLICY "Users can manage their own email messages" 
ON public.crm_email_messages 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Easeworks staff can view email messages" 
ON public.crm_email_messages 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for crm_email_tracking
CREATE POLICY "Users can view tracking for their sent emails" 
ON public.crm_email_tracking 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.crm_email_messages m 
    WHERE m.id = crm_email_tracking.message_id 
    AND m.user_id = auth.uid()
));

CREATE POLICY "System can insert tracking data" 
ON public.crm_email_tracking 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for crm_email_settings
CREATE POLICY "Users can manage their own email settings" 
ON public.crm_email_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.crm_email_audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Easeworks staff can view all audit logs" 
ON public.crm_email_audit_logs 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert audit logs" 
ON public.crm_email_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_crm_email_connections_user_id ON public.crm_email_connections(user_id);
CREATE INDEX idx_crm_email_messages_user_id ON public.crm_email_messages(user_id);
CREATE INDEX idx_crm_email_messages_thread_id ON public.crm_email_messages(thread_id);
CREATE INDEX idx_crm_email_messages_message_type ON public.crm_email_messages(message_type);
CREATE INDEX idx_crm_email_tracking_message_id ON public.crm_email_tracking(message_id);
CREATE INDEX idx_crm_email_tracking_token ON public.crm_email_tracking(tracking_token);
CREATE INDEX idx_crm_email_settings_user_id ON public.crm_email_settings(user_id);
CREATE INDEX idx_crm_email_audit_logs_user_id ON public.crm_email_audit_logs(user_id);
CREATE INDEX idx_crm_email_audit_logs_created_at ON public.crm_email_audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_crm_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_crm_email_connections_updated_at
    BEFORE UPDATE ON public.crm_email_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_crm_email_updated_at();

CREATE TRIGGER update_crm_email_messages_updated_at
    BEFORE UPDATE ON public.crm_email_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_crm_email_updated_at();

CREATE TRIGGER update_crm_email_settings_updated_at
    BEFORE UPDATE ON public.crm_email_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_crm_email_updated_at();