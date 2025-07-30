-- Create Universal Client Settings Schema
-- This table stores all module settings for each tenant in a standardized format

CREATE TABLE public.client_module_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  settings JSONB NOT NULL DEFAULT '{}',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, module_name)
);

-- Enable Row Level Security
ALTER TABLE public.client_module_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for client settings access
CREATE POLICY "Users can view their tenant's module settings" 
ON public.client_module_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = tenant_id
    AND ur.role IN ('super_admin', 'admin', 'payroll_manager', 'hr_manager')
  )
);

CREATE POLICY "Authorized users can update module settings" 
ON public.client_module_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = tenant_id
    AND ur.role IN ('super_admin', 'admin', 'payroll_manager', 'hr_manager')
  )
);

-- Create audit log table for settings changes
CREATE TABLE public.client_settings_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'reset', 'delete')),
  old_values JSONB,
  new_values JSONB,
  old_version TEXT,
  new_version TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS for audit table
ALTER TABLE public.client_settings_audit ENABLE ROW LEVEL SECURITY;

-- Audit table policy
CREATE POLICY "Users can view their tenant's settings audit logs" 
ON public.client_settings_audit 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = tenant_id
    AND ur.role IN ('super_admin', 'admin')
  )
);

-- Create function to automatically update last_updated_at
CREATE OR REPLACE FUNCTION update_client_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_settings_updated_at_trigger
BEFORE UPDATE ON public.client_module_settings
FOR EACH ROW
EXECUTE FUNCTION update_client_settings_updated_at();

-- Create function to log settings changes
CREATE OR REPLACE FUNCTION log_client_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.client_settings_audit (
    tenant_id,
    module_name,
    action_type,
    old_values,
    new_values,
    old_version,
    new_version,
    performed_by
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    COALESCE(NEW.module_name, OLD.module_name),
    CASE TG_OP
      WHEN 'INSERT' THEN 'create'
      WHEN 'UPDATE' THEN 'update'
      WHEN 'DELETE' THEN 'delete'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD.settings) ELSE to_jsonb(OLD.settings) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW.settings) END,
    OLD.version,
    NEW.version,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
CREATE TRIGGER log_client_settings_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.client_module_settings
FOR EACH ROW
EXECUTE FUNCTION log_client_settings_changes();

-- Create indexes for performance
CREATE INDEX idx_client_module_settings_tenant_module ON public.client_module_settings(tenant_id, module_name);
CREATE INDEX idx_client_settings_audit_tenant_module ON public.client_settings_audit(tenant_id, module_name);
CREATE INDEX idx_client_settings_audit_performed_at ON public.client_settings_audit(performed_at DESC);