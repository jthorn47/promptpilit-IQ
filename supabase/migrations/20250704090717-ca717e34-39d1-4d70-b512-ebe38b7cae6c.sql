-- Update admin email address
UPDATE auth.users 
SET email = 'jeffrey@easeworks.com'
WHERE email = 'jeffrey@jeffreythorn.com';