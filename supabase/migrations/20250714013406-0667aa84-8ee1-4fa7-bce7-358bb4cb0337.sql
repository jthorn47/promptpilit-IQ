-- Enhance course_packages to include seat-based pricing
ALTER TABLE course_packages 
ADD COLUMN included_seats integer DEFAULT 1,
ADD COLUMN max_additional_seats integer,
ADD COLUMN allow_additional_seats boolean DEFAULT true,
ADD COLUMN price_per_additional_seat numeric DEFAULT 149.00;

-- Company seat allocations and usage
CREATE TABLE company_seat_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES company_settings(id),
  package_id uuid REFERENCES course_packages(id),
  total_seats integer NOT NULL,
  used_seats integer DEFAULT 0,
  purchased_seats integer DEFAULT 0, -- seats bought beyond package
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Track which specific courses are unlocked per company
CREATE TABLE company_unlocked_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES company_settings(id),
  training_module_id uuid REFERENCES training_modules(id),
  unlocked_at timestamptz DEFAULT now(),
  unlocked_by uuid,
  seat_allocation_id uuid REFERENCES company_seat_allocations(id),
  UNIQUE(company_id, training_module_id)
);

-- Seat purchase transactions and audit
CREATE TABLE seat_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES company_settings(id),
  action_type text NOT NULL, -- 'purchase', 'unlock', 'assign'
  training_module_id uuid REFERENCES training_modules(id),
  seats_change integer DEFAULT 0,
  price_paid numeric DEFAULT 0,
  stripe_payment_intent_id text,
  performed_by uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Configurable plan settings
CREATE TABLE seat_plan_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL, -- 'Easy', 'Easier', 'Easiest'
  included_seats integer NOT NULL,
  price_per_additional_seat numeric DEFAULT 149.00,
  allow_additional_seats boolean DEFAULT true,
  max_total_seats integer,
  default_courses uuid[] DEFAULT '{}', -- auto-unlocked courses
  auto_unlock_on_purchase boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training catalog with licensing metadata
ALTER TABLE training_modules 
ADD COLUMN available_for_licensing boolean DEFAULT true,
ADD COLUMN license_category text DEFAULT 'standard',
ADD COLUMN requires_special_approval boolean DEFAULT false,
ADD COLUMN seat_price_override numeric,
ADD COLUMN visibility_level text DEFAULT 'public'; -- 'public', 'enterprise', 'hidden'

-- Enable RLS on new tables
ALTER TABLE company_seat_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_unlocked_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_plan_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_seat_allocations
CREATE POLICY "Company admins can view their seat allocations" 
ON company_seat_allocations FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their seat allocations" 
ON company_seat_allocations FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for company_unlocked_courses
CREATE POLICY "Company users can view their unlocked courses" 
ON company_unlocked_courses FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_company_role(auth.uid(), 'learner'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage unlocked courses" 
ON company_unlocked_courses FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for seat_transactions
CREATE POLICY "Company admins can view their seat transactions" 
ON seat_transactions FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert seat transactions" 
ON seat_transactions FOR INSERT 
WITH CHECK (true);

-- RLS policies for seat_plan_configurations
CREATE POLICY "Super admins can manage seat plan configurations" 
ON seat_plan_configurations FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view active seat plans" 
ON seat_plan_configurations FOR SELECT 
USING (is_active = true);

-- Insert default seat plan configurations
INSERT INTO seat_plan_configurations (plan_name, included_seats, price_per_additional_seat, allow_additional_seats, max_total_seats, auto_unlock_on_purchase) VALUES
('Easy', 2, 149.00, true, 10, true),
('Easier', 5, 149.00, true, 25, true),
('Easiest', 10, 149.00, true, 50, true);

-- Update existing course_packages with seat information
UPDATE course_packages SET 
  included_seats = CASE 
    WHEN name = 'Easy' THEN 2
    WHEN name = 'Easier' THEN 5
    WHEN name = 'Easiest' THEN 10
    ELSE 1
  END,
  allow_additional_seats = true,
  price_per_additional_seat = 149.00,
  max_additional_seats = CASE 
    WHEN name = 'Easy' THEN 10
    WHEN name = 'Easier' THEN 25
    WHEN name = 'Easiest' THEN 50
    ELSE 10
  END;