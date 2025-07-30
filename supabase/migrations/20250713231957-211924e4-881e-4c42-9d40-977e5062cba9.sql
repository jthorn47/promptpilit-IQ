-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_created_add_to_clients ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_client_signup() CASCADE;