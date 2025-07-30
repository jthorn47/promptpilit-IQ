-- Phase 1D: Create test client_admin user and sample data

-- Insert a test company with modules enabled
INSERT INTO public.company_settings (
  company_name, 
  primary_color,
  modules_enabled
) VALUES (
  'Test Client Company',
  '#655DC6',
  ARRAY['training', 'hr', 'sb553', 'payroll']
) ON CONFLICT (company_name) DO UPDATE SET 
  modules_enabled = EXCLUDED.modules_enabled;

-- Create a test client_admin user
-- Note: This creates a role assignment that will be picked up when a user with this email signs up
DO $$
DECLARE
  test_company_id UUID;
BEGIN
  -- Get the test company ID
  SELECT id INTO test_company_id
  FROM public.company_settings 
  WHERE company_name = 'Test Client Company'
  LIMIT 1;
  
  -- Check if test user exists (we'll use a placeholder ID for now)
  -- In production, this would be done after user signup
  
  -- For testing purposes, let's insert a sample user role entry
  -- This will be updated once the actual user signs up
  INSERT INTO public.user_roles (
    user_id, 
    role, 
    company_id
  ) 
  SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID, -- Placeholder ID
    'client_admin'::app_role,
    test_company_id
  WHERE test_company_id IS NOT NULL
  ON CONFLICT (user_id, role, company_id) DO NOTHING;
  
END $$;