-- Add domain restriction function for Easeworks CRM access
CREATE OR REPLACE FUNCTION public.is_easeworks_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.email ILIKE '%@easeworks.com'
  )
$$;

-- Update has_role function to include domain restriction for CRM roles
CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND p.email ILIKE '%@easeworks.com'
      AND _role IN ('sales_rep', 'super_admin')
  )
$$;

-- Add constraint to prevent non-Easeworks users from getting CRM roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT check_easeworks_crm_roles 
CHECK (
  role NOT IN ('sales_rep', 'super_admin') OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = user_roles.user_id 
    AND p.email ILIKE '%@easeworks.com'
  )
);