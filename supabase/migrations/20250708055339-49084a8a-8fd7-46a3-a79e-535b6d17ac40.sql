-- Enable Row Level Security on training_scenes table
ALTER TABLE public.training_scenes ENABLE ROW LEVEL SECURITY;

-- Company admins and super admins can manage training scenes
CREATE POLICY "Company admins can manage training scenes" 
ON public.training_scenes 
FOR ALL 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'company_admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Learners can view training scenes (for training flow)
CREATE POLICY "Learners can view training scenes" 
ON public.training_scenes 
FOR SELECT 
USING (
  has_role(auth.uid(), 'learner'::app_role)
  OR has_role(auth.uid(), 'company_admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);