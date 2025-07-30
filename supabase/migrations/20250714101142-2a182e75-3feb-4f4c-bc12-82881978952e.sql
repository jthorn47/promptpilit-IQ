-- Role consolidation: Phase 1 - Migrate existing deprecated roles to admin
-- First, migrate any existing deprecated role users to admin
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE role IN ('internal_staff', 'sales_rep', 'moderator');

-- Add is_employee field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_employee boolean NOT NULL DEFAULT false;

-- Set is_employee = true for users who are in the employees table
UPDATE public.profiles 
SET is_employee = true 
WHERE user_id IN (
  SELECT DISTINCT e.user_id 
  FROM public.employees e 
  WHERE e.user_id IS NOT NULL
);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.is_employee IS 'Boolean flag indicating if the user is an active employee eligible for HR tools. Independent of app_role system access level.';