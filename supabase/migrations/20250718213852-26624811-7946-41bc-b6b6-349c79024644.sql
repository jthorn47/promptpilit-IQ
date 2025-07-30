-- Create Payroll Batch Processor tables and functions

-- Create payroll_batches table
CREATE TABLE public.payroll_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  batch_name TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'processing', 'complete', 'failed', 'cancelled'
  total_employees INTEGER NOT NULL DEFAULT 0,
  processed_employees INTEGER NOT NULL DEFAULT 0,
  failed_employees INTEGER NOT NULL DEFAULT 0,
  total_gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
  payroll_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  processing_metadata JSONB DEFAULT '{}'::jsonb,
  error_summary JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'processing', 'complete', 'failed', 'cancelled')),
  CONSTRAINT valid_pay_period CHECK (pay_period_end >= pay_period_start),
  CONSTRAINT valid_pay_date CHECK (pay_date >= pay_period_end)
);

-- Create payroll_batch_employees table for tracking individual employee processing
CREATE TABLE public.payroll_batch_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.payroll_batches(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  payroll_group TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'complete', 'failed', 'skipped'
  gross_pay NUMERIC(12,2) DEFAULT 0,
  net_pay NUMERIC(12,2) DEFAULT 0,
  total_taxes NUMERIC(12,2) DEFAULT 0,
  calculation_data JSONB DEFAULT '{}'::jsonb,
  error_details JSONB DEFAULT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_employee_status CHECK (status IN ('pending', 'processing', 'complete', 'failed', 'skipped')),
  UNIQUE(batch_id, employee_id)
);

-- Create payroll_batch_audit_logs table for tracking all batch actions
CREATE TABLE public.payroll_batch_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.payroll_batches(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'submitted', 'completed', 'failed', 'cancelled', 'retried', 'rollback'
  action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  performed_by UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_id UUID NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.payroll_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_batch_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_batch_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_payroll_batches_company_id ON public.payroll_batches(company_id);
CREATE INDEX idx_payroll_batches_status ON public.payroll_batches(status);
CREATE INDEX idx_payroll_batches_pay_date ON public.payroll_batches(pay_date);
CREATE INDEX idx_payroll_batches_created_by ON public.payroll_batches(created_by);

CREATE INDEX idx_payroll_batch_employees_batch_id ON public.payroll_batch_employees(batch_id);
CREATE INDEX idx_payroll_batch_employees_employee_id ON public.payroll_batch_employees(employee_id);
CREATE INDEX idx_payroll_batch_employees_status ON public.payroll_batch_employees(status);

CREATE INDEX idx_payroll_batch_audit_logs_batch_id ON public.payroll_batch_audit_logs(batch_id);
CREATE INDEX idx_payroll_batch_audit_logs_action_type ON public.payroll_batch_audit_logs(action_type);
CREATE INDEX idx_payroll_batch_audit_logs_performed_by ON public.payroll_batch_audit_logs(performed_by);

-- Create updated_at triggers
CREATE TRIGGER update_payroll_batches_updated_at
  BEFORE UPDATE ON public.payroll_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_payroll_batch_employees_updated_at
  BEFORE UPDATE ON public.payroll_batch_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

-- RLS Policies for payroll_batches
-- Company admins can manage their company's batches
CREATE POLICY "Company admins can manage payroll batches"
  ON public.payroll_batches
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for payroll_batch_employees
-- Users can view employee records for batches they have access to
CREATE POLICY "Users can view batch employees for accessible batches"
  ON public.payroll_batch_employees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payroll_batches pb
      WHERE pb.id = payroll_batch_employees.batch_id
      AND (
        has_company_role(auth.uid(), 'company_admin'::app_role, pb.company_id)
        OR has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

-- Company admins can manage batch employees
CREATE POLICY "Company admins can manage batch employees"
  ON public.payroll_batch_employees
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for payroll_batch_audit_logs
-- Users can view audit logs for batches they have access to
CREATE POLICY "Users can view batch audit logs for accessible batches"
  ON public.payroll_batch_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payroll_batches pb
      WHERE pb.id = payroll_batch_audit_logs.batch_id
      AND (
        has_company_role(auth.uid(), 'company_admin'::app_role, pb.company_id)
        OR has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert batch audit logs"
  ON public.payroll_batch_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create function to generate batch name
CREATE OR REPLACE FUNCTION public.generate_batch_name(p_company_id UUID, p_pay_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_num INTEGER;
  batch_name TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM p_pay_date)::TEXT;
  month_part := LPAD(EXTRACT(MONTH FROM p_pay_date)::TEXT, 2, '0');
  
  -- Get next sequence number for this company, year, and month
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO sequence_num
  FROM public.payroll_batches
  WHERE company_id = p_company_id
  AND EXTRACT(YEAR FROM pay_date) = EXTRACT(YEAR FROM p_pay_date)
  AND EXTRACT(MONTH FROM pay_date) = EXTRACT(MONTH FROM p_pay_date);
  
  -- Format: BATCH-YYYY-MM-##
  batch_name := 'BATCH-' || year_part || '-' || month_part || '-' || LPAD(sequence_num::TEXT, 2, '0');
  
  RETURN batch_name;
END;
$$;

-- Create function to log batch actions
CREATE OR REPLACE FUNCTION public.log_batch_action(
  p_batch_id UUID,
  p_action_type TEXT,
  p_action_details JSONB DEFAULT '{}'::jsonb,
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
  -- Get company_id from batch
  SELECT company_id INTO company_id_val
  FROM public.payroll_batches
  WHERE id = p_batch_id;
  
  -- Insert audit log
  INSERT INTO public.payroll_batch_audit_logs (
    batch_id,
    action_type,
    action_details,
    performed_by,
    ip_address,
    user_agent,
    company_id
  ) VALUES (
    p_batch_id,
    p_action_type,
    p_action_details,
    auth.uid(),
    p_ip_address,
    p_user_agent,
    company_id_val
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to update batch totals
CREATE OR REPLACE FUNCTION public.update_batch_totals(p_batch_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_employees_val INTEGER;
  processed_employees_val INTEGER;
  failed_employees_val INTEGER;
  total_gross_val NUMERIC(12,2);
  total_net_val NUMERIC(12,2);
  total_taxes_val NUMERIC(12,2);
BEGIN
  -- Calculate totals from batch employees
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'complete'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COALESCE(SUM(gross_pay) FILTER (WHERE status = 'complete'), 0),
    COALESCE(SUM(net_pay) FILTER (WHERE status = 'complete'), 0),
    COALESCE(SUM(total_taxes) FILTER (WHERE status = 'complete'), 0)
  INTO 
    total_employees_val,
    processed_employees_val,
    failed_employees_val,
    total_gross_val,
    total_net_val,
    total_taxes_val
  FROM public.payroll_batch_employees
  WHERE batch_id = p_batch_id;
  
  -- Update batch totals
  UPDATE public.payroll_batches
  SET 
    total_employees = total_employees_val,
    processed_employees = processed_employees_val,
    failed_employees = failed_employees_val,
    total_gross_pay = total_gross_val,
    total_net_pay = total_net_val,
    total_taxes = total_taxes_val,
    updated_at = now()
  WHERE id = p_batch_id;
END;
$$;