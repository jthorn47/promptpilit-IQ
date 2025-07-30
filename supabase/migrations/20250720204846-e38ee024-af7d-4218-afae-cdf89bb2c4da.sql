
-- Create integration_jobs table for sync job tracking and history
CREATE TABLE public.integration_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_settings(id) ON DELETE CASCADE,
  job_type text NOT NULL CHECK (job_type IN ('sync', 'import', 'export', 'webhook')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  next_retry_at timestamp with time zone,
  job_data jsonb DEFAULT '{}',
  result_data jsonb DEFAULT '{}',
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create integration_templates table for reusable connector templates
CREATE TABLE public.integration_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  provider_name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('sync', 'import', 'export', 'webhook')),
  configuration jsonb NOT NULL DEFAULT '{}',
  field_mappings jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create field_mappings table for external → internal field mapping
CREATE TABLE public.field_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_settings(id) ON DELETE CASCADE,
  external_field text NOT NULL,
  internal_field text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('string', 'number', 'boolean', 'date', 'object', 'array')),
  transformation_rules jsonb DEFAULT '{}',
  is_required boolean NOT NULL DEFAULT false,
  default_value text,
  validation_rules jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add sync scheduling fields to integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS sync_frequency text CHECK (sync_frequency IN ('manual', 'hourly', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS next_sync_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_retry boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_enabled boolean NOT NULL DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_integration_jobs_integration_id ON public.integration_jobs(integration_id);
CREATE INDEX idx_integration_jobs_company_id ON public.integration_jobs(company_id);
CREATE INDEX idx_integration_jobs_status ON public.integration_jobs(status);
CREATE INDEX idx_integration_jobs_created_at ON public.integration_jobs(created_at);
CREATE INDEX idx_field_mappings_integration_id ON public.field_mappings(integration_id);
CREATE INDEX idx_field_mappings_company_id ON public.field_mappings(company_id);

-- Insert sample integration templates
INSERT INTO public.integration_templates (name, description, provider_name, template_type, configuration, field_mappings) VALUES
('ADP Employee Import', 'Standard template for importing employee data from ADP', 'ADP', 'import', 
 '{"endpoint": "/employees", "method": "GET", "frequency": "daily"}',
 '{"employee_id": "id", "first_name": "firstName", "last_name": "lastName", "email": "workEmail", "department": "department"}'),
('QuickBooks Invoice Export', 'Export invoices from HaaLO to QuickBooks', 'QuickBooks', 'export',
 '{"endpoint": "/invoices", "method": "POST", "frequency": "hourly"}',
 '{"invoice_number": "DocNumber", "customer_name": "CustomerRef", "amount": "TotalAmt", "date": "TxnDate"}'),
('Prism Payroll Sync', 'Bi-directional sync with Prism HCM', 'Prism', 'sync',
 '{"endpoint": "/payroll", "method": "POST", "frequency": "weekly"}',
 '{"employee_id": "EmpID", "pay_rate": "Rate", "hours": "Hours", "department": "Dept"}'),
('Gusto Benefits Import', 'Import benefits data from Gusto', 'Gusto', 'import',
 '{"endpoint": "/benefits", "method": "GET", "frequency": "daily"}',
 '{"employee_id": "employee_id", "plan_name": "benefit_plan", "coverage": "coverage_type", "premium": "premium_amount"}');

-- Enable RLS on new tables
ALTER TABLE public.integration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for integration_jobs
CREATE POLICY "Companies can manage their integration jobs"
ON public.integration_jobs
FOR ALL
TO authenticated
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS policies for integration_templates
CREATE POLICY "Public templates are viewable by all authenticated users"
ON public.integration_templates
FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can manage their own templates"
ON public.integration_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for field_mappings
CREATE POLICY "Companies can manage their field mappings"
ON public.field_mappings
FOR ALL
TO authenticated
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_integration_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_jobs_updated_at
  BEFORE UPDATE ON public.integration_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_jobs_updated_at();

CREATE TRIGGER update_integration_templates_updated_at
  BEFORE UPDATE ON public.integration_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_jobs_updated_at();

CREATE TRIGGER update_field_mappings_updated_at
  BEFORE UPDATE ON public.field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_jobs_updated_at();
