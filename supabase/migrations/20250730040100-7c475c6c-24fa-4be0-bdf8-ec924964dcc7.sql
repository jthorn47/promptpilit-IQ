-- Drop the duplicate get_twilio_credentials functions to resolve overloading conflict
DROP FUNCTION IF EXISTS public.get_twilio_credentials(text);
DROP FUNCTION IF EXISTS public.get_twilio_credentials(uuid);

-- Create a single, properly defined get_twilio_credentials function
CREATE OR REPLACE FUNCTION public.get_twilio_credentials(p_client_id text)
RETURNS TABLE(
  account_sid text,
  auth_token text,
  messaging_service_sid text,
  phone_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (i.credentials->>'account_sid')::text,
    (i.credentials->>'auth_token')::text,
    (i.credentials->>'messaging_service_sid')::text,
    (i.credentials->>'phone_number')::text
  FROM public.integrations i
  JOIN public.integration_providers ip ON i.provider_id = ip.id
  WHERE ip.name = 'twilio' 
    AND i.status = 'active'
    AND (p_client_id IS NULL OR i.client_id::text = p_client_id)
  LIMIT 1;
END;
$$;