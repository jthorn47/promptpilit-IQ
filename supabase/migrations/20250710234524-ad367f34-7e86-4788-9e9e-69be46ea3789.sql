-- Let's test the password hashing and see what's actually stored
SELECT email, encrypted_password, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@testcompany.com';

-- Let's also try updating with a freshly generated hash for "AdminPass456!"
UPDATE auth.users 
SET encrypted_password = crypt('AdminPass456!', gen_salt('bf'))
WHERE email = 'admin@testcompany.com';

-- And update others with "Password123!"
UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email IN ('learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

-- Also update the newadmin user
UPDATE auth.users 
SET encrypted_password = crypt('AdminPass456!', gen_salt('bf'))
WHERE email = 'newadmin@testcompany.com';

-- Let's verify the updates
SELECT email, encrypted_password, email_confirmed_at 
FROM auth.users 
WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com', 'newadmin@testcompany.com')
ORDER BY email;