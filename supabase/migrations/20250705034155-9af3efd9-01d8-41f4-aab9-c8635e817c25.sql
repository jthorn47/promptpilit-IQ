-- Update Easy package pricing to start at $23.00 with proportional scaling
-- Current starting price was $33.00, new is $23.00 (scale factor: 0.697)

UPDATE pricing_matrix 
SET price_per_user = CASE 
  WHEN pt.min_users = 5 THEN 23.00
  WHEN pt.min_users = 26 THEN 20.70
  WHEN pt.min_users = 36 THEN 18.63
  WHEN pt.min_users = 51 THEN 16.95
  WHEN pt.min_users = 76 THEN 15.43
  WHEN pt.min_users = 101 THEN 14.19
  WHEN pt.min_users = 201 THEN 13.06
  WHEN pt.min_users = 301 THEN 12.14
  WHEN pt.min_users = 401 THEN 11.41
  WHEN pt.min_users = 501 THEN 10.85
  WHEN pt.min_users = 1001 THEN 10.30
END,
updated_at = now()
FROM pricing_tiers pt, course_packages cp
WHERE pricing_matrix.pricing_tier_id = pt.id 
  AND pricing_matrix.course_package_id = cp.id 
  AND cp.name = 'Easy';