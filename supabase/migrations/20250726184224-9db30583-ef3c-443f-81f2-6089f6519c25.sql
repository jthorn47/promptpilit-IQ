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