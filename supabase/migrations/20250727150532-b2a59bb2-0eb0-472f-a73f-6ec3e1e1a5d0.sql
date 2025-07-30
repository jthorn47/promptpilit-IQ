-- Remove learner role from super admin user
DELETE FROM user_roles 
WHERE user_id = '637678eb-d0bc-4262-8137-0c0216780731' 
AND role = 'learner';