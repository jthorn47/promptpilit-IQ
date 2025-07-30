-- Fix user profiles and user_roles RLS policies to allow proper user management

-- Add missing RLS policies for profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add missing policy for user_roles management by super admins
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow company admins to manage user roles in their company
CREATE POLICY "Company admins can manage roles in their company"
ON public.user_roles FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  company_id = get_user_company_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  company_id = get_user_company_id(auth.uid())
);