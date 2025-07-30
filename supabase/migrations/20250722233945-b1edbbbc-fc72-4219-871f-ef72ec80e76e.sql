-- Create RPC functions for integration token management
CREATE OR REPLACE FUNCTION public.check_integration_connection(app_name text, client_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.integration_tokens 
    WHERE integration_tokens.app_name = check_integration_connection.app_name 
    AND integration_tokens.client_id = check_integration_connection.client_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_integration_status(app_name text, client_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token_record RECORD;
  needs_refresh boolean := false;
BEGIN
  SELECT expires_at INTO token_record
  FROM public.integration_tokens
  WHERE integration_tokens.app_name = get_integration_status.app_name
  AND integration_tokens.client_id = get_integration_status.client_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('connected', false);
  END IF;
  
  IF token_record.expires_at IS NOT NULL THEN
    needs_refresh := token_record.expires_at <= (now() + interval '5 minutes');
  END IF;
  
  RETURN jsonb_build_object(
    'connected', true,
    'expiresAt', token_record.expires_at,
    'needsRefresh', needs_refresh
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.disconnect_integration(app_name text, client_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.integration_tokens
  WHERE integration_tokens.app_name = disconnect_integration.app_name
  AND integration_tokens.client_id = disconnect_integration.client_id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_connected_integrations(client_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'app_name', app_name,
      'connected_at', created_at,
      'expires_at', expires_at,
      'needsRefresh', CASE 
        WHEN expires_at IS NOT NULL THEN expires_at <= (now() + interval '5 minutes')
        ELSE false
      END
    )
  ) INTO result
  FROM public.integration_tokens
  WHERE integration_tokens.client_id = get_connected_integrations.client_id
  ORDER BY created_at DESC;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;