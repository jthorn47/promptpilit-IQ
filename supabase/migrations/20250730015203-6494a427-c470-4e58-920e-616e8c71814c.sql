-- Check if sms_conversations table exists and create it with proper structure
CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  employee_id UUID,
  pulse_case_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  conversation_step INTEGER DEFAULT 1,
  issue_category TEXT DEFAULT 'General',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.sms_conversations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'sent',
  twilio_sid TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_conversations
CREATE POLICY "SMS conversations are viewable by authenticated users" 
ON public.sms_conversations 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "SMS conversations can be created by authenticated users" 
ON public.sms_conversations 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "SMS conversations can be updated by authenticated users" 
ON public.sms_conversations 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policies for sms_logs
CREATE POLICY "SMS logs are viewable by authenticated users" 
ON public.sms_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "SMS logs can be created by authenticated users" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to update last_updated_at
CREATE OR REPLACE FUNCTION public.update_sms_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sms_conversations_updated_at
BEFORE UPDATE ON public.sms_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_sms_conversations_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone_number ON public.sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_status ON public.sms_conversations(status);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_pulse_case_id ON public.sms_conversations(pulse_case_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_conversation_id ON public.sms_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_direction ON public.sms_logs(direction);