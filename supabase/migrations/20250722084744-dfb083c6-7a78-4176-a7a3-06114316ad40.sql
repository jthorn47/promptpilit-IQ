-- Fix the user role for client@testcompany.com
UPDATE user_roles 
SET role = 'client_admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'client@testcompany.com'
) AND role = 'company_admin';