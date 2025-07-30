-- Fix the token generation function to use supported encoding
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use base64 encoding instead of base64url for compatibility
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;