-- Clear existing pricing data
DELETE FROM pricing_matrix;
DELETE FROM course_packages;
DELETE FROM pricing_tiers;

-- Insert WVPT Training package
INSERT INTO course_packages (name, description, course_count, display_order, is_active) VALUES
('WVPT Training', 'West Virginia Professional Training seats', 1, 1, true);

-- Insert pricing tiers based on WVPT structure
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
(1001, 999999, true); -- For 1000+ users

-- Insert pricing matrix with WVPT annual prices
WITH pricing_data AS (
  SELECT 
    t.id as tier_id,
    p.id as package_id,
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
    END as annual_price
  FROM pricing_tiers t
  CROSS JOIN course_packages p
  WHERE p.name = 'WVPT Training'
)
INSERT INTO pricing_matrix (pricing_tier_id, course_package_id, price_per_user, annual_discount_percentage, three_year_discount_percentage)
SELECT tier_id, package_id, annual_price, 0, 15.0
FROM pricing_data
WHERE annual_price IS NOT NULL;