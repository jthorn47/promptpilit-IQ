-- Disable the problematic trigger that might be causing signup issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the problematic function
DROP FUNCTION IF EXISTS public.handle_new_client_signup();

-- Also ensure email confirmation is disabled for easier testing
-- This will be handled in Supabase settings