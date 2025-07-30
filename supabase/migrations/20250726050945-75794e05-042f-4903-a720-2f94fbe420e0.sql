-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;

-- Create new policy that allows anonymous users to insert assessments
CREATE POLICY "Public can submit assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (true);

-- Also add a policy for anonymous users to view their own assessments (optional, for results page)
CREATE POLICY "Public can view submitted assessments"
ON public.assessments
FOR SELECT
USING (true);