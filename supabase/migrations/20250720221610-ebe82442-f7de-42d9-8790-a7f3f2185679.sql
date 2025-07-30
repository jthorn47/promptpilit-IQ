-- Create benefit_scenarios table for cost modeling
CREATE TABLE public.benefit_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tier_distribution JSONB NOT NULL DEFAULT '{}',
  employer_contribution JSONB NOT NULL DEFAULT '{}',
  assumed_premiums JSONB NOT NULL DEFAULT '{}',
  enrolled_employees INTEGER NOT NULL DEFAULT 0,
  monthly_cost DECIMAL(10,2),
  annual_cost DECIMAL(10,2),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.benefit_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company users can view their scenarios" 
ON public.benefit_scenarios 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = benefit_scenarios.company_id
    AND ur.role IN ('company_admin', 'super_admin')
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

CREATE POLICY "Company admins can manage their scenarios" 
ON public.benefit_scenarios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = benefit_scenarios.company_id
    AND ur.role IN ('company_admin', 'super_admin')
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_benefit_scenarios_updated_at
  BEFORE UPDATE ON public.benefit_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halo_updated_at();