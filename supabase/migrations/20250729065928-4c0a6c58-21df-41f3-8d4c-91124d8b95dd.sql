-- CRITICAL SECURITY FIXES - Handling existing policies

-- 1. Fix the overly permissive RLS policy on user_roles table
-- Drop the dangerous policy that allows anyone to manage user roles
DROP POLICY IF EXISTS "System can manage user roles" ON public.user_roles;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

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

-- 3. Add role change audit table for security monitoring
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

-- Drop existing policies for audit table
DROP POLICY IF EXISTS "Super admins can view role audit logs" ON public.role_change_audit;
DROP POLICY IF EXISTS "System can insert role audit logs" ON public.role_change_audit;

-- Create policies for audit table
CREATE POLICY "Super admins can view role audit logs" 
ON public.role_change_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert role audit logs" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);