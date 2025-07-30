-- Update RLS policies to use internal_staff instead of sales_rep

-- Update CRM-related policies to use internal_staff
DROP POLICY IF EXISTS "Easeworks sales reps can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Easeworks sales reps can manage deals" ON public.deals;
DROP POLICY IF EXISTS "Easeworks sales reps can manage activities" ON public.activities;
DROP POLICY IF EXISTS "Easeworks sales reps can view all company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Easeworks sales reps can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Easeworks sales reps can manage invitations" ON public.invitations;

-- Create new policies using internal_staff role
CREATE POLICY "Easeworks internal staff can manage leads" 
ON public.leads 
FOR ALL 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Easeworks internal staff can manage deals" 
ON public.deals 
FOR ALL 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Easeworks internal staff can manage activities" 
ON public.activities 
FOR ALL 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Easeworks internal staff can view all company settings" 
ON public.company_settings 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Easeworks internal staff can view all employees" 
ON public.employees 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Easeworks internal staff can manage invitations" 
ON public.invitations 
FOR ALL 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'))
WITH CHECK (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update has_crm_role function to check for internal_staff instead of sales_rep
CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND p.email ILIKE '%@easeworks.com'
      AND _role IN ('internal_staff', 'super_admin')
  )
$$;

-- Update validation trigger to use internal_staff
CREATE OR REPLACE FUNCTION public.validate_crm_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the role is a CRM role (internal_staff or super_admin)
  IF NEW.role IN ('internal_staff', 'super_admin') THEN
    -- Check if user has @easeworks.com email
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = NEW.user_id 
      AND p.email ILIKE '%@easeworks.com'
    ) THEN
      RAISE EXCEPTION 'CRM roles (internal_staff, super_admin) can only be assigned to @easeworks.com users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;