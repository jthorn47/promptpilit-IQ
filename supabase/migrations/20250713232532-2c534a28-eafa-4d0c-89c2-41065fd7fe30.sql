-- Manually confirm the test user's email
UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'jeffrey@easeworks.com';