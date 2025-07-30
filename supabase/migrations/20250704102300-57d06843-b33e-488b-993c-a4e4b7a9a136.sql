-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'company_admin', 'learner');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, company_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check company role
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id UUID, _role app_role, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (company_id = _company_id OR role = 'super_admin')
  )
$$;

-- Create function to get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('company_admin', 'learner')
  LIMIT 1
$$;

-- Drop all existing policies that depend on the role column
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can insert invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can manage training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage training assignments" ON public.training_assignments;
DROP POLICY IF EXISTS "Admins can view training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Admins can manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;

-- Now safe to drop the role column and add company reference
ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.company_settings(id) ON DELETE SET NULL;

-- Update handle_new_user function to create super_admin role for first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (user_id, email)
    VALUES (new.id, new.email);
    
    -- Check if this is the first user
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- If first user, make them super admin
    IF user_count <= 1 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, 'super_admin');
    END IF;
    
    RETURN new;
END;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create new policies using the role system

-- Assessments policies
CREATE POLICY "Super admins and company admins can view assessments"
ON public.assessments
FOR SELECT
USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'company_admin')
);

-- Invitations policies
CREATE POLICY "Super admins and company admins can view invitations"
ON public.invitations
FOR SELECT
USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'company_admin')
);

CREATE POLICY "Super admins and company admins can insert invitations"
ON public.invitations
FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'company_admin')
);

CREATE POLICY "Super admins and company admins can update invitations"
ON public.invitations
FOR UPDATE
USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'company_admin')
);

-- Training modules policies
CREATE POLICY "Super admins can manage all training modules"
ON public.training_modules
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their training modules"
ON public.training_modules
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    created_by = auth.uid()
);

CREATE POLICY "Learners can view published training modules"
ON public.training_modules
FOR SELECT
USING (
    status = 'published' AND
    (public.has_role(auth.uid(), 'learner') OR public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'super_admin'))
);

-- Employees policies
CREATE POLICY "Super admins can manage all employees"
ON public.employees
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their company employees"
ON public.employees
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    company_id = public.get_user_company_id(auth.uid())
);

-- Training assignments policies
CREATE POLICY "Super admins can manage all training assignments"
ON public.training_assignments
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their training assignments"
ON public.training_assignments
FOR ALL
USING (public.has_role(auth.uid(), 'company_admin'));

-- Training completions policies
CREATE POLICY "Super admins can view all training completions"
ON public.training_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their training completions"
ON public.training_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'company_admin'));

CREATE POLICY "Learners can view their own completions"
ON public.training_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'learner'));

-- Certificates policies
CREATE POLICY "Super admins can manage all certificates"
ON public.certificates
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their certificates"
ON public.certificates
FOR ALL
USING (public.has_role(auth.uid(), 'company_admin'));

-- Company settings policies
CREATE POLICY "Super admins can manage all company settings"
ON public.company_settings
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their company settings"
ON public.company_settings
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    id = public.get_user_company_id(auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();