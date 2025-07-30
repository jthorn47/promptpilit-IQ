-- Check and fix RLS policies on user_roles table
-- The issue might be that the user_roles table has overly restrictive RLS policies

-- Create a policy to allow users to read their own roles
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow the has_role function to bypass RLS by making it security definer
-- First, let's recreate the has_role function to ensure it's security definer
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