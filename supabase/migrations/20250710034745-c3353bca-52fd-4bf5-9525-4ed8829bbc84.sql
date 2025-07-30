-- Enhanced Security Tables for HIPAA and Payroll Compliance

-- Create security audit log table
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  event_type TEXT NOT NULL, -- login_attempt, data_access, export, print, etc.
  resource_type TEXT NOT NULL, -- employee_data, payroll, hipaa_data, etc.
  resource_id UUID,
  action TEXT NOT NULL, -- create, read, update, delete, export, print
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  sensitive_data_accessed BOOLEAN DEFAULT false,
  pii_fields_accessed TEXT[], -- Track specific PII fields
  data_classification TEXT, -- public, internal, confidential, restricted
  compliance_flags TEXT[], -- hipaa, pci, sox, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data encryption keys table
CREATE TABLE public.encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  key_type TEXT NOT NULL, -- field_encryption, file_encryption, backup_encryption
  algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
  key_version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rotation_date TIMESTAMP WITH TIME ZONE,
  next_rotation_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create data classification table
CREATE TABLE public.data_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  classification_level TEXT NOT NULL, -- public, internal, confidential, restricted
  data_type TEXT NOT NULL, -- pii, phi, financial, payroll
  encryption_required BOOLEAN NOT NULL DEFAULT false,
  access_level_required TEXT NOT NULL, -- view, edit, admin, super_admin
  retention_period_days INTEGER,
  compliance_requirements TEXT[], -- hipaa, pci, sox, gdpr
  masking_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(table_name, column_name)
);

-- Create session security table
CREATE TABLE public.user_sessions_security (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_country TEXT,
  location_city TEXT,
  is_trusted_device BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  login_method TEXT, -- password, sso, mfa, etc.
  mfa_verified BOOLEAN DEFAULT false,
  risk_assessment JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  terminated_at TIMESTAMP WITH TIME ZONE,
  termination_reason TEXT
);

-- Create password security policies table
CREATE TABLE public.password_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  min_length INTEGER NOT NULL DEFAULT 12,
  require_uppercase BOOLEAN DEFAULT true,
  require_lowercase BOOLEAN DEFAULT true,
  require_numbers BOOLEAN DEFAULT true,
  require_special_chars BOOLEAN DEFAULT true,
  max_age_days INTEGER DEFAULT 90,
  history_check_count INTEGER DEFAULT 12, -- Cannot reuse last 12 passwords
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MFA configuration table
CREATE TABLE public.mfa_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  totp_secret TEXT, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Encrypted backup codes
  sms_phone TEXT, -- Encrypted phone number
  email_verified BOOLEAN DEFAULT false,
  totp_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  backup_codes_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_required BOOLEAN DEFAULT false, -- Force MFA for this user
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data access permissions (fine-grained)
CREATE TABLE public.data_access_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- table name or resource type
  resource_id UUID, -- specific record ID (null for table-level)
  permission_type TEXT NOT NULL, -- read, write, delete, export, print
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  compliance_justification TEXT,
  UNIQUE(user_id, resource_type, resource_id, permission_type)
);

-- Create compliance violations tracking
CREATE TABLE public.compliance_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_type TEXT NOT NULL, -- hipaa_breach, unauthorized_access, data_export, etc.
  severity TEXT NOT NULL, -- low, medium, high, critical
  user_id UUID,
  session_id TEXT,
  resource_affected TEXT,
  violation_details JSONB,
  auto_detected BOOLEAN DEFAULT true,
  reported_by UUID,
  investigation_status TEXT DEFAULT 'open', -- open, investigating, resolved, dismissed
  resolution_notes TEXT,
  notification_sent BOOLEAN DEFAULT false,
  regulatory_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all security tables
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Super admins can view all security audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins manage encryption keys" 
ON public.encryption_keys 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins manage data classifications" 
ON public.data_classifications 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own session security" 
ON public.user_sessions_security 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage session security" 
ON public.user_sessions_security 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view MFA configurations" 
ON public.mfa_configurations 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can manage their own MFA" 
ON public.mfa_configurations 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all compliance violations" 
ON public.compliance_violations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_sensitive_data ON public.security_audit_logs(sensitive_data_accessed);
CREATE INDEX idx_user_sessions_security_user_id ON public.user_sessions_security(user_id);
CREATE INDEX idx_user_sessions_security_expires_at ON public.user_sessions_security(expires_at);
CREATE INDEX idx_compliance_violations_severity ON public.compliance_violations(severity);
CREATE INDEX idx_compliance_violations_created_at ON public.compliance_violations(created_at);

-- Insert default data classifications for existing tables
INSERT INTO public.data_classifications (table_name, column_name, classification_level, data_type, encryption_required, access_level_required, compliance_requirements) VALUES
-- Employee PII/PHI data
('employees', 'social_security_number', 'restricted', 'pii', true, 'super_admin', ARRAY['hipaa', 'sox']),
('employees', 'date_of_birth', 'confidential', 'pii', true, 'admin', ARRAY['hipaa']),
('employees', 'phone_number', 'confidential', 'pii', false, 'admin', ARRAY['hipaa']),
('employees', 'email', 'confidential', 'pii', false, 'admin', ARRAY['hipaa']),
('employees', 'emergency_contact', 'confidential', 'pii', false, 'admin', ARRAY['hipaa']),
('employees', 'medical_conditions', 'restricted', 'phi', true, 'super_admin', ARRAY['hipaa']),

-- Payroll sensitive data
('employee_tax_profiles', 'w4_dependents_amount', 'restricted', 'financial', true, 'super_admin', ARRAY['sox']),
('payroll_tax_withholdings', 'federal_income_tax', 'restricted', 'payroll', true, 'super_admin', ARRAY['sox']),
('payroll_tax_withholdings', 'state_income_tax', 'restricted', 'payroll', true, 'super_admin', ARRAY['sox']),
('payroll_tax_withholdings', 'social_security_employee', 'restricted', 'payroll', true, 'super_admin', ARRAY['sox']),

-- Banking/Financial data
('staffing_payroll_records', 'gross_pay', 'restricted', 'financial', true, 'super_admin', ARRAY['sox']),
('staffing_payroll_records', 'net_pay', 'restricted', 'financial', true, 'super_admin', ARRAY['sox']);

-- Insert default password policy
INSERT INTO public.password_policies (policy_name, min_length, max_age_days, history_check_count, max_failed_attempts) VALUES
('HIPAA_Compliant_Policy', 12, 90, 12, 5);

-- Add triggers for audit logging
CREATE TRIGGER update_mfa_configurations_updated_at
BEFORE UPDATE ON public.mfa_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();