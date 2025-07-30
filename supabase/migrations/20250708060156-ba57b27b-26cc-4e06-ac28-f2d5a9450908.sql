-- Fix overly permissive RLS policies on training_scenes table
-- Replace broad policies with proper company-scoped access

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Company admins can manage training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Learners can view training scenes" ON public.training_scenes;

-- Create proper company-scoped policies
-- Company admins can only manage training scenes from their company's training modules
CREATE POLICY "Company admins can manage their company training scenes" 
ON public.training_scenes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.training_modules tm 
    WHERE tm.id = training_scenes.training_module_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, tm.company_id) 
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.training_modules tm 
    WHERE tm.id = training_scenes.training_module_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, tm.company_id) 
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Learners can only view training scenes from their company's assigned training modules
CREATE POLICY "Learners can view assigned training scenes" 
ON public.training_scenes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.training_assignments ta
    JOIN public.employees e ON ta.employee_id = e.id
    WHERE ta.training_module_id = training_scenes.training_module_id
    AND e.email = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
    AND ta.status IN ('assigned', 'in_progress')
  )
  OR has_role(auth.uid(), 'company_admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admins can manage all training scenes
CREATE POLICY "Super admins can manage all training scenes" 
ON public.training_scenes 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));