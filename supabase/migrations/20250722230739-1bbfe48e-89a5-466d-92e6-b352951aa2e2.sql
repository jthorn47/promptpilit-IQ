-- Create databridge_logs table for module sync status tracking
CREATE TABLE public.databridge_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'stale', 'error')),
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    origin_module TEXT,
    target_module TEXT,
    sync_duration_ms INTEGER,
    records_processed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_databridge_logs_module_status ON public.databridge_logs(module_name, status);
CREATE INDEX idx_databridge_logs_last_synced ON public.databridge_logs(last_synced_at DESC);

-- Enable RLS
ALTER TABLE public.databridge_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can view all databridge logs"
ON public.databridge_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert databridge logs"
ON public.databridge_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update databridge logs"
ON public.databridge_logs
FOR UPDATE
USING (true);

-- Insert initial sample data for each module
INSERT INTO public.databridge_logs (module_name, status, last_synced_at, origin_module, target_module, sync_duration_ms, records_processed) VALUES
('Payroll', 'success', now() - INTERVAL '5 minutes', 'Payroll', 'VaultPay', 1250, 45),
('VaultPay', 'success', now() - INTERVAL '8 minutes', 'VaultPay', 'ReportsIQ', 850, 12),
('BenefitsIQ', 'stale', now() - INTERVAL '45 minutes', 'BenefitsIQ', 'Payroll', 2100, 67),
('LMS', 'success', now() - INTERVAL '3 minutes', 'EaseLearn', 'Employee Profiles', 950, 23),
('Case Management', 'error', now() - INTERVAL '2 hours', 'Pulse', 'ReportsIQ', 0, 0),
('Time & Attendance', 'success', now() - INTERVAL '12 minutes', 'TimeTracker', 'Payroll', 1800, 89),
('Employee Profiles', 'success', now() - INTERVAL '7 minutes', 'HRIS', 'LMS', 600, 156),
('ReportsIQ', 'stale', now() - INTERVAL '25 minutes', 'Analytics', 'Dashboard', 3200, 234);

-- Add error message for the failed sync
UPDATE public.databridge_logs 
SET error_message = 'Connection timeout to ReportsIQ API after 30 seconds', retry_count = 3
WHERE module_name = 'Case Management' AND status = 'error';

-- Add trigger for updated_at
CREATE TRIGGER update_databridge_logs_updated_at
    BEFORE UPDATE ON public.databridge_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();