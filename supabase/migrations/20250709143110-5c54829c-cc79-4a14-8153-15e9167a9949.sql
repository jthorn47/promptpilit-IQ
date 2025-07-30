-- Create permissions table for granular access control
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    resource TEXT NOT NULL, -- e.g., 'documents', 'users', 'training', 'ai_content'
    action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions mapping table
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(role, permission_id)
);

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for permissions
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for role_permissions
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
-- User management
('users.create', 'Create new users', 'users', 'create'),
('users.read', 'View users', 'users', 'read'),
('users.update', 'Update user information', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),
('users.manage_roles', 'Manage user roles', 'users', 'manage_roles'),

-- Document management
('documents.create', 'Create documents', 'documents', 'create'),
('documents.read', 'View documents', 'documents', 'read'),
('documents.update', 'Update documents', 'documents', 'update'),
('documents.delete', 'Delete documents', 'documents', 'delete'),
('documents.publish', 'Publish documents', 'documents', 'publish'),

-- Training management
('training.create', 'Create training modules', 'training', 'create'),
('training.read', 'View training modules', 'training', 'read'),
('training.update', 'Update training modules', 'training', 'update'),
('training.delete', 'Delete training modules', 'training', 'delete'),
('training.assign', 'Assign training to users', 'training', 'assign'),

-- AI Content
('ai_content.create', 'Generate AI content', 'ai_content', 'create'),
('ai_content.read', 'View AI content', 'ai_content', 'read'),
('ai_content.update', 'Edit AI content', 'ai_content', 'update'),
('ai_content.delete', 'Delete AI content', 'ai_content', 'delete'),

-- Company management
('company.read', 'View company settings', 'company', 'read'),
('company.update', 'Update company settings', 'company', 'update'),
('company.manage', 'Full company management', 'company', 'manage'),

-- Analytics and reporting
('analytics.read', 'View analytics', 'analytics', 'read'),
('reports.create', 'Create reports', 'reports', 'create'),
('reports.read', 'View reports', 'reports', 'read'),

-- System administration
('system.manage', 'System administration', 'system', 'manage'),
('audit.read', 'View audit logs', 'audit', 'read');

-- Assign default permissions to roles
-- Super Admin gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, id FROM public.permissions;

-- Company Admin permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'company_admin'::app_role, id FROM public.permissions
WHERE name IN (
    'users.create', 'users.read', 'users.update', 'users.manage_roles',
    'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.publish',
    'training.create', 'training.read', 'training.update', 'training.delete', 'training.assign',
    'ai_content.create', 'ai_content.read', 'ai_content.update', 'ai_content.delete',
    'company.read', 'company.update',
    'analytics.read', 'reports.create', 'reports.read'
);

-- Internal Staff permissions (for Easeworks employees)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'internal_staff'::app_role, id FROM public.permissions
WHERE name IN (
    'users.read', 'company.read', 'analytics.read', 'reports.read', 'audit.read'
);

-- Sales Rep permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'sales_rep'::app_role, id FROM public.permissions
WHERE name IN (
    'users.read', 'company.read', 'analytics.read', 'reports.read'
);

-- Learner permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'learner'::app_role, id FROM public.permissions
WHERE name IN (
    'training.read', 'documents.read', 'ai_content.read'
);

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  )
$$;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT, description TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT p.name, p.resource, p.action, p.description
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.resource, p.action
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();