-- Create integrations table for storing Twilio credentials
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NULL,
  app_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations
CREATE POLICY "Users can view integrations for their company" 
ON public.integrations 
FOR SELECT 
USING (
  company_id IS NULL OR 
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage integrations" 
ON public.integrations 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create SMS conversations table
CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  employee_id UUID NULL,
  pulse_case_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'active',
  conversation_step INTEGER NOT NULL DEFAULT 1,
  issue_category TEXT NOT NULL DEFAULT 'General',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS conversations
CREATE POLICY "Company admins can manage SMS conversations" 
ON public.sms_conversations 
FOR ALL 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NULL REFERENCES public.sms_conversations(id),
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'sent',
  twilio_sid TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS logs
CREATE POLICY "Company admins can view SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert SMS logs" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (true);

-- Create the get_twilio_credentials function
CREATE OR REPLACE FUNCTION public.get_twilio_credentials(p_client_id UUID DEFAULT NULL)
RETURNS TABLE(
  account_sid TEXT,
  auth_token TEXT,
  phone_number TEXT,
  messaging_service_sid TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (i.credentials->>'account_sid')::TEXT as account_sid,
    (i.credentials->>'auth_token')::TEXT as auth_token,
    (i.credentials->>'phone_number')::TEXT as phone_number,
    (i.credentials->>'messaging_service_sid')::TEXT as messaging_service_sid
  FROM public.integrations i
  WHERE i.app_name = 'twilio'
    AND i.is_active = true
    AND (p_client_id IS NULL OR i.company_id = p_client_id OR i.company_id IS NULL)
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;