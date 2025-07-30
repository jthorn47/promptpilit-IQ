-- Drop existing policies
DROP POLICY IF EXISTS "Company admins can manage their training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Learners can view training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Super admins can manage all training scenes" ON public.training_scenes;

-- Create a simpler policy that allows all authenticated users for now
CREATE POLICY "Authenticated users can manage training scenes" 
ON public.training_scenes 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);