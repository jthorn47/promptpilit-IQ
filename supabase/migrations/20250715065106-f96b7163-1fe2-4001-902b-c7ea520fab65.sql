-- Check current RLS policies for client_sbw9237_modules
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'client_sbw9237_modules'
ORDER BY policyname;