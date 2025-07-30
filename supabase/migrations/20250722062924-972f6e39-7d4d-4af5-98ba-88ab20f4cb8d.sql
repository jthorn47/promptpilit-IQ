-- Update client@testcompany.com with a fresh password hash for 'ClientPass456!'
-- Using the same format as other test users
UPDATE auth.users 
SET encrypted_password = crypt('ClientPass456!', gen_salt('bf'))
WHERE email = 'client@testcompany.com';