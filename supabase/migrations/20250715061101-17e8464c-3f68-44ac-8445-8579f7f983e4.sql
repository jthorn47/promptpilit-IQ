-- Allow public access to published SBW-9237 modules for training purposes
CREATE POLICY "Public can view published SBW-9237 modules for training"
ON public.client_sbw9237_modules
FOR SELECT
USING (status = 'published');