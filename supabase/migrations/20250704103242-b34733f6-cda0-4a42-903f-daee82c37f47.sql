-- Update the existing user's email and password
UPDATE auth.users 
SET 
  email = 'jeffrey@easeworks.com',
  encrypted_password = crypt('Change_123', gen_salt('bf'))
WHERE id = '51e451af-1fde-4094-ae08-36769470b783';

-- Update the profile email
UPDATE public.profiles 
SET email = 'jeffrey@easeworks.com'
WHERE user_id = '51e451af-1fde-4094-ae08-36769470b783';

-- Add super admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'super_admin');