-- Create enum for training types
CREATE TYPE training_type AS ENUM (
  'Harassment',
  'SB553',
  'AML',
  'Safety',
  'Cybersecurity',
  'Manager_Training',
  'Compliance'
);

-- Create LMS credits table
CREATE TABLE public.hroiq_lms_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NULL, -- NULL means company-level credits
  training_type training_type NOT NULL,
  credits_issued INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_hroiq_lms_credits_company 
    FOREIGN KEY (company_id) REFERENCES company_settings(id) ON DELETE CASCADE,
  CONSTRAINT fk_hroiq_lms_credits_employee 
    FOREIGN KEY (employee_id) REFERENCES hroiq_employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_credits_positive 
    CHECK (credits_issued >= 0 AND credits_used >= 0),
  CONSTRAINT chk_credits_used_not_exceeding 
    CHECK (credits_used <= credits_issued)
);

-- Create index for better performance
CREATE INDEX idx_hroiq_lms_credits_company_id ON public.hroiq_lms_credits(company_id);
CREATE INDEX idx_hroiq_lms_credits_employee_id ON public.hroiq_lms_credits(employee_id);
CREATE INDEX idx_hroiq_lms_credits_training_type ON public.hroiq_lms_credits(training_type);

-- Enable RLS
ALTER TABLE public.hroiq_lms_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can view their LMS credits" 
ON public.hroiq_lms_credits 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can insert LMS credits" 
ON public.hroiq_lms_credits 
FOR INSERT 
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can update their LMS credits" 
ON public.hroiq_lms_credits 
FOR UPDATE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can delete their LMS credits" 
ON public.hroiq_lms_credits 
FOR DELETE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_hroiq_lms_credits_updated_at
  BEFORE UPDATE ON public.hroiq_lms_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get credit summary by company
CREATE OR REPLACE FUNCTION public.get_lms_credit_summary(p_company_id UUID)
RETURNS TABLE(
  training_type TEXT,
  total_issued BIGINT,
  total_used BIGINT,
  total_remaining BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hlc.training_type::TEXT,
    SUM(hlc.credits_issued) as total_issued,
    SUM(hlc.credits_used) as total_used,
    SUM(hlc.credits_issued - hlc.credits_used) as total_remaining,
    MAX(hlc.updated_at) as last_updated
  FROM hroiq_lms_credits hlc
  WHERE hlc.company_id = p_company_id
  GROUP BY hlc.training_type
  ORDER BY hlc.training_type;
$$;