-- Deactivate the middle packages to keep only 2 options
UPDATE course_packages 
SET is_active = false 
WHERE name IN ('Duo Package', 'Triple Package', 'Essential Package');

-- Update the remaining packages to be more clear
UPDATE course_packages 
SET 
  name = 'Core Training',
  description = 'Essential workplace safety training - perfect for compliance',
  display_order = 1
WHERE name = 'Single Course';

UPDATE course_packages 
SET 
  name = 'Complete Catalog',
  description = 'Full access to all training courses and future additions',
  display_order = 2
WHERE name = 'Full Catalog';