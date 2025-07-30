-- Create SMS conversations table
CREATE TABLE public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  employee_id UUID,
  pulse_case_id UUID,
  case_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conversation_step TEXT NOT NULL DEFAULT 'awaiting_client',
  current_step TEXT NOT NULL DEFAULT 'awaiting_client',
  conversation_data JSONB NOT NULL DEFAULT '{}',
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage SMS conversations" 
ON public.sms_conversations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create SMS logs table
CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent',
  twilio_sid TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage SMS logs" 
ON public.sms_logs 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create pulse_cases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pulse_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE,
  client_id UUID,
  client_name TEXT,
  employee_name TEXT,
  phone_number TEXT,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  wants_hr BOOLEAN DEFAULT false,
  conversation_id UUID,
  metadata JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for pulse_cases if not already enabled
ALTER TABLE public.pulse_cases ENABLE ROW LEVEL SECURITY;

-- Create policy for pulse_cases if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pulse_cases' 
    AND policyname = 'Admins can manage pulse cases'
  ) THEN
    CREATE POLICY "Admins can manage pulse cases" 
    ON public.pulse_cases 
    FOR ALL 
    USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));
  END IF;
END $$;

-- Create case_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.case_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for case_events if not already enabled
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

-- Create policy for case_events if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'case_events' 
    AND policyname = 'Admins can manage case events'
  ) THEN
    CREATE POLICY "Admins can manage case events" 
    ON public.case_events 
    FOR ALL 
    USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));
  END IF;
END $$;

-- Add trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'CASE-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('case_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for case numbers
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

-- Create trigger
DROP TRIGGER IF EXISTS auto_generate_case_number ON public.pulse_cases;
CREATE TRIGGER auto_generate_case_number
  BEFORE INSERT ON public.pulse_cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- Add updated_at trigger for SMS conversations
CREATE OR REPLACE FUNCTION update_sms_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sms_conversations_updated_at
  BEFORE UPDATE ON public.sms_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_conversations_updated_at();