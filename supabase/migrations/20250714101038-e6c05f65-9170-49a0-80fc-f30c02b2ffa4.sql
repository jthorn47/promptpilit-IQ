-- Role consolidation: Update app_role enum and add is_employee field
-- Remove deprecated roles: internal_staff, sales_rep, moderator
-- Keep: super_admin, admin, company_admin, learner
-- Add is_employee boolean to profiles table

-- First, migrate any existing deprecated role users to admin
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE role IN ('internal_staff', 'sales_rep', 'moderator');

-- Add is_employee field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_employee boolean NOT NULL DEFAULT false;

-- Set is_employee = true for users who are in the employees table
UPDATE public.profiles 
SET is_employee = true 
WHERE user_id IN (
  SELECT DISTINCT e.user_id 
  FROM public.employees e 
  WHERE e.user_id IS NOT NULL
);

-- Remove deprecated roles from app_role enum
-- Note: We need to create a new enum and migrate to it
CREATE TYPE public.app_role_new AS ENUM ('super_admin', 'admin', 'company_admin', 'learner');

-- Update user_roles table to use new enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE app_role_new USING role::text::app_role_new;

-- Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Update has_crm_role function to use admin instead of internal_staff
CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND p.email ILIKE '%@easeworks.com'
      AND _role IN ('admin', 'super_admin')
  )
$function$;

-- Update RLS policies that referenced internal_staff
DROP POLICY IF EXISTS "Internal staff and account managers can view clients" ON public.clients;
DROP POLICY IF EXISTS "Internal staff and account managers can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Internal staff can view published training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Internal staff can view training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Internal staff can view training assignments" ON public.training_assignments;

-- Recreate policies with admin role
CREATE POLICY "Admin and account managers can view clients" 
ON public.clients 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin and account managers can manage clients" 
ON public.clients 
FOR ALL 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin can view published training modules" 
ON public.training_modules 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin')) 
WHERE status = 'published';

CREATE POLICY "Admin can view training completions" 
ON public.training_completions 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin can view training assignments" 
ON public.training_assignments 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update other policies that may reference internal_staff
UPDATE pg_policies 
SET qual = REPLACE(qual, 'internal_staff', 'admin')
WHERE qual LIKE '%internal_staff%';

UPDATE pg_policies 
SET with_check = REPLACE(with_check, 'internal_staff', 'admin')
WHERE with_check LIKE '%internal_staff%';

-- Update activity templates policy
DROP POLICY IF EXISTS "Easeworks sales reps can manage activity templates" ON public.activity_templates;
CREATE POLICY "Easeworks admin can manage activity templates" 
ON public.activity_templates 
FOR ALL 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update activities policy
DROP POLICY IF EXISTS "Easeworks internal staff can manage activities" ON public.activities;
CREATE POLICY "Easeworks admin can manage activities" 
ON public.activities 
FOR ALL 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update analytics reports policy
DROP POLICY IF EXISTS "Easeworks sales reps can manage analytics reports" ON public.analytics_reports;
CREATE POLICY "Easeworks admin can manage analytics reports" 
ON public.analytics_reports 
FOR ALL 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update automation workflows policy
DROP POLICY IF EXISTS "Easeworks sales reps manage automation workflows" ON public.automation_workflows;
CREATE POLICY "Easeworks admin manage automation workflows" 
ON public.automation_workflows 
FOR ALL 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update automation executions policy
DROP POLICY IF EXISTS "Easeworks users view automation executions" ON public.automation_executions;
CREATE POLICY "Easeworks admin view automation executions" 
ON public.automation_executions 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'admin') OR has_crm_role(auth.uid(), 'super_admin'));

-- Comment for documentation
COMMENT ON COLUMN public.profiles.is_employee IS 'Boolean flag indicating if the user is an active employee eligible for HR tools. Independent of app_role system access level.';