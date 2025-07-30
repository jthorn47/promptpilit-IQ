-- Create system registry table for global configuration settings
CREATE TABLE public.system_registry (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'date')),
    category TEXT NOT NULL DEFAULT 'General',
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_restart BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create audit table for tracking registry changes
CREATE TABLE public.system_registry_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    registry_key TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted')),
    old_value JSONB,
    new_value JSONB,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.system_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_registry_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for system_registry
CREATE POLICY "Super admins can manage registry entries" 
ON public.system_registry 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users with view_registry permission can read registry" 
ON public.system_registry 
FOR SELECT 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'developer'::app_role
    )
);

-- Create policies for system_registry_audit
CREATE POLICY "Super admins can view registry audit logs" 
ON public.system_registry_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert audit logs" 
ON public.system_registry_audit 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_system_registry_category ON public.system_registry(category);
CREATE INDEX idx_system_registry_is_active ON public.system_registry(is_active);
CREATE INDEX idx_system_registry_audit_key ON public.system_registry_audit(registry_key);
CREATE INDEX idx_system_registry_audit_performed_by ON public.system_registry_audit(performed_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_system_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_registry_updated_at
    BEFORE UPDATE ON public.system_registry
    FOR EACH ROW
    EXECUTE FUNCTION public.update_system_registry_updated_at();

-- Insert some sample registry entries
INSERT INTO public.system_registry (key, value, description, data_type, category) VALUES
('FICA_RATE_2025', '0.0765', 'FICA tax rate for 2025', 'number', 'Payroll'),
('MAX_LOGIN_ATTEMPTS', '5', 'Maximum failed login attempts before lockout', 'number', 'Security'),
('SESSION_TIMEOUT_MINUTES', '30', 'Session timeout in minutes', 'number', 'Security'),
('ENABLE_2FA', 'true', 'Enable two-factor authentication', 'boolean', 'Security'),
('UI_THEME', '{"primaryColor": "#655DC6", "mode": "light"}', 'Default UI theme configuration', 'json', 'UI'),
('COMPANY_NAME', 'EaseWorks', 'Company name for branding', 'string', 'General'),
('SUPPORT_EMAIL', 'support@easeworks.com', 'Support contact email', 'string', 'General'),
('API_RATE_LIMIT', '1000', 'API requests per hour limit', 'number', 'API'),
('MAINTENANCE_MODE', 'false', 'Enable maintenance mode', 'boolean', 'System'),
('BACKUP_RETENTION_DAYS', '90', 'Number of days to retain backups', 'number', 'System');