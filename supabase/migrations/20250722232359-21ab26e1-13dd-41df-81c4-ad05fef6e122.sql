-- Create databridge_alerts table to track sent alerts
CREATE TABLE public.databridge_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES public.databridge_logs(id) ON DELETE CASCADE,
    alerted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')) DEFAULT 'sent',
    alert_type TEXT NOT NULL DEFAULT 'sync_failure',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_databridge_alerts_log_id ON public.databridge_alerts(log_id);
CREATE INDEX idx_databridge_alerts_alerted_at ON public.databridge_alerts(alerted_at DESC);

-- Enable RLS
ALTER TABLE public.databridge_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can view all databridge alerts"
ON public.databridge_alerts
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert databridge alerts"
ON public.databridge_alerts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update databridge alerts"
ON public.databridge_alerts
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_databridge_alerts_updated_at
    BEFORE UPDATE ON public.databridge_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();