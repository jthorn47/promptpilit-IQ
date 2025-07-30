-- Create HALO Copilot logs table for analytics and improvement
CREATE TABLE public.halo_copilot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.halo_copilot_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can view their HALO logs" 
ON public.halo_copilot_logs 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert HALO logs" 
ON public.halo_copilot_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_halo_copilot_logs_company_created ON public.halo_copilot_logs(company_id, created_at DESC);
CREATE INDEX idx_halo_copilot_logs_created_at ON public.halo_copilot_logs(created_at DESC);