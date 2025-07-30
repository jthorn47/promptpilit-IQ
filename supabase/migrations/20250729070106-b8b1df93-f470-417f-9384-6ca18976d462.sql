-- Fix remaining security issues identified by the linter

-- 1. Add missing RLS policies for tables that have RLS enabled but no policies

-- Permissions table policies
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Users can view permissions" ON public.permissions;

CREATE POLICY "Super admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view permissions" 
ON public.permissions 
FOR SELECT 
USING (true);

-- Role permissions table policies
DROP POLICY IF EXISTS "Super admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Users can view role permissions" ON public.role_permissions;

CREATE POLICY "Super admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
USING (true);

-- User permissions table policies
DROP POLICY IF EXISTS "Super admins can manage user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;

CREATE POLICY "Super admins can manage user permissions" 
ON public.user_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

-- Email templates table policies
DROP POLICY IF EXISTS "Company admins can manage email templates" ON public.email_templates;

CREATE POLICY "Company admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- 2. Fix functions with mutable search_path by adding SET search_path = 'public'

-- Update all database functions to include proper search_path
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT company_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;