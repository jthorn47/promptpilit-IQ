-- Clean up all test user data completely
DELETE FROM public.user_roles WHERE user_id IN (
  'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
  'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004'
);

DELETE FROM public.profiles WHERE user_id IN (
  'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
  'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004'
);

-- Also clean up by email in case there are orphans
DELETE FROM public.profiles WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

-- Delete auth users
DELETE FROM auth.users WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');