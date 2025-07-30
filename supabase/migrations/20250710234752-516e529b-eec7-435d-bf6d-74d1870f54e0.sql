-- Fix the user roles
UPDATE user_roles 
SET role = 'learner'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'learner@testcompany.com');

UPDATE user_roles 
SET role = 'internal_staff'::app_role  
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sales@easeworks.com');

UPDATE user_roles 
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'staffing@easeworks.com');

-- The admin@testcompany.com and newadmin@testcompany.com can stay as company_admin

-- Let's verify the fix
SELECT 
  u.email,
  ur.role
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com', 'newadmin@testcompany.com')
ORDER BY u.email;