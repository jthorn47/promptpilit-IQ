-- Update user_2fa_settings table to support email authentication
ALTER TABLE public.user_2fa_settings 
ADD COLUMN IF NOT EXISTS method text DEFAULT 'totp' CHECK (method IN ('totp', 'email')),
ADD COLUMN IF NOT EXISTS email_code text,
ADD COLUMN IF NOT EXISTS email_code_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_activated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS activation_code text,
ADD COLUMN IF NOT EXISTS activation_expires_at timestamp with time zone;

-- Update the method column for existing records to ensure they have 'totp' 
UPDATE public.user_2fa_settings 
SET method = 'totp' 
WHERE method IS NULL;

-- Create function to generate secure 6-digit codes
CREATE OR REPLACE FUNCTION public.generate_six_digit_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$;

-- Create function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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