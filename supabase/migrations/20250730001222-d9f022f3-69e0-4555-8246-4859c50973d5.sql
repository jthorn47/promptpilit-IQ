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

-- Create indexes for performance
CREATE INDEX idx_sms_logs_conversation_id ON public.sms_logs(conversation_id);
CREATE INDEX idx_sms_logs_phone_number ON public.sms_logs(phone_number);
CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SMS logs
CREATE POLICY "Company admins can manage SMS logs" 
ON public.sms_logs FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));