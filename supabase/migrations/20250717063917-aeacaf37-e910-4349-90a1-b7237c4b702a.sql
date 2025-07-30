-- HALOworks Multi-Role Permissions System with Client Sandboxing

-- Core role definitions
CREATE TYPE public.halo_role AS ENUM (
  'system_admin',
  'payroll_ops', 
  'tax_team',
  'client_admin',
  'client_finance', 
  'client_hr',
  'broker_advisor',
  'employee',
  'partner_developer'
);

-- Module definitions
CREATE TYPE public.halo_module AS ENUM (
  'halocore',
  'halocalc', 
  'halocommand',
  'haloassist',
  'haloself',
  'halofiling',
  'halonet',
  'halovault',
  'halorisk',
  'halovision',
  'propgen',
  'haloflow'
);

-- Permission actions
CREATE TYPE public.permission_action AS ENUM (
  'read',
  'write',
  'delete',
  'admin',
  'approve',
  'override',
  'api_access'
);

-- Client sandboxing and role assignments
CREATE TABLE public.halo_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role halo_role NOT NULL,
  client_id UUID REFERENCES public.company_settings(id),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, client_id)
);

-- Module permissions matrix
CREATE TABLE public.halo_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role halo_role NOT NULL,
  module halo_module NOT NULL,
  action permission_action NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module, action)
);

-- Permission overrides for specific users
CREATE TABLE public.halo_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.company_settings(id),
  module halo_module NOT NULL,
  action permission_action NOT NULL,
  is_granted BOOLEAN NOT NULL,
  reason TEXT NOT NULL,
  granted_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Approval requests and chains
CREATE TABLE public.halo_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL,
  client_id UUID REFERENCES public.company_settings(id),
  request_type TEXT NOT NULL,
  module halo_module,
  action permission_action,
  resource_id UUID,
  request_data JSONB NOT NULL DEFAULT '{}',
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comprehensive audit trail
CREATE TABLE public.halo_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.company_settings(id),
  module halo_module NOT NULL,
  action permission_action NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  override_used BOOLEAN DEFAULT false,
  approval_request_id UUID REFERENCES public.halo_approval_requests(id),
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.halo_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halo_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halo_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halo_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halo_audit_trail ENABLE ROW LEVEL SECURITY;

-- Insert default role-permission matrix for HALOworks modules
INSERT INTO public.halo_role_permissions (role, module, action, is_allowed, requires_approval) VALUES
-- System Admin (full access)
('system_admin', 'halocore', 'admin', true, false),
('system_admin', 'halocalc', 'admin', true, false),
('system_admin', 'halocommand', 'admin', true, false),
('system_admin', 'haloassist', 'admin', true, false),
('system_admin', 'haloself', 'admin', true, false),
('system_admin', 'halofiling', 'admin', true, false),
('system_admin', 'halonet', 'admin', true, false),
('system_admin', 'halovault', 'admin', true, false),
('system_admin', 'halorisk', 'admin', true, false),
('system_admin', 'halovision', 'admin', true, false),
('system_admin', 'propgen', 'admin', true, false),
('system_admin', 'haloflow', 'admin', true, false),

-- Payroll Ops (operational access)
('payroll_ops', 'halocore', 'write', true, false),
('payroll_ops', 'halocalc', 'read', true, false),
('payroll_ops', 'halocommand', 'write', true, false),
('payroll_ops', 'haloassist', 'read', true, false),
('payroll_ops', 'halonet', 'write', true, false),
('payroll_ops', 'halovault', 'read', true, false),
('payroll_ops', 'haloflow', 'write', true, false),

-- Tax Team (filing and compliance)
('tax_team', 'halofiling', 'write', true, false),
('tax_team', 'halorisk', 'read', true, false),
('tax_team', 'halovault', 'read', true, false),
('tax_team', 'halocommand', 'read', true, false),

-- Client Admin (client-specific admin)
('client_admin', 'halocore', 'write', true, false),
('client_admin', 'haloassist', 'read', true, false),
('client_admin', 'haloself', 'read', true, false),
('client_admin', 'halovault', 'read', true, false),
('client_admin', 'haloflow', 'write', true, false),

-- Client Finance (financial data access)
('client_finance', 'halocore', 'read', true, false),
('client_finance', 'haloself', 'read', true, false),
('client_finance', 'halonet', 'read', true, false),
('client_finance', 'halovault', 'read', true, false),
('client_finance', 'halovision', 'read', true, false),

-- Client HR (employee management)
('client_hr', 'halocore', 'write', true, false),
('client_hr', 'haloassist', 'read', true, false),
('client_hr', 'haloself', 'read', true, false),
('client_hr', 'halovault', 'read', true, false),
('client_hr', 'haloflow', 'read', true, false),

-- Broker/Advisor (proposal and risk access)
('broker_advisor', 'propgen', 'write', true, false),
('broker_advisor', 'halorisk', 'read', true, false),
('broker_advisor', 'halovision', 'read', true, false),

-- Employee (self-service only)
('employee', 'haloself', 'read', true, false),
('employee', 'haloassist', 'read', true, false),

-- Partner Developer (API access only)
('partner_developer', 'halocore', 'api_access', true, true),
('partner_developer', 'halocalc', 'api_access', true, true),
('partner_developer', 'haloself', 'api_access', true, true);

-- Security definer functions for permission checking
CREATE OR REPLACE FUNCTION public.has_halo_permission(
  _user_id UUID,
  _module halo_module,
  _action permission_action,
  _client_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user has direct role permission
  SELECT COALESCE(
    (
      SELECT rp.is_allowed
      FROM halo_user_roles ur
      JOIN halo_role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = _user_id
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
        AND (_client_id IS NULL OR ur.client_id = _client_id OR ur.is_internal = true)
        AND rp.module = _module
        AND rp.action = _action
      LIMIT 1
    ),
    -- Check for permission overrides
    (
      SELECT po.is_granted
      FROM halo_permission_overrides po
      WHERE po.user_id = _user_id
        AND (_client_id IS NULL OR po.client_id = _client_id)
        AND po.module = _module
        AND po.action = _action
        AND (po.expires_at IS NULL OR po.expires_at > now())
      ORDER BY po.created_at DESC
      LIMIT 1
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_halo_clients(_user_id UUID)
RETURNS TABLE(client_id UUID, role halo_role, is_internal BOOLEAN)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.client_id, ur.role, ur.is_internal
  FROM halo_user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.log_halo_audit(
  _user_id UUID,
  _client_id UUID,
  _module halo_module,
  _action permission_action,
  _resource_type TEXT DEFAULT NULL,
  _resource_id UUID DEFAULT NULL,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _override_used BOOLEAN DEFAULT false,
  _approval_request_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO halo_audit_trail (
    user_id, client_id, module, action, resource_type, resource_id,
    old_values, new_values, override_used, approval_request_id
  ) VALUES (
    _user_id, _client_id, _module, _action, _resource_type, _resource_id,
    _old_values, _new_values, _override_used, _approval_request_id
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- RLS Policies for multi-tenant security
CREATE POLICY "Users can view their own roles" ON halo_user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System admins can manage all roles" ON halo_user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halo_user_roles
      WHERE user_id = auth.uid() AND role = 'system_admin' AND is_active = true
    )
  );

CREATE POLICY "Client admins can manage client roles" ON halo_user_roles
  FOR ALL USING (
    client_id IN (
      SELECT client_id FROM halo_user_roles
      WHERE user_id = auth.uid() AND role = 'client_admin' AND is_active = true
    )
  );

CREATE POLICY "Anyone can view role permissions matrix" ON halo_role_permissions
  FOR SELECT USING (true);

CREATE POLICY "System admins can manage permissions" ON halo_role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halo_user_roles
      WHERE user_id = auth.uid() AND role = 'system_admin' AND is_active = true
    )
  );

CREATE POLICY "Users can view their permission overrides" ON halo_permission_overrides
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permission overrides" ON halo_permission_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halo_user_roles
      WHERE user_id = auth.uid() 
        AND role IN ('system_admin', 'client_admin') 
        AND is_active = true
    )
  );

CREATE POLICY "Users can create approval requests" ON halo_approval_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can view their approval requests" ON halo_approval_requests
  FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Admins can manage approval requests" ON halo_approval_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM halo_user_roles
      WHERE user_id = auth.uid() 
        AND role IN ('system_admin', 'payroll_ops', 'client_admin') 
        AND is_active = true
    )
  );

CREATE POLICY "Users can view their audit trail" ON halo_audit_trail
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view client audit trails" ON halo_audit_trail
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM halo_user_roles
      WHERE user_id = auth.uid() 
        AND role IN ('system_admin', 'payroll_ops', 'client_admin') 
        AND is_active = true
    )
  );

-- Triggers for audit logging and timestamps
CREATE OR REPLACE FUNCTION public.update_halo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halo_user_roles_updated_at
  BEFORE UPDATE ON halo_user_roles
  FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halo_permission_overrides_updated_at
  BEFORE UPDATE ON halo_permission_overrides
  FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halo_approval_requests_updated_at
  BEFORE UPDATE ON halo_approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();