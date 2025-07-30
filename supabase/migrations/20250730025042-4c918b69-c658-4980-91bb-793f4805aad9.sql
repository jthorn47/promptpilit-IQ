-- Create the get_twilio_credentials function using existing integrations table
CREATE OR REPLACE FUNCTION public.get_twilio_credentials(p_client_id UUID DEFAULT NULL)
RETURNS TABLE(
  account_sid TEXT,
  auth_token TEXT,
  phone_number TEXT,
  messaging_service_sid TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (i.credentials->>'account_sid')::TEXT as account_sid,
    (i.credentials->>'auth_token')::TEXT as auth_token,
    (i.credentials->>'phone_number')::TEXT as phone_number,
    (i.credentials->>'messaging_service_sid')::TEXT as messaging_service_sid
  FROM public.integrations i
  WHERE i.name = 'twilio'
    AND i.status = 'active'
    AND (p_client_id IS NULL OR i.company_id = p_client_id OR i.company_id IS NULL)
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;

-- Insert Twilio credentials for testing using existing structure
INSERT INTO public.integrations (
  name, 
  provider_id,
  credentials, 
  company_id, 
  status,
  sync_enabled
)
VALUES (
  'twilio',
  '08ef9dc7-13b0-4f0d-8611-a25728e8de0a',
  '{
    "account_sid": "AC2e383e3528ee0c9a63937112a97bb522",
    "auth_token": "your_auth_token_here",
    "phone_number": "+12132961422",
    "messaging_service_sid": null
  }'::jsonb,
  NULL,
  'active',
  false
);