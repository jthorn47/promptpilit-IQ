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

-- Create trigger function to validate Easeworks domain for CRM roles
CREATE OR REPLACE FUNCTION public.validate_crm_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the role is a CRM role (sales_rep or super_admin)
  IF NEW.role IN ('sales_rep', 'super_admin') THEN
    -- Check if user has @easeworks.com email
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = NEW.user_id 
      AND p.email ILIKE '%@easeworks.com'
    ) THEN
      RAISE EXCEPTION 'CRM roles (sales_rep, super_admin) can only be assigned to @easeworks.com users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce domain restriction
CREATE TRIGGER validate_crm_role_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_crm_role_assignment();