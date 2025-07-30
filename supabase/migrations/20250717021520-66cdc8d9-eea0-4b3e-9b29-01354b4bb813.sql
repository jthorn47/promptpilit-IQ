-- Fix services_purchased field to ensure proper JSON array format
UPDATE public.clients 
SET services_purchased = '["LMS"]'::jsonb 
WHERE services_purchased::text = 'LMS' OR services_purchased::text = '{LMS}';

-- Ensure all existing records have proper JSON array format
UPDATE public.clients 
SET services_purchased = CASE 
  WHEN services_purchased IS NULL THEN '["LMS"]'::jsonb
  WHEN jsonb_typeof(services_purchased) = 'string' THEN jsonb_build_array(services_purchased)
  WHEN jsonb_typeof(services_purchased) = 'object' AND jsonb_array_length(services_purchased) = 0 THEN '["LMS"]'::jsonb
  ELSE services_purchased
END
WHERE services_purchased IS NULL OR jsonb_typeof(services_purchased) != 'array';