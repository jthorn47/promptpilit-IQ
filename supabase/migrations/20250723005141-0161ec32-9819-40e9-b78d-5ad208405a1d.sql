
-- Create HROIQ client retainers table
CREATE TABLE public.hroiq_client_retainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  retainer_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  hours_used NUMERIC(8,2) NOT NULL DEFAULT 0,
  rollover_bank NUMERIC(8,2) NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  overage_rate NUMERIC(8,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HROIQ service requests table
CREATE TABLE public.hroiq_service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  estimated_hours NUMERIC(4,2),
  actual_hours NUMERIC(4,2),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HROIQ deliverables table
CREATE TABLE public.hroiq_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES public.hroiq_service_requests(id),
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  file_url TEXT,
  vault_document_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HROIQ service logs table
CREATE TABLE public.hroiq_service_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES auth.users(id),
  service_request_id UUID REFERENCES public.hroiq_service_requests(id),
  hours_logged NUMERIC(4,2) NOT NULL,
  description TEXT NOT NULL,
  billable BOOLEAN NOT NULL DEFAULT true,
  rate_per_hour NUMERIC(8,2),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HROIQ onboarding packets table
CREATE TABLE public.hroiq_onboarding_packets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_phone TEXT,
  language_preference TEXT NOT NULL DEFAULT 'english',
  packet_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HROIQ AI conversations table
CREATE TABLE public.hroiq_ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  conversation_id TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'english',
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for HROIQ tables
ALTER TABLE public.hroiq_client_retainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_onboarding_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for hroiq_client_retainers
CREATE POLICY "Company admins can manage their retainers" ON public.hroiq_client_retainers
  FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for hroiq_service_requests
CREATE POLICY "Company users can manage their service requests" ON public.hroiq_service_requests
  FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR requested_by = auth.uid() OR assigned_to = auth.uid());

-- RLS policies for hroiq_deliverables
CREATE POLICY "Company users can view their deliverables" ON public.hroiq_deliverables
  FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

-- RLS policies for hroiq_service_logs
CREATE POLICY "Consultants can manage their service logs" ON public.hroiq_service_logs
  FOR ALL USING (consultant_id = auth.uid() OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for hroiq_onboarding_packets
CREATE POLICY "Company users can manage their onboarding packets" ON public.hroiq_onboarding_packets
  FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

-- RLS policies for hroiq_ai_conversations
CREATE POLICY "Users can view their AI conversations" ON public.hroiq_ai_conversations
  FOR ALL USING (user_id = auth.uid() OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_hroiq_client_retainers_company_id ON public.hroiq_client_retainers(company_id);
CREATE INDEX idx_hroiq_service_requests_company_id ON public.hroiq_service_requests(company_id);
CREATE INDEX idx_hroiq_service_requests_status ON public.hroiq_service_requests(status);
CREATE INDEX idx_hroiq_deliverables_company_id ON public.hroiq_deliverables(company_id);
CREATE INDEX idx_hroiq_service_logs_company_id ON public.hroiq_service_logs(company_id);
CREATE INDEX idx_hroiq_service_logs_consultant_id ON public.hroiq_service_logs(consultant_id);
CREATE INDEX idx_hroiq_onboarding_packets_company_id ON public.hroiq_onboarding_packets(company_id);
CREATE INDEX idx_hroiq_ai_conversations_company_id ON public.hroiq_ai_conversations(company_id);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_hroiq_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hroiq_client_retainers_updated_at BEFORE UPDATE ON public.hroiq_client_retainers FOR EACH ROW EXECUTE FUNCTION update_hroiq_updated_at_column();
CREATE TRIGGER update_hroiq_service_requests_updated_at BEFORE UPDATE ON public.hroiq_service_requests FOR EACH ROW EXECUTE FUNCTION update_hroiq_updated_at_column();
CREATE TRIGGER update_hroiq_deliverables_updated_at BEFORE UPDATE ON public.hroiq_deliverables FOR EACH ROW EXECUTE FUNCTION update_hroiq_updated_at_column();
CREATE TRIGGER update_hroiq_service_logs_updated_at BEFORE UPDATE ON public.hroiq_service_logs FOR EACH ROW EXECUTE FUNCTION update_hroiq_updated_at_column();
CREATE TRIGGER update_hroiq_onboarding_packets_updated_at BEFORE UPDATE ON public.hroiq_onboarding_packets FOR EACH ROW EXECUTE FUNCTION update_hroiq_updated_at_column();
