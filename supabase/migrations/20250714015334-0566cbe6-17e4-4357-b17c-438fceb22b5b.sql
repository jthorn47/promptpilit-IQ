-- Create seat access logs table for tracking training access attempts
CREATE TABLE public.seat_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_granted BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_seat_access_logs_company_id ON public.seat_access_logs(company_id);
CREATE INDEX idx_seat_access_logs_training_module ON public.seat_access_logs(training_module_id);
CREATE INDEX idx_seat_access_logs_attempted_at ON public.seat_access_logs(attempted_at);

-- Enable RLS
ALTER TABLE public.seat_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company admins can view their access logs" 
ON public.seat_access_logs 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert access logs" 
ON public.seat_access_logs 
FOR INSERT 
WITH CHECK (true);