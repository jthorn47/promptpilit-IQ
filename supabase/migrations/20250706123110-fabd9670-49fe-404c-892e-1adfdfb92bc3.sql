-- Fix critical RLS policy gaps for training_completions table
-- Add missing RLS policies for training_completions table

-- Allow learners to view their own completions
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

-- Allow learners to insert their own completions
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

-- Allow learners to update their own completions
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

-- Company admins can view their company's completions
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

-- Company admins can manage their company's completions
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

-- Super admins can manage all completions
CREATE POLICY "Super admins can manage all training completions"
ON public.training_completions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Add missing RLS policies for scene_completions table
-- Enable RLS on scene_completions if not already enabled
ALTER TABLE public.scene_completions ENABLE ROW LEVEL SECURITY;

-- Allow learners to view their own scene completions
CREATE POLICY "Learners can view their own scene completions"
ON public.scene_completions
FOR SELECT
USING (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow learners to insert their own scene completions
CREATE POLICY "Learners can insert their own scene completions"
ON public.scene_completions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow learners to update their own scene completions
CREATE POLICY "Learners can update their own scene completions"
ON public.scene_completions
FOR UPDATE
USING (
  has_role(auth.uid(), 'learner') AND
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Company admins can view their company's scene completions
CREATE POLICY "Company admins can view their company scene completions"
ON public.scene_completions
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin') AND
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.company_id = get_user_company_id(auth.uid())
  )
);

-- Company admins can manage their company's scene completions
CREATE POLICY "Company admins can manage their company scene completions"
ON public.scene_completions
FOR ALL
USING (
  has_role(auth.uid(), 'company_admin') AND
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.company_id = get_user_company_id(auth.uid())
  )
);

-- Super admins can manage all scene completions
CREATE POLICY "Super admins can manage all scene completions"
ON public.scene_completions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Secure the training-files storage bucket with proper RLS policies
-- Update storage policies to restrict access properly

-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can view training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update training files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete training files" ON storage.objects;

-- Create more secure storage policies
CREATE POLICY "Authenticated users can view training files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'training-files' AND
  auth.uid() IS NOT NULL
);

-- Only company admins and super admins can upload training files
CREATE POLICY "Admins can upload training files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Only company admins and super admins can update training files
CREATE POLICY "Admins can update training files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Only super admins and file owners can delete training files
CREATE POLICY "Admins can delete training files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'training-files' AND
  (has_role(auth.uid(), 'super_admin') OR owner = auth.uid())
);

-- Add audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  table_name TEXT,
  record_id UUID,
  details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log security events for monitoring
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata
  )
  VALUES (
    auth.uid(),
    'security_audit',
    'Security Event: ' || event_type,
    'Action performed on ' || table_name || ' with ID: ' || record_id::text,
    jsonb_build_object(
      'event_type', event_type,
      'table_name', table_name,
      'record_id', record_id,
      'user_id', auth.uid(),
      'timestamp', now(),
      'details', details
    )
  );
END;
$$;