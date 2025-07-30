-- Create sync logs table for tracking PayrollIQ and ProjectIQ integration
CREATE TABLE IF NOT EXISTS public.time_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  time_entry_id uuid NOT NULL,
  sync_destination text NOT NULL CHECK (sync_destination IN ('payroll', 'jobcost', 'both')),
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'retry')),
  sync_attempts integer NOT NULL DEFAULT 0,
  last_sync_attempt timestamp with time zone,
  last_sync_success timestamp with time zone,
  error_message text,
  payroll_entry_id text,
  jobcost_entry_id text,
  sync_metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_time_sync_logs_time_entry_id ON public.time_sync_logs(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_sync_logs_company_id ON public.time_sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_time_sync_logs_status ON public.time_sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_time_sync_logs_destination ON public.time_sync_logs(sync_destination);

-- Enable RLS
ALTER TABLE public.time_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Company admins can manage sync logs" ON public.time_sync_logs
  FOR ALL 
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_time_sync_logs_updated_at
  BEFORE UPDATE ON public.time_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add sync status to existing time entries (mock structure for now)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  date date NOT NULL,
  project_id uuid,
  time_code_id uuid,
  hours numeric(8,2) NOT NULL,
  hours_worked numeric(8,2) NOT NULL DEFAULT 0,
  start_time time,
  end_time time,
  break_minutes integer DEFAULT 0,
  notes text,
  tags text[] DEFAULT '{}',
  is_billable boolean NOT NULL DEFAULT false,
  hourly_rate numeric(10,2),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  approved_by uuid,
  approved_at timestamp with time zone,
  location text,
  is_remote boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for time entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time entries
CREATE POLICY "Company users can manage their time entries" ON public.time_entries
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = time_entries.employee_id 
      AND e.user_id = auth.uid()
    )
  );

-- Trigger for time entries updated_at
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();