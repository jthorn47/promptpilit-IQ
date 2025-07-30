-- Create tax calculation audit table for Symmetry Tax Engine
CREATE TABLE public.tax_calculation_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  calculation_id TEXT NOT NULL,
  engine_used TEXT NOT NULL CHECK (engine_used IN ('symmetry', 'internal', 'fallback')),
  gross_pay DECIMAL(10,2) NOT NULL,
  pay_period TEXT NOT NULL,
  result JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_calculation_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can view their company's tax audit logs"
ON public.tax_calculation_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE e.id = tax_calculation_audit.employee_id
    AND (
      (ur.role = 'company_admin' AND e.company_id = ur.company_id)
      OR ur.role = 'super_admin'
    )
  )
);

CREATE POLICY "System can insert tax audit logs"
ON public.tax_calculation_audit
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_tax_audit_employee_id ON public.tax_calculation_audit(employee_id);
CREATE INDEX idx_tax_audit_calculated_at ON public.tax_calculation_audit(calculated_at);
CREATE INDEX idx_tax_audit_engine_used ON public.tax_calculation_audit(engine_used);
CREATE INDEX idx_tax_audit_calculation_id ON public.tax_calculation_audit(calculation_id);

-- Add comments
COMMENT ON TABLE public.tax_calculation_audit IS 'Audit trail for all tax calculations performed by various engines';
COMMENT ON COLUMN public.tax_calculation_audit.engine_used IS 'Which tax calculation engine was used: symmetry, internal, or fallback';
COMMENT ON COLUMN public.tax_calculation_audit.calculation_id IS 'Unique identifier from the tax engine for this calculation';
COMMENT ON COLUMN public.tax_calculation_audit.result IS 'Complete tax calculation result including all withholdings and details';