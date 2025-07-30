-- First check what policies currently exist
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';