-- Add phone number to employees table
ALTER TABLE public.employees 
ADD COLUMN phone_number TEXT;

-- Create pulse_cases table for SMS intake
CREATE TABLE public.pulse_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id),
  employee_id UUID REFERENCES public.employees(id),
  issue_category TEXT NOT NULL,
  description TEXT,
  wants_hr BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted',
  sms_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sms_conversations table to track conversation state
CREATE TABLE public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  conversation_step TEXT NOT NULL DEFAULT 'client_name',
  conversation_data JSONB DEFAULT '{}',
  case_id UUID REFERENCES public.pulse_cases(id),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sms_intake_sessions table for complete session tracking
CREATE TABLE public.sms_intake_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  client_name TEXT,
  employee_name TEXT,
  issue_category TEXT,
  description TEXT,
  wants_hr BOOLEAN,
  pulse_case_id UUID REFERENCES public.pulse_cases(id),
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.pulse_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_intake_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pulse_cases
CREATE POLICY "Company admins can manage pulse cases" 
ON public.pulse_cases 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = pulse_cases.client_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, c.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "System can create pulse cases" 
ON public.pulse_cases 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for sms_conversations
CREATE POLICY "System can manage SMS conversations" 
ON public.sms_conversations 
FOR ALL 
USING (true);

-- Create RLS policies for sms_intake_sessions
CREATE POLICY "System can manage SMS intake sessions" 
ON public.sms_intake_sessions 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_sms_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_active ON public.sms_conversations(is_active);
CREATE INDEX idx_pulse_cases_wants_hr ON public.pulse_cases(wants_hr);
CREATE INDEX idx_pulse_cases_status ON public.pulse_cases(status);

-- Create trigger for updated_at
CREATE TRIGGER update_pulse_cases_updated_at
  BEFORE UPDATE ON public.pulse_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_sms_conversations_updated_at
  BEFORE UPDATE ON public.sms_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halo_updated_at();

CREATE TRIGGER update_sms_intake_sessions_updated_at
  BEFORE UPDATE ON public.sms_intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halo_updated_at();