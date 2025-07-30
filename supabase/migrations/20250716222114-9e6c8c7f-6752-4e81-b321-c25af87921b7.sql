-- Create policy to allow edge function service role to insert companies
CREATE POLICY "Service role can insert companies for HubSpot import"
ON public.company_settings
FOR INSERT
TO service_role
WITH CHECK (true);