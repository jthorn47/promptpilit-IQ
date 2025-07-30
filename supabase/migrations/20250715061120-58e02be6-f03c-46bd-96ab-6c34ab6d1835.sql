-- Allow public access to client information when accessing published training
CREATE POLICY "Public can view client info for published training modules"
ON public.clients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_sbw9237_modules csm 
    WHERE csm.client_id = clients.id 
    AND csm.status = 'published'
  )
);