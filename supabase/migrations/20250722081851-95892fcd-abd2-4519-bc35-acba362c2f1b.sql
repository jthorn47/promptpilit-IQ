-- Add client_admin to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'client_admin';

-- Add comment for documentation
COMMENT ON TYPE app_role IS 'Application roles: super_admin, company_admin, learner, internal_staff, sales_rep, admin, moderator, client_admin';

-- Add client_admin permissions to role_permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'client_admin'::app_role, id FROM public.permissions
WHERE name IN (
    'users.create', 'users.read', 'users.update', 'users.manage_roles',
    'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.publish',
    'training.create', 'training.read', 'training.update', 'training.delete', 'training.assign',
    'ai_content.create', 'ai_content.read', 'ai_content.update', 'ai_content.delete',
    'company.read', 'company.update',
    'analytics.read', 'reports.create', 'reports.read'
)
ON CONFLICT (role, permission_id) DO NOTHING;