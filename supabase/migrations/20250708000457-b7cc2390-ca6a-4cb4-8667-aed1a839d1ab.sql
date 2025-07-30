-- Temporarily add a policy to allow any authenticated user to create training modules for debugging
CREATE POLICY "Authenticated users can create training modules temporarily" 
ON public.training_modules 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);