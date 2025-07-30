-- Create integrations table for storing Twilio credentials (if it doesn't exist)
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

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view integrations for their company" ON public.integrations;
DROP POLICY IF EXISTS "Company admins can manage integrations" ON public.integrations;

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

-- Insert sample Twilio credentials for testing
INSERT INTO public.integrations (app_name, credentials, company_id)
VALUES (
  'twilio',
  '{
    "account_sid": "AC2e383e3528ee0c9a63937112a97bb522",
    "auth_token": "your_auth_token_here",
    "phone_number": "+12132961422",
    "messaging_service_sid": null
  }'::jsonb,
  NULL
) ON CONFLICT DO NOTHING;