-- Create employee registration tokens table
CREATE TABLE public.employee_registration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add registration status and timestamp to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS registration_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_tracking_pin_hash TEXT,
ADD COLUMN IF NOT EXISTS photo_reference_url TEXT,
ADD COLUMN IF NOT EXISTS badge_qr_code TEXT;

-- Enable RLS on registration tokens
ALTER TABLE public.employee_registration_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for registration tokens
CREATE POLICY "Company admins can manage registration tokens" 
ON public.employee_registration_tokens 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Public can view tokens for registration (but not create/modify)
CREATE POLICY "Public can view valid registration tokens" 
ON public.employee_registration_tokens 
FOR SELECT 
USING (expires_at > now() AND used_at IS NULL);

-- Create index for token lookups
CREATE INDEX idx_registration_tokens_token ON public.employee_registration_tokens(token);
CREATE INDEX idx_registration_tokens_employee ON public.employee_registration_tokens(employee_id);

-- Function to generate secure registration token
CREATE OR REPLACE FUNCTION public.generate_registration_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'reg_' || encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to create registration token for employee
CREATE OR REPLACE FUNCTION public.create_employee_registration_token(
  p_employee_id UUID,
  p_expires_hours INTEGER DEFAULT 72
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token TEXT;
  v_company_id UUID;
BEGIN
  -- Get employee's company
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = p_employee_id;
  
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Employee not found';
  END IF;
  
  -- Generate unique token
  v_token := generate_registration_token();
  
  -- Insert token record
  INSERT INTO public.employee_registration_tokens (
    employee_id,
    company_id,
    token,
    expires_at,
    created_by
  ) VALUES (
    p_employee_id,
    v_company_id,
    v_token,
    now() + (p_expires_hours || ' hours')::INTERVAL,
    auth.uid()
  );
  
  RETURN v_token;
END;
$$;