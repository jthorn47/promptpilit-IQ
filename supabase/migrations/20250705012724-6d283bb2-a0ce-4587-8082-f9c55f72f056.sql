-- Create course packages table
CREATE TABLE public.course_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_count INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing tiers table
CREATE TABLE public.pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_users INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing matrix table
CREATE TABLE public.pricing_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_tier_id UUID NOT NULL REFERENCES public.pricing_tiers(id) ON DELETE CASCADE,
  course_package_id UUID NOT NULL REFERENCES public.course_packages(id) ON DELETE CASCADE,
  price_per_user DECIMAL(10,2) NOT NULL,
  annual_discount_percentage DECIMAL(5,2) DEFAULT 0,
  three_year_discount_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pricing_tier_id, course_package_id)
);

-- Enable RLS
ALTER TABLE public.course_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_matrix ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for pricing calculator)
CREATE POLICY "Course packages are viewable by everyone" 
ON public.course_packages FOR SELECT USING (is_active = true);

CREATE POLICY "Pricing tiers are viewable by everyone" 
ON public.pricing_tiers FOR SELECT USING (is_active = true);

CREATE POLICY "Pricing matrix is viewable by everyone" 
ON public.pricing_matrix FOR SELECT USING (true);

-- Create policies for admin management
CREATE POLICY "Admins can manage course packages" 
ON public.course_packages FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

CREATE POLICY "Admins can manage pricing tiers" 
ON public.pricing_tiers FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

CREATE POLICY "Admins can manage pricing matrix" 
ON public.pricing_matrix FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_course_packages_updated_at
  BEFORE UPDATE ON public.course_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_matrix_updated_at
  BEFORE UPDATE ON public.pricing_matrix
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial course packages based on your matrix
INSERT INTO public.course_packages (name, description, course_count, display_order) VALUES
('Single Course', 'Access to one training course', 1, 1),
('Duo Package', 'Access to two training courses', 2, 2),
('Triple Package', 'Access to three training courses', 3, 3),
('Essential Package', 'Access to five core training courses', 5, 4),
('Full Catalog', 'Complete access to all training courses', 999, 5);

-- Insert pricing tiers based on your matrix
INSERT INTO public.pricing_tiers (min_users, max_users) VALUES
(1, 24),
(25, 34),
(35, 49),
(50, 74),
(75, 99),
(100, 199),
(200, 299),
(300, 399),
(400, 499),
(500, 599),
(600, 699),
(700, 799);

-- Insert pricing matrix data based on your image
WITH tier_package_prices AS (
  SELECT 
    t.id as tier_id,
    p.id as package_id,
    CASE 
      WHEN t.min_users = 1 AND p.course_count = 1 THEN 23.48
      WHEN t.min_users = 1 AND p.course_count = 2 THEN 30.52
      WHEN t.min_users = 1 AND p.course_count = 3 THEN 35.22
      WHEN t.min_users = 1 AND p.course_count = 5 THEN 42.26
      WHEN t.min_users = 1 AND p.course_count = 999 THEN 51.65
      WHEN t.min_users = 25 AND p.course_count = 1 THEN 46.36
      WHEN t.min_users = 25 AND p.course_count = 2 THEN 50.35
      WHEN t.min_users = 25 AND p.course_count = 3 THEN 54.83
      WHEN t.min_users = 25 AND p.course_count = 5 THEN 60.57
      WHEN t.min_users = 25 AND p.course_count = 999 THEN 69.96
      WHEN t.min_users = 35 AND p.course_count = 1 THEN 39.55
      WHEN t.min_users = 35 AND p.course_count = 2 THEN 44.45
      WHEN t.min_users = 35 AND p.course_count = 3 THEN 48.99
      WHEN t.min_users = 35 AND p.course_count = 5 THEN 55.12
      WHEN t.min_users = 35 AND p.course_count = 999 THEN 64.51
      WHEN t.min_users = 50 AND p.course_count = 1 THEN 34.37
      WHEN t.min_users = 50 AND p.course_count = 2 THEN 39.96
      WHEN t.min_users = 50 AND p.course_count = 3 THEN 44.55
      WHEN t.min_users = 50 AND p.course_count = 5 THEN 50.97
      WHEN t.min_users = 50 AND p.course_count = 999 THEN 60.36
      WHEN t.min_users = 75 AND p.course_count = 1 THEN 31.24
      WHEN t.min_users = 75 AND p.course_count = 2 THEN 37.25
      WHEN t.min_users = 75 AND p.course_count = 3 THEN 41.87
      WHEN t.min_users = 75 AND p.course_count = 5 THEN 48.47
      WHEN t.min_users = 75 AND p.course_count = 999 THEN 57.86
      WHEN t.min_users = 100 AND p.course_count = 1 THEN 27.34
      WHEN t.min_users = 100 AND p.course_count = 2 THEN 33.59
      WHEN t.min_users = 100 AND p.course_count = 3 THEN 38.11
      WHEN t.min_users = 100 AND p.course_count = 5 THEN 44.70
      WHEN t.min_users = 100 AND p.course_count = 999 THEN 53.83
      WHEN t.min_users = 200 AND p.course_count = 1 THEN 24.01
      WHEN t.min_users = 200 AND p.course_count = 2 THEN 30.04
      WHEN t.min_users = 200 AND p.course_count = 3 THEN 34.28
      WHEN t.min_users = 200 AND p.course_count = 5 THEN 40.51
      WHEN t.min_users = 200 AND p.course_count = 999 THEN 49.03
      WHEN t.min_users = 300 AND p.course_count = 1 THEN 21.93
      WHEN t.min_users = 300 AND p.course_count = 2 THEN 27.67
      WHEN t.min_users = 300 AND p.course_count = 3 THEN 31.66
      WHEN t.min_users = 300 AND p.course_count = 5 THEN 37.55
      WHEN t.min_users = 300 AND p.course_count = 999 THEN 45.55
      WHEN t.min_users = 400 AND p.course_count = 1 THEN 20.20
      WHEN t.min_users = 400 AND p.course_count = 2 THEN 25.61
      WHEN t.min_users = 400 AND p.course_count = 3 THEN 29.33
      WHEN t.min_users = 400 AND p.course_count = 5 THEN 34.85
      WHEN t.min_users = 400 AND p.course_count = 999 THEN 42.33
      WHEN t.min_users = 500 AND p.course_count = 1 THEN 18.40
      WHEN t.min_users = 500 AND p.course_count = 2 THEN 23.66
      WHEN t.min_users = 500 AND p.course_count = 3 THEN 27.06
      WHEN t.min_users = 500 AND p.course_count = 5 THEN 33.15
      WHEN t.min_users = 500 AND p.course_count = 999 THEN 40.45
      WHEN t.min_users = 600 AND p.course_count = 1 THEN 17.39
      WHEN t.min_users = 600 AND p.course_count = 2 THEN 22.21
      WHEN t.min_users = 600 AND p.course_count = 3 THEN 25.40
      WHEN t.min_users = 600 AND p.course_count = 5 THEN 31.86
      WHEN t.min_users = 600 AND p.course_count = 999 THEN 38.56
      WHEN t.min_users = 700 AND p.course_count = 1 THEN 16.45
      WHEN t.min_users = 700 AND p.course_count = 2 THEN 21.64
      WHEN t.min_users = 700 AND p.course_count = 3 THEN 24.70
      WHEN t.min_users = 700 AND p.course_count = 5 THEN 30.67
      WHEN t.min_users = 700 AND p.course_count = 999 THEN 37.05
    END as price
  FROM public.pricing_tiers t
  CROSS JOIN public.course_packages p
)
INSERT INTO public.pricing_matrix (pricing_tier_id, course_package_id, price_per_user, three_year_discount_percentage)
SELECT tier_id, package_id, price, 15.0 -- 15% discount for 3-year plans
FROM tier_package_prices
WHERE price IS NOT NULL;