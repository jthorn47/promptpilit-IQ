-- Continue fixing remaining functions with search path issues

-- Update increment_share_view_count function
CREATE OR REPLACE FUNCTION public.increment_share_view_count(share_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.shared_links 
  SET view_count = view_count + 1 
  WHERE token = share_token AND is_active = true AND (expires_at IS NULL OR expires_at > now());
END;
$function$;

-- Update update_updated_at_staffing function
CREATE OR REPLACE FUNCTION public.update_updated_at_staffing()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update generate_staffing_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_staffing_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.staffing_invoice_sequence')::TEXT, 6, '0');
END;
$function$;

-- Update auto_generate_invoice_number function
CREATE OR REPLACE FUNCTION public.auto_generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_staffing_invoice_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update generate_share_token function
CREATE OR REPLACE FUNCTION public.generate_share_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use base64 encoding instead of base64url for compatibility
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$function$;

-- Update use_share_token function
CREATE OR REPLACE FUNCTION public.use_share_token(token_value text, user_ip inet DEFAULT NULL::inet)
 RETURNS TABLE(valid boolean, document_type text, document_id text, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token record
  SELECT * INTO token_record
  FROM public.document_share_tokens
  WHERE token = token_value
    AND is_active = true
    AND expires_at > now()
    AND (used_at IS NULL OR view_count < max_uses);
  
  -- Check if token exists and is valid
  IF token_record IS NULL THEN
    RETURN QUERY SELECT false, ''::TEXT, ''::TEXT, 'Invalid or expired token'::TEXT;
    RETURN;
  END IF;
  
  -- Update token usage
  UPDATE public.document_share_tokens
  SET 
    used_at = CASE WHEN used_at IS NULL THEN now() ELSE used_at END,
    used_by_ip = CASE WHEN used_by_ip IS NULL THEN user_ip ELSE used_by_ip END,
    view_count = view_count + 1,
    is_active = CASE WHEN view_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE token = token_value;
  
  -- Return success
  RETURN QUERY SELECT true, token_record.document_type, token_record.document_id, ''::TEXT;
END;
$function$;