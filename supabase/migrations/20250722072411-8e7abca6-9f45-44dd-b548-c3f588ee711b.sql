-- Phase 1: Add client_admin role and work with existing RBAC system

-- 1. Add client_admin to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'client_admin';

-- 2. Insert permissions using existing table structure (id, name, description, resource, action)
INSERT INTO public.permissions (name, description, resource, action) VALUES
  ('view_dashboard', 'View main dashboard', 'dashboard', 'read'),
  ('view_users', 'View user management', 'users', 'read'),
  ('view_company_profile', 'View company profile and settings', 'company', 'read'),
  ('view_training_module', 'View training module', 'training', 'read'),
  ('view_hr_module', 'View HR module', 'hr', 'read'),
  ('view_sb553_module', 'View SB 553 module', 'sb553', 'read'),
  ('view_payroll_module', 'View payroll module', 'payroll', 'read'),
  ('view_billing', 'View billing information', 'billing', 'read'),
  ('manage_users', 'Manage users (invite, edit, remove)', 'users', 'write'),
  ('manage_self_company_only', 'Manage only own company data', 'company', 'write')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed client_admin role permissions using permission IDs
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'client_admin'::app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_dashboard',
  'view_users', 
  'view_company_profile',
  'view_training_module',
  'view_hr_module',
  'view_sb553_module',
  'view_payroll_module',
  'view_billing',
  'manage_users',
  'manage_self_company_only'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Also seed permissions for existing roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_dashboard',
  'view_users',
  'view_company_profile', 
  'view_training_module',
  'view_hr_module',
  'view_sb553_module',
  'view_payroll_module',
  'view_billing',
  'manage_users'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'company_admin'::app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_dashboard',
  'view_users',
  'view_company_profile',
  'view_training_module', 
  'view_hr_module',
  'view_sb553_module',
  'view_payroll_module',
  'view_billing',
  'manage_users',
  'manage_self_company_only'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'learner'::app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_dashboard',
  'view_training_module'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 4. Update company_settings to ensure modules_enabled exists
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

-- 5. Create/update helper function to check user permissions using existing structure
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_id
      AND p.name = permission_name
  );
$$;

-- 6. Create/update function to get user permissions using existing structure
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name TEXT, description TEXT, resource TEXT, action TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.name, p.description, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_id;
$$;