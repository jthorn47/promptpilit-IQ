-- Fix security definer view issue
-- First, let's identify and fix any security definer views
DROP VIEW IF EXISTS public.user_company_view;

-- Fix function search path issues for all functions that don't have it set
-- Update existing functions to have proper search_path

-- Fix get_user_company_id function
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

-- Fix has_role function
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

-- Fix has_crm_role function
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

-- Fix has_company_role function
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id uuid, _role app_role, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (company_id = _company_id OR role = 'super_admin')
  );
$$;