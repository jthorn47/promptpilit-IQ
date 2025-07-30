-- Create TestClient_2025 with comprehensive payroll test data
-- This migration sets up a complete test environment for 2025 payroll processing

-- Insert test client company
INSERT INTO public.company_settings (
  id,
  company_name,
  address,
  city,
  state,
  postal_code,
  phone,
  website,
  ein,
  company_type,
  lifecycle_stage,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'TestClient_2025',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  '(555) 123-4567',
  'https://testclient2025.com',
  '12-3456789',
  'LLC',
  'client',
  '2025-01-01 00:00:00+00',
  now()
);