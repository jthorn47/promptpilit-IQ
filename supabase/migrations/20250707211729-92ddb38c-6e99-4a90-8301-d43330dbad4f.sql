-- Drop existing problematic policies
DROP POLICY IF EXISTS "Company admins can manage their training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Learners can view published scenes" ON public.training_scenes;

-- Create proper RLS policies for training_scenes
CREATE POLICY "Company admins can manage their training scenes" 
ON public.training_scenes 
FOR ALL 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create policy for learners to view scenes
CREATE POLICY "Learners can view training scenes" 
ON public.training_scenes 
FOR SELECT 
USING (
  status = 'active' AND (
    has_role(auth.uid(), 'learner'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);