-- CRITICAL SECURITY FIXES

-- 1. Fix the overly permissive RLS policy on user_roles table
-- First, drop the dangerous policy that allows anyone to manage user roles
DROP POLICY IF EXISTS "System can manage user roles" ON public.user_roles;

-- Create secure RLS policies for user_roles
-- Only super admins can insert/update/delete user roles
CREATE POLICY "Super admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Fix database functions with missing search_path
-- Update critical functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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

CREATE OR REPLACE FUNCTION public.has_company_role(_user_id uuid, _role app_role, _company_id uuid)
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
      AND (company_id = _company_id OR role = 'super_admin')
  )
$$;

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

-- 3. Add missing RLS policies for critical tables

-- Add RLS policies for email_templates table
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

-- Add RLS policies for user_permissions table
CREATE POLICY "Super admins can manage user permissions" 
ON public.user_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

-- Add RLS policies for role_permissions table
CREATE POLICY "Super admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
USING (true); -- Read-only access for all authenticated users

-- Add RLS policies for permissions table
CREATE POLICY "Super admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view permissions" 
ON public.permissions 
FOR SELECT 
USING (true); -- Read-only access for all authenticated users

-- 4. Add validation constraints to prevent privilege escalation
-- Ensure user_id is properly set and cannot be null for critical tables
ALTER TABLE public.user_roles ALTER COLUMN user_id SET NOT NULL;

-- Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  company_id uuid,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  reason text
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view role audit logs" 
ON public.role_change_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert role audit logs" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);

-- Create trigger function for role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_audit (
      user_id, new_role, company_id, changed_by, reason
    ) VALUES (
      NEW.user_id, NEW.role, NEW.company_id, auth.uid(), 'Role assigned'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_change_audit (
      user_id, old_role, new_role, company_id, changed_by, reason
    ) VALUES (
      NEW.user_id, OLD.role, NEW.role, NEW.company_id, auth.uid(), 'Role changed'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_audit (
      user_id, old_role, company_id, changed_by, reason
    ) VALUES (
      OLD.user_id, OLD.role, OLD.company_id, auth.uid(), 'Role removed'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for auditing role changes
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_roles;
CREATE TRIGGER audit_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();