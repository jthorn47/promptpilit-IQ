-- Fix critical RLS policy gaps - drop and recreate policies safely
-- Add missing RLS policies for training_completions table

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Learners can view their own training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Learners can insert their own training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Learners can update their own training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Company admins can view their company training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Company admins can manage their company training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Super admins can manage all training completions" ON public.training_completions;

-- Create comprehensive RLS policies for training_completions
CREATE POLICY "Learners can view their own training completions"
ON public.training_completions
FOR SELECT
USING (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Learners can insert their own training completions"
ON public.training_completions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Learners can update their own training completions"
ON public.training_completions
FOR UPDATE
USING (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Company admins can view their company training completions"
ON public.training_completions
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin') AND
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.company_id = get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Company admins can manage their company training completions"
ON public.training_completions
FOR ALL
USING (
  has_role(auth.uid(), 'company_admin') AND
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.company_id = get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Super admins can manage all training completions"
ON public.training_completions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Secure the training-files storage bucket
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can view training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete training files" ON storage.objects;

-- Create secure storage policies
CREATE POLICY "Authenticated users can view training files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'training-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can upload training files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Admins can update training files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Admins can delete training files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'super_admin') OR owner = auth.uid())
);