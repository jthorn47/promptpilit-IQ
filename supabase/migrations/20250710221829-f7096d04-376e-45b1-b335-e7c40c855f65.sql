-- Create function to confirm test user emails
CREATE OR REPLACE FUNCTION public.confirm_test_user(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Update the user's email_confirmed_at timestamp
    UPDATE auth.users 
    SET email_confirmed_at = now(),
        updated_at = now()
    WHERE email = user_email;
END;
$$;