-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.generate_six_digit_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_2fa_settings
  SET 
    email_code = NULL,
    email_code_expires_at = NULL
  WHERE email_code_expires_at < now();
  
  UPDATE public.user_2fa_settings
  SET 
    activation_code = NULL,
    activation_expires_at = NULL
  WHERE activation_expires_at < now();
END;
$$;