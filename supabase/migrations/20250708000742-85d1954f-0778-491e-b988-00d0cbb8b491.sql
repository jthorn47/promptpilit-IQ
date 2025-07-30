-- Remove the temporary policy that was added for debugging
DROP POLICY IF EXISTS "Authenticated users can create training modules temporarily" ON public.training_modules;