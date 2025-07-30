-- Create Pay Stubs table and audit logging for HaaLO Pay Stub Generator Module

-- Create pay_stubs table
CREATE TABLE public.pay_stubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  payroll_period_id UUID NOT NULL,
  payroll_calculation_id UUID NOT NULL,
  company_id UUID NOT NULL,
  stub_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
  ytd_gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  ytd_net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  ytd_taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
  earnings_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  deductions_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  taxes_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  direct_deposit_breakdown JSONB DEFAULT '[]'::jsonb,
  pdf_file_path TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'generated',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Ensure unique stub per employee per payroll period
  UNIQUE(employee_id, payroll_period_id)
);

-- Enable RLS
ALTER TABLE public.pay_stubs ENABLE ROW LEVEL SECURITY;

-- Create pay stub access logs for audit trail
CREATE TABLE public.pay_stub_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pay_stub_id UUID NOT NULL REFERENCES public.pay_stubs(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'download', 'email'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_id UUID NOT NULL
);

-- Enable RLS on access logs
ALTER TABLE public.pay_stub_access_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_pay_stubs_employee_id ON public.pay_stubs(employee_id);
CREATE INDEX idx_pay_stubs_payroll_period_id ON public.pay_stubs(payroll_period_id);
CREATE INDEX idx_pay_stubs_company_id ON public.pay_stubs(company_id);
CREATE INDEX idx_pay_stubs_pay_date ON public.pay_stubs(pay_date);
CREATE INDEX idx_pay_stub_access_logs_stub_id ON public.pay_stub_access_logs(pay_stub_id);
CREATE INDEX idx_pay_stub_access_logs_accessed_by ON public.pay_stub_access_logs(accessed_by);

-- Create updated_at trigger for pay_stubs
CREATE TRIGGER update_pay_stubs_updated_at
  BEFORE UPDATE ON public.pay_stubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

-- RLS Policies for pay_stubs
-- Employees can only view their own pay stubs
CREATE POLICY "Employees can view their own pay stubs"
  ON public.pay_stubs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = pay_stubs.employee_id 
      AND e.user_id = auth.uid()
    )
    OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Company admins can manage pay stubs for their company
CREATE POLICY "Company admins can manage pay stubs"
  ON public.pay_stubs
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for pay_stub_access_logs
-- Users can view access logs for stubs they can access
CREATE POLICY "Users can view access logs for accessible pay stubs"
  ON public.pay_stub_access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pay_stubs ps
      WHERE ps.id = pay_stub_access_logs.pay_stub_id
      AND (
        EXISTS (
          SELECT 1 FROM public.employees e 
          WHERE e.id = ps.employee_id 
          AND e.user_id = auth.uid()
        )
        OR has_company_role(auth.uid(), 'company_admin'::app_role, ps.company_id)
        OR has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

-- System can insert access logs
CREATE POLICY "System can insert access logs"
  ON public.pay_stub_access_logs
  FOR INSERT
  WITH CHECK (true);

-- Create function to generate pay stub number
CREATE OR REPLACE FUNCTION public.generate_pay_stub_number(p_company_id UUID, p_pay_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  stub_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM p_pay_date)::TEXT;
  
  -- Get next sequence number for this company and year
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(SPLIT_PART(stub_number, '-', 3), 'PS', 2) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.pay_stubs
  WHERE company_id = p_company_id
  AND EXTRACT(YEAR FROM pay_date) = EXTRACT(YEAR FROM p_pay_date);
  
  -- Format: YYYY-COMPANYID-PS####
  stub_number := year_part || '-' || 
                 LEFT(p_company_id::TEXT, 8) || '-' ||
                 'PS' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN stub_number;
END;
$$;

-- Create function to log pay stub access
CREATE OR REPLACE FUNCTION public.log_pay_stub_access(
  p_pay_stub_id UUID,
  p_access_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  company_id_val UUID;
BEGIN
  -- Get company_id from pay stub
  SELECT company_id INTO company_id_val
  FROM public.pay_stubs
  WHERE id = p_pay_stub_id;
  
  -- Insert access log
  INSERT INTO public.pay_stub_access_logs (
    pay_stub_id,
    accessed_by,
    access_type,
    ip_address,
    user_agent,
    company_id
  ) VALUES (
    p_pay_stub_id,
    auth.uid(),
    p_access_type,
    p_ip_address,
    p_user_agent,
    company_id_val
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;