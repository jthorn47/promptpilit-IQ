-- Update user profile to link to F45 company
UPDATE profiles 
SET company_id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704'
WHERE user_id = '51e451af-1fde-4094-ae08-36769470b783';

-- Update user role to be linked to F45 company
UPDATE user_roles 
SET company_id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704'
WHERE user_id = '51e451af-1fde-4094-ae08-36769470b783' AND role = 'company_admin';