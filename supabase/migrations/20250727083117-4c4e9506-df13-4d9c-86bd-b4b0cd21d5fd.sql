-- Fix remaining functions by adding search_path while keeping original parameter names

-- Update get_user_permissions with search_path
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS TABLE(permission_name text, description text, resource text, action text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT p.name, p.description, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = $1;
$$;

-- Update get_user_halo_clients with search_path
CREATE OR REPLACE FUNCTION public.get_user_halo_clients(_user_id uuid)
RETURNS TABLE(client_id uuid, role halo_role, is_internal boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.client_id, ur.role, ur.is_internal
  FROM halo_user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

-- Update get_enum_values with search_path
CREATE OR REPLACE FUNCTION public.get_enum_values(enum_name text)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ARRAY(
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = enum_name
    ORDER BY e.enumsortorder
  );
$$;

-- Update generate_case_share_token with search_path
CREATE OR REPLACE FUNCTION public.generate_case_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;