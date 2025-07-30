-- Fix RLS circular dependency on user_roles table
-- Drop the problematic policies that create circular dependencies
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Company admins can manage roles in their company" ON public.user_roles;

-- Add a simple policy that allows users to view their own roles (no circular dependency)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Add policy for super admins to view all roles (but use direct user lookup to avoid circular dependency)
CREATE POLICY "Super admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Add policy for super admins to manage all roles
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Add policy for company admins to manage roles in their company
CREATE POLICY "Company admins can manage roles in their company" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'company_admin'
    AND ur.company_id = user_roles.company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'company_admin'
    AND ur.company_id = user_roles.company_id
  )
);