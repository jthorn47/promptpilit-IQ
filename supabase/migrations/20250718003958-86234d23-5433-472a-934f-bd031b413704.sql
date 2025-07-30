-- Fix RLS policies that are trying to access auth.users directly
-- Drop problematic policies on training_completions table

DROP POLICY IF EXISTS "Learners can insert their own training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Learners can update their own training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Learners can view their own training completions" ON public.training_completions;

-- Create fixed policies that don't access auth.users directly
-- Instead, we'll use the user_id column in employees table or a profile table

CREATE POLICY "Learners can insert their own training completions" 
ON public.training_completions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'learner'::app_role) AND 
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Learners can update their own training completions" 
ON public.training_completions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'learner'::app_role) AND 
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Learners can view their own training completions" 
ON public.training_completions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'learner'::app_role) AND 
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

-- Also create a simple policy for super_admins to access reports data
CREATE POLICY "Super admins can access all training completion reports" 
ON public.training_completions 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));