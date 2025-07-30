-- Fix function search_path security warnings by updating existing functions
-- This addresses the WARN level security issues about functions without search_path

-- Update get_user_company_id with search_path
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id 
  FROM public.user_roles 
  WHERE user_id = $1 
  LIMIT 1;
$$;

-- Update has_role with search_path
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 AND role = role_name
  );
$$;

-- Update has_crm_role with search_path
CREATE OR REPLACE FUNCTION public.has_crm_role(user_id uuid, role_name app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 AND role = role_name
  );
$$;

-- Update has_crm_access with search_path
CREATE OR REPLACE FUNCTION public.has_crm_access(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    AND (
      ur.role IN ('super_admin', 'company_admin', 'internal_staff') OR
      (ur.role = 'company_admin' AND ur.company_id = _company_id)
    )
  );
$$;

-- Update user_has_permission with search_path
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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