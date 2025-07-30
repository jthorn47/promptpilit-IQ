-- Drop ALL existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Company admins can manage roles in their company" ON public.user_roles;

-- Create a simple policy that allows authenticated users to see their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Create policy for inserting/updating roles (for system use)
CREATE POLICY "System can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);