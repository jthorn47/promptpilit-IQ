-- Update Easier package pricing to start at $33.00 with proportional scaling
-- Update Easiest package pricing to start at $39.00 with proportional scaling

-- Update Easier package (was 20% higher than original Easy $33.00, now starts at $33.00)
UPDATE pricing_matrix 
SET price_per_user = CASE 
  WHEN pt.min_users = 5 THEN 33.00
  WHEN pt.min_users = 26 THEN 29.70
  WHEN pt.min_users = 36 THEN 26.73
  WHEN pt.min_users = 51 THEN 24.32
  WHEN pt.min_users = 76 THEN 22.14
  WHEN pt.min_users = 101 THEN 20.36
  WHEN pt.min_users = 201 THEN 18.74
  WHEN pt.min_users = 301 THEN 17.42
  WHEN pt.min_users = 401 THEN 16.38
  WHEN pt.min_users = 501 THEN 15.56
  WHEN pt.min_users = 1001 THEN 14.78
END,
updated_at = now()
FROM pricing_tiers pt, course_packages cp
WHERE pricing_matrix.pricing_tier_id = pt.id 
  AND pricing_matrix.course_package_id = cp.id 
  AND cp.name = 'Easier';

-- Update Easiest package (starts at $39.00)
UPDATE pricing_matrix 
SET price_per_user = CASE 
  WHEN pt.min_users = 5 THEN 39.00
  WHEN pt.min_users = 26 THEN 35.10
  WHEN pt.min_users = 36 THEN 31.59
  WHEN pt.min_users = 51 THEN 28.73
  WHEN pt.min_users = 76 THEN 26.16
  WHEN pt.min_users = 101 THEN 24.07
  WHEN pt.min_users = 201 THEN 22.14
  WHEN pt.min_users = 301 THEN 20.59
  WHEN pt.min_users = 401 THEN 19.35
  WHEN pt.min_users = 501 THEN 18.39
  WHEN pt.min_users = 1001 THEN 17.47
END,
updated_at = now()
FROM pricing_tiers pt, course_packages cp
WHERE pricing_matrix.pricing_tier_id = pt.id 
  AND pricing_matrix.course_package_id = cp.id 
  AND cp.name = 'Easiest';