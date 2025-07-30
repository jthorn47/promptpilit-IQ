-- Create SMS conversations table to track conversation state
CREATE TABLE public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  step TEXT NOT NULL DEFAULT 'awaiting_client',
  client_id UUID NULL,
  client_name TEXT NULL,
  client_matched BOOLEAN DEFAULT NULL,
  employee_name TEXT NULL,
  issue_category TEXT NULL,
  wants_hr BOOLEAN DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  conversation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS logs table to store all messages
CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  twilio_sid TEXT NULL,
  status TEXT DEFAULT 'delivered',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Pulse cases table for case management
CREATE TABLE public.pulse_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  client_id UUID NULL,
  client_name TEXT NULL,
  employee_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  wants_hr BOOLEAN DEFAULT false,
  assigned_to UUID NULL,
  conversation_id UUID NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_sms_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX idx_sms_logs_conversation_id ON public.sms_logs(conversation_id);
CREATE INDEX idx_sms_logs_phone_number ON public.sms_logs(phone_number);
CREATE INDEX idx_pulse_cases_status ON public.pulse_cases(status);
CREATE INDEX idx_pulse_cases_conversation_id ON public.pulse_cases(conversation_id);

-- Create sequence for case numbers
CREATE SEQUENCE pulse_case_number_sequence START 1000;

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION generate_pulse_case_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'CASE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('pulse_case_number_sequence')::TEXT, 4, '0');
END;
$$;

-- Trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION auto_generate_pulse_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_pulse_case_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_pulse_case_number
  BEFORE INSERT ON public.pulse_cases
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_pulse_case_number();

-- Trigger to update last_updated_at on conversations
CREATE OR REPLACE FUNCTION update_sms_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_sms_conversation_timestamp
  BEFORE UPDATE ON public.sms_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_conversation_timestamp();

-- Trigger to update updated_at on pulse cases
CREATE OR REPLACE FUNCTION update_pulse_case_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_pulse_case_timestamp
  BEFORE UPDATE ON public.pulse_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_case_timestamp();

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SMS conversations
CREATE POLICY "Company admins can manage SMS conversations" 
ON public.sms_conversations FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for SMS logs
CREATE POLICY "Company admins can manage SMS logs" 
ON public.sms_logs FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Pulse cases
CREATE POLICY "Company admins can manage Pulse cases" 
ON public.pulse_cases FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));