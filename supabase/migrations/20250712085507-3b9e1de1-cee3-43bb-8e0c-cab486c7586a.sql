-- Drop the conflicting create_test_account function with text parameter
DROP FUNCTION IF EXISTS public.create_test_account(text, text, text, text);

-- Keep only the function with app_role parameter that matches our schema
-- The correct function is already in place, so no need to recreate it