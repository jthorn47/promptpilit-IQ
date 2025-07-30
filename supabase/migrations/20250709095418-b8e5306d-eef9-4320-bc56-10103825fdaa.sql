-- Fix RLS policies for training_modules table to allow authenticated users to create/update modules

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Users can create training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Users can update training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Users can delete training modules" ON public.training_modules;

-- Create new policies that allow authenticated users to manage training modules
CREATE POLICY "Allow authenticated users to view training modules"
ON public.training_modules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create training modules"
ON public.training_modules FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update training modules"
ON public.training_modules FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete training modules"
ON public.training_modules FOR DELETE
TO authenticated
USING (true);

-- Also ensure training_scenes has proper policies
DROP POLICY IF EXISTS "Users can view training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Users can create training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Users can update training scenes" ON public.training_scenes;
DROP POLICY IF EXISTS "Users can delete training scenes" ON public.training_scenes;

CREATE POLICY "Allow authenticated users to view training scenes"
ON public.training_scenes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create training scenes"
ON public.training_scenes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update training scenes"
ON public.training_scenes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete training scenes"
ON public.training_scenes FOR DELETE
TO authenticated
USING (true);