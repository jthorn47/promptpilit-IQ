-- Update SMS webhook function to use Twilio credentials from integrations table
CREATE OR REPLACE FUNCTION get_twilio_credentials(p_client_id text DEFAULT NULL)
RETURNS TABLE(
  account_sid text,
  auth_token text,
  messaging_service_sid text,
  phone_number text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (i.credentials->>'account_sid')::text,
    (i.credentials->>'auth_token')::text,
    (i.credentials->>'messaging_service_sid')::text,
    (i.credentials->>'phone_number')::text
  FROM integrations i
  JOIN integration_providers ip ON i.provider_id = ip.id
  WHERE ip.name = 'twilio' 
    AND i.status = 'active'
    AND (p_client_id IS NULL OR i.client_id = p_client_id::uuid)
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;