-- Fix Kelly's password to use proper bcrypt hashing
UPDATE auth.users 
SET encrypted_password = crypt('test123', gen_salt('bf'))
WHERE email = 'kelly@easeworks.com';