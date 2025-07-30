-- Phase 1: RBAC + ABAC Database Schema Migration
-- Add client_id to user_roles for tenant scoping
ALTER TABLE public.user_roles ADD COLUMN client_id UUID;
ALTER TABLE public.user_roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.user_roles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create user_attributes table for ABAC
CREATE TABLE public.user_attributes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT,
    department TEXT,
    is_manager BOOLEAN NOT NULL DEFAULT false,
    certifications TEXT[] DEFAULT '{}',
    assigned_modules TEXT[] DEFAULT '{}',
    direct_reports UUID[] DEFAULT '{}',
    custom_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create permission_policies table
CREATE TABLE public.permission_policies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    feature TEXT NOT NULL,
    action TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create policy_conditions table for ABAC rules
CREATE TABLE public.policy_conditions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_id UUID NOT NULL REFERENCES public.permission_policies(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in', 'greater_than', 'less_than')),
    attribute_value TEXT NOT NULL,
    condition_type TEXT NOT NULL DEFAULT 'AND' CHECK (condition_type IN ('AND', 'OR')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policy_assignments table
CREATE TABLE public.policy_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_id UUID NOT NULL REFERENCES public.permission_policies(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    company_id UUID,
    client_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id)
);

-- Create role_templates table
CREATE TABLE public.role_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role app_role NOT NULL,
    template_name TEXT NOT NULL,
    default_attributes JSONB NOT NULL DEFAULT '{}',
    default_modules TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_attributes
CREATE POLICY "Users can view their own attributes" ON public.user_attributes
    FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage user attributes" ON public.user_attributes
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- RLS Policies for permission_policies
CREATE POLICY "Admins can manage permission policies" ON public.permission_policies
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view policies" ON public.permission_policies
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for policy_conditions  
CREATE POLICY "Admins can manage policy conditions" ON public.policy_conditions
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view conditions" ON public.policy_conditions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for policy_assignments
CREATE POLICY "Admins can manage policy assignments" ON public.policy_assignments
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view assignments" ON public.policy_assignments
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for role_templates
CREATE POLICY "Admins can manage role templates" ON public.role_templates
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "Authenticated users can view templates" ON public.role_templates
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_attributes_updated_at BEFORE UPDATE ON public.user_attributes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permission_policies_updated_at BEFORE UPDATE ON public.permission_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_assignments_updated_at BEFORE UPDATE ON public.policy_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_templates_updated_at BEFORE UPDATE ON public.role_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default role templates
INSERT INTO public.role_templates (role, template_name, default_attributes, default_modules) VALUES
('super_admin', 'Super Administrator', '{"job_title": "System Administrator", "department": "IT", "is_manager": true}', '{"system", "admin", "users", "permissions", "vault", "pulse", "hroiq"}'),
('company_admin', 'Company Administrator', '{"job_title": "Administrator", "department": "Administration", "is_manager": true}', '{"admin", "users", "vault", "pulse", "hroiq"}'),
('client_admin', 'Client Administrator', '{"job_title": "Manager", "department": "Management", "is_manager": true}', '{"vault", "pulse", "hroiq"}'),
('learner', 'Learner/Employee', '{"job_title": "Employee", "department": "General", "is_manager": false}', '{"pulse", "hroiq"}');

-- Insert default permission policies
INSERT INTO public.permission_policies (name, description, feature, action) VALUES
('can_manage_users', 'Can create, edit, and delete users', 'users', 'manage'),
('can_view_users', 'Can view user list and details', 'users', 'view'),
('can_manage_permissions', 'Can modify roles and permissions', 'permissions', 'manage'),
('can_view_reports', 'Can access and view reports', 'reports', 'view'),
('can_manage_cases', 'Can create and manage cases', 'cases', 'manage'),
('can_assign_training', 'Can assign training to users', 'training', 'assign'),
('can_manage_vault', 'Can upload and manage documents', 'vault', 'manage'),
('can_view_vault', 'Can view documents in vault', 'vault', 'view'),
('can_manage_system', 'Can access system configuration', 'system', 'manage'),
('can_view_analytics', 'Can view analytics dashboards', 'analytics', 'view');

-- Insert default policy assignments for roles
INSERT INTO public.policy_assignments (policy_id, role) 
SELECT p.id, 'super_admin'::app_role
FROM public.permission_policies p;

INSERT INTO public.policy_assignments (policy_id, role)
SELECT p.id, 'company_admin'::app_role  
FROM public.permission_policies p
WHERE p.name IN ('can_manage_users', 'can_view_users', 'can_view_reports', 'can_manage_cases', 'can_assign_training', 'can_manage_vault', 'can_view_vault', 'can_view_analytics');

INSERT INTO public.policy_assignments (policy_id, role)
SELECT p.id, 'client_admin'::app_role
FROM public.permission_policies p  
WHERE p.name IN ('can_view_users', 'can_view_reports', 'can_manage_cases', 'can_view_vault', 'can_view_analytics');

INSERT INTO public.policy_assignments (policy_id, role)
SELECT p.id, 'learner'::app_role
FROM public.permission_policies p
WHERE p.name IN ('can_view_vault');