-- Update password for jeffrey@easeworks.com to 'Change_123'
-- Note: This requires encrypting the password using Supabase's auth.crypt function
UPDATE auth.users 
SET encrypted_password = auth.crypt('Change_123', auth.gen_salt('bf'))
WHERE email = 'jeffrey@easeworks.com';