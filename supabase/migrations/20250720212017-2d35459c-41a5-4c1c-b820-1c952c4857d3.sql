
-- Create benefit_plans table for company-specific benefit plans
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

-- Add RLS policies for benefit_plans
ALTER TABLE public.benefit_plans ENABLE ROW LEVEL SECURITY;

-- Policy for company admins to manage their own benefit plans
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

-- Add some sample carriers if the table is empty
INSERT INTO public.benefit_carriers (name, type, contact_info, logo_url, is_active) 
VALUES 
  ('Blue Cross Blue Shield', 'medical', '{"phone": "1-800-BCBS", "email": "info@bcbs.com"}', null, true),
  ('Aetna', 'medical', '{"phone": "1-800-AETNA", "email": "info@aetna.com"}', null, true),
  ('Cigna', 'medical', '{"phone": "1-800-CIGNA", "email": "info@cigna.com"}', null, true),
  ('Delta Dental', 'dental', '{"phone": "1-800-DELTA", "email": "info@deltadentalins.com"}', null, true),
  ('MetLife', 'life', '{"phone": "1-800-METLIFE", "email": "info@metlife.com"}', null, true),
  ('VSP Vision Care', 'vision', '{"phone": "1-800-VSP", "email": "info@vsp.com"}', null, true)
ON CONFLICT (name) DO NOTHING;

-- Add some sample plan types if needed
INSERT INTO public.benefit_plan_types (category, subcategory, code, description)
VALUES 
  ('Medical', 'HMO', 'MED_HMO', 'Health Maintenance Organization'),
  ('Medical', 'PPO', 'MED_PPO', 'Preferred Provider Organization'),
  ('Medical', 'HDHP', 'MED_HDHP', 'High Deductible Health Plan'),
  ('Dental', 'DPPO', 'DEN_PPO', 'Dental PPO'),
  ('Dental', 'DHMO', 'DEN_HMO', 'Dental HMO'),
  ('Vision', 'Vision', 'VIS_STD', 'Standard Vision Plan'),
  ('Life', 'Basic Life', 'LIFE_BASIC', 'Basic Life Insurance'),
  ('Life', 'Voluntary Life', 'LIFE_VOL', 'Voluntary Life Insurance'),
  ('Disability', 'STD', 'DIS_STD', 'Short Term Disability'),
  ('Disability', 'LTD', 'DIS_LTD', 'Long Term Disability')
ON CONFLICT (code) DO NOTHING;
