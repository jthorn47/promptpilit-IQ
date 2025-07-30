-- Clear existing pricing data
DELETE FROM pricing_matrix;
DELETE FROM course_packages;
DELETE FROM pricing_tiers;

-- Insert the three course packages: Easy, Easier, Easiest
INSERT INTO course_packages (name, description, course_count, display_order, is_active) VALUES
('Easy', 'Basic training package - Essential workplace safety', 1, 1, true),
('Easier', 'Standard training package - Comprehensive safety training', 3, 2, true),
('Easiest', 'Premium training package - Complete safety solution', 5, 3, true);

-- Insert pricing tiers based on user count ranges
INSERT INTO pricing_tiers (min_users, max_users, is_active) VALUES
(5, 25, true),
(26, 35, true),
(36, 50, true),
(51, 75, true),
(76, 100, true),
(101, 200, true),
(201, 300, true),
(301, 400, true),
(401, 500, true),
(501, 1000, true),
(1001, 999999, true);

-- Insert pricing matrix for all three packages
WITH pricing_data AS (
  SELECT 
    t.id as tier_id,
    p.id as package_id,
    p.name as package_name,
    CASE 
      WHEN t.min_users = 5 THEN 33.00
      WHEN t.min_users = 26 THEN 29.70
      WHEN t.min_users = 36 THEN 26.73
      WHEN t.min_users = 51 THEN 24.32
      WHEN t.min_users = 76 THEN 22.14
      WHEN t.min_users = 101 THEN 20.36
      WHEN t.min_users = 201 THEN 18.74
      WHEN t.min_users = 301 THEN 17.42
      WHEN t.min_users = 401 THEN 16.38
      WHEN t.min_users = 501 THEN 15.56
      WHEN t.min_users = 1001 THEN 14.78
    END as base_price
  FROM pricing_tiers t
  CROSS JOIN course_packages p
)
INSERT INTO pricing_matrix (pricing_tier_id, course_package_id, price_per_user, annual_discount_percentage, three_year_discount_percentage)
SELECT 
  tier_id, 
  package_id, 
  CASE 
    WHEN package_name = 'Easy' THEN base_price
    WHEN package_name = 'Easier' THEN base_price * 1.20  -- 20% higher
    WHEN package_name = 'Easiest' THEN base_price * 1.50  -- 50% higher
  END as price_per_user,
  0,  -- annual discount
  15.0  -- 3-year discount
FROM pricing_data
WHERE base_price IS NOT NULL;