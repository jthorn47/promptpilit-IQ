-- Enable Row Level Security on training_scenes table
ALTER TABLE public.training_scenes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_scenes based on company/admin access patterns
-- Company admins can manage their training scenes
CREATE POLICY "Company admins can manage their training scenes" 
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

-- Super admins can manage all training scenes
CREATE POLICY "Super admins can manage all training scenes" 
ON public.training_scenes 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));