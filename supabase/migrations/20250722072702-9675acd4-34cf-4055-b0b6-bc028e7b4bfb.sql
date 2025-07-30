-- Phase 1C: Drop existing function and recreate permissions system

-- Drop existing function to avoid conflict
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);

-- Insert permissions using existing table structure
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

-- Seed client_admin role permissions
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

-- Update company_settings to ensure modules_enabled exists
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

-- Create helper functions for permissions
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