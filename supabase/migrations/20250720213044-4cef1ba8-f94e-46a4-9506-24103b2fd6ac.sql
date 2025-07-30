-- Create benefit_plans table first (needed for foreign key references)
CREATE TABLE public.benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  carrier_id UUID REFERENCES public.benefit_carriers(id),
  plan_type_id UUID REFERENCES public.benefit_plan_types(id),
  tier_premiums JSONB DEFAULT '{}',
  deductible_info JSONB DEFAULT '{}',
  coverage_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  effective_date DATE,
  termination_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on benefit_plans
ALTER TABLE public.benefit_plans ENABLE ROW LEVEL SECURITY;

-- Policy for company admins to manage their benefit plans
CREATE POLICY "Company admins can manage their benefit plans" 
ON public.benefit_plans 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Policy for company users to view their benefit plans
CREATE POLICY "Company users can view their benefit plans" 
ON public.benefit_plans 
FOR SELECT 
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at trigger for benefit_plans
CREATE OR REPLACE TRIGGER update_benefit_plans_updated_at
    BEFORE UPDATE ON public.benefit_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_halo_updated_at();

-- Now create benefit_enrollments table for tracking employee enrollments
CREATE TABLE public.benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID NOT NULL,
  plan_id UUID REFERENCES public.benefit_plans(id) ON DELETE CASCADE NOT NULL,
  enrollment_tier TEXT NOT NULL CHECK (enrollment_tier IN ('employee', 'employee_spouse', 'employee_children', 'family')),
  enrollment_date DATE NOT NULL,
  termination_date DATE,
  monthly_premium DECIMAL(10,2) NOT NULL,
  employee_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
  employer_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create benefit_costs table for tracking cost trends and historical data
CREATE TABLE public.benefit_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  cost_period DATE NOT NULL,
  cost_category TEXT NOT NULL CHECK (cost_category IN ('medical', 'dental', 'vision', 'life', 'disability')),
  total_premium_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_claims_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  average_cost_per_employee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_costs ENABLE ROW LEVEL SECURITY;

-- Policies for benefit_enrollments
CREATE POLICY "Company admins can manage their benefit enrollments" 
ON public.benefit_enrollments 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view their benefit enrollments" 
ON public.benefit_enrollments 
FOR SELECT 
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Policies for benefit_costs
CREATE POLICY "Company admins can manage their benefit costs" 
ON public.benefit_costs 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view their benefit costs" 
ON public.benefit_costs 
FOR SELECT 
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_benefit_enrollments_updated_at
    BEFORE UPDATE ON public.benefit_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_halo_updated_at();

CREATE OR REPLACE TRIGGER update_benefit_costs_updated_at
    BEFORE UPDATE ON public.benefit_costs
    FOR EACH ROW
    EXECUTE FUNCTION update_halo_updated_at();

-- Insert sample benefit plans for existing companies
INSERT INTO public.benefit_plans (company_id, name, description, status, effective_date)
SELECT 
  cs.id,
  'Medical Plan - ' || cs.company_name,
  'Comprehensive medical coverage for employees',
  'active',
  CURRENT_DATE
FROM public.company_settings cs
WHERE cs.lifecycle_stage = 'client'
LIMIT 5;

-- Insert sample data for testing analytics
INSERT INTO public.benefit_costs (company_id, cost_period, cost_category, total_premium_cost, total_claims_cost, employee_count, average_cost_per_employee)
SELECT 
  cs.id,
  date_trunc('month', CURRENT_DATE - INTERVAL '6 months' + (generate_series(0, 5) * INTERVAL '1 month')),
  unnest(ARRAY['medical', 'dental', 'vision']),
  ROUND((RANDOM() * 50000 + 10000)::numeric, 2),
  ROUND((RANDOM() * 30000 + 5000)::numeric, 2),
  ROUND(RANDOM() * 50 + 10),
  ROUND((RANDOM() * 800 + 200)::numeric, 2)
FROM public.company_settings cs
WHERE cs.lifecycle_stage = 'client'
LIMIT 10;