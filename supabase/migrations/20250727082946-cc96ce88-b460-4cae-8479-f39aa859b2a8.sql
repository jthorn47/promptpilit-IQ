-- Fix function search path security issues by dropping and recreating functions properly

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.has_crm_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.has_company_role(uuid, app_role, uuid);

-- Recreate functions with proper search_path

-- Function to get user's company ID
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

-- Function to check if user has a specific role
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

-- Function to check if user has CRM role
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

-- Function to check if user has company-specific role
CREATE OR REPLACE FUNCTION public.has_company_role(user_id uuid, role_name app_role, company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1
      AND role = role_name
      AND (company_id = $3 OR role_name = 'super_admin')
  );
$$;