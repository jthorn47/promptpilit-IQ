-- First, let's check what profiles and roles exist
SELECT p.user_id, p.email, ur.role 
FROM profiles p 
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com', 'newadmin@testcompany.com');

-- Now let's create missing profiles and roles
INSERT INTO profiles (user_id, email, company_id)
SELECT u.id, u.email, 
  CASE 
    WHEN u.email LIKE '%testcompany.com' THEN (SELECT id FROM company_settings WHERE company_name = 'Test Company' LIMIT 1)
    ELSE NULL 
  END
FROM auth.users u
WHERE u.email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com')
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);

-- Create user roles
INSERT INTO user_roles (user_id, role, company_id)
SELECT u.id, 
  CASE 
    WHEN u.email = 'admin@testcompany.com' THEN 'company_admin'::app_role
    WHEN u.email = 'learner@testcompany.com' THEN 'learner'::app_role
    WHEN u.email = 'sales@easeworks.com' THEN 'internal_staff'::app_role
    WHEN u.email = 'staffing@easeworks.com' THEN 'admin'::app_role
  END,
  CASE 
    WHEN u.email LIKE '%testcompany.com' THEN (SELECT id FROM company_settings WHERE company_name = 'Test Company' LIMIT 1)
    ELSE NULL 
  END
FROM auth.users u
WHERE u.email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com')
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id);