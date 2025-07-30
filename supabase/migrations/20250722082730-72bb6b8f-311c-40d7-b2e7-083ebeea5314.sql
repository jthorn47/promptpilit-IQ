-- Add specific permissions for client_admin role
INSERT INTO public.permissions (name, description, resource, action) VALUES
('view_dashboard', 'View dashboard', 'dashboard', 'read'),
('view_users', 'View users', 'users', 'read'),
('manage_users', 'Manage users', 'users', 'manage'),
('view_company_profile', 'View company profile', 'company', 'read'),
('edit_company_profile', 'Edit company profile', 'company', 'update'),
('view_training_module', 'View training module', 'training', 'read'),
('view_payroll_module', 'View payroll module', 'payroll', 'read'),
('view_sb553_module', 'View SB553 module', 'sb553', 'read'),
('view_hr_module', 'View HR module', 'hr', 'read'),
('view_billing', 'View billing', 'billing', 'read'),
('view_help', 'View help', 'help', 'read')
ON CONFLICT (name) DO NOTHING;

-- Seed permissions for client_admin
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'client_admin'::app_role, id FROM public.permissions
WHERE name IN (
  'view_dashboard',
  'view_users', 
  'manage_users',
  'view_company_profile',
  'edit_company_profile',
  'view_training_module',
  'view_payroll_module',
  'view_sb553_module',
  'view_hr_module',
  'view_billing',
  'view_help'
)
ON CONFLICT (role, permission_id) DO NOTHING;