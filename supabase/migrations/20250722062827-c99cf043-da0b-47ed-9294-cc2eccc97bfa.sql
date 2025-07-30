-- Remove the duplicate learner role for client@testcompany.com that has no company
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'client@testcompany.com')
AND role = 'learner' 
AND company_id IS NULL;