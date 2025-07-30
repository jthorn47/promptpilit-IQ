-- Phase 1: Add client_admin role and create RBAC system (Fixed)

-- 1. Add client_admin to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'client_admin';

-- 2. Create permissions table (using permission_key instead of key)
CREATE TABLE IF NOT EXISTS public.permissions (
  permission_key TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 3. Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(permission_key) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (role, permission_key)
);

-- Enable RLS on role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Seed permissions
INSERT INTO public.permissions (permission_key, description) VALUES
  ('view_dashboard', 'View main dashboard'),
  ('view_users', 'View user management'),
  ('view_company_profile', 'View company profile and settings'),
  ('view_training_module', 'View training module'),
  ('view_hr_module', 'View HR module'),
  ('view_sb553_module', 'View SB 553 module'),
  ('view_payroll_module', 'View payroll module'),
  ('view_billing', 'View billing information'),
  ('manage_users', 'Manage users (invite, edit, remove)'),
  ('manage_self_company_only', 'Manage only own company data')
ON CONFLICT (permission_key) DO NOTHING;

-- 5. Seed client_admin role permissions
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('client_admin', 'view_dashboard'),
  ('client_admin', 'view_users'),
  ('client_admin', 'view_company_profile'),
  ('client_admin', 'view_training_module'),
  ('client_admin', 'view_hr_module'),
  ('client_admin', 'view_sb553_module'),
  ('client_admin', 'view_payroll_module'),
  ('client_admin', 'view_billing'),
  ('client_admin', 'manage_users'),
  ('client_admin', 'manage_self_company_only')
ON CONFLICT (role, permission_key) DO NOTHING;

-- Also seed permissions for existing roles
INSERT INTO public.role_permissions (role, permission_key) VALUES
  -- Super admin gets all permissions
  ('super_admin', 'view_dashboard'),
  ('super_admin', 'view_users'),
  ('super_admin', 'view_company_profile'),
  ('super_admin', 'view_training_module'),
  ('super_admin', 'view_hr_module'),
  ('super_admin', 'view_sb553_module'),
  ('super_admin', 'view_payroll_module'),
  ('super_admin', 'view_billing'),
  ('super_admin', 'manage_users'),
  
  -- Company admin gets most permissions
  ('company_admin', 'view_dashboard'),
  ('company_admin', 'view_users'),
  ('company_admin', 'view_company_profile'),
  ('company_admin', 'view_training_module'),
  ('company_admin', 'view_hr_module'),
  ('company_admin', 'view_sb553_module'),
  ('company_admin', 'view_payroll_module'),
  ('company_admin', 'view_billing'),
  ('company_admin', 'manage_users'),
  ('company_admin', 'manage_self_company_only'),
  
  -- Learner gets limited permissions
  ('learner', 'view_dashboard'),
  ('learner', 'view_training_module')
ON CONFLICT (role, permission_key) DO NOTHING;

-- 6. Update company_settings to ensure modules_enabled exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_settings' 
    AND column_name = 'modules_enabled'
  ) THEN
    ALTER TABLE public.company_settings 
    ADD COLUMN modules_enabled TEXT[] DEFAULT ARRAY['training'];
  END IF;
END $$;

-- 7. Create RLS policies for permissions and role_permissions
CREATE POLICY "Users can view permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Users can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage permissions" ON public.permissions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- 8. Create helper function to check user permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = user_id
      AND rp.permission_key = permission_key
  );
$$;

-- 9. Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permission_key TEXT, description TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.permission_key, p.description
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_key = p.permission_key
  WHERE ur.user_id = user_id;
$$;