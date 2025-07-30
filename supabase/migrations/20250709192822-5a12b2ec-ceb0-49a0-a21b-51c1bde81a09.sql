-- Update the existing location to be Riverlakes
UPDATE company_locations 
SET 
  location_name = 'F45 Training Riverlakes',
  address = '123 Riverlakes Blvd',
  city = 'Riverlakes',
  state = 'CA',
  zip_code = '93291',
  manager_name = 'Sarah Johnson',
  phone = '(559) 555-0123',
  email = 'riverlakes@f45training.com',
  is_primary = true
WHERE company_id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704';

-- Add the Visalia location
INSERT INTO company_locations (
  company_id,
  location_name,
  address,
  city,
  state,
  zip_code,
  manager_name,
  phone,
  email,
  is_primary,
  is_active
) VALUES (
  'de9f4dc9-d2b4-48b8-bf7f-291dabb64704',
  'F45 Training Visalia',
  '456 Main Street',
  'Visalia',
  'CA',
  '93277',
  'Mike Chen',
  '(559) 555-0124',
  'visalia@f45training.com',
  false,
  true
);

-- Update the company name to be more generic
UPDATE company_settings 
SET company_name = 'F45 Training Central Valley'
WHERE id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704';