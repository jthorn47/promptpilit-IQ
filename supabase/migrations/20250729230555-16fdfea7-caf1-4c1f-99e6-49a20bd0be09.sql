-- Create sms_cases table for HALI Assistant
CREATE TABLE public.sms_cases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    employee_name TEXT,
    client_name TEXT,
    issue_category TEXT NOT NULL DEFAULT 'Other',
    status TEXT NOT NULL DEFAULT 'open',
    wants_hr BOOLEAN NOT NULL DEFAULT false,
    conversation_step INTEGER NOT NULL DEFAULT 1,
    last_message TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage SMS cases" 
ON public.sms_cases 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "System can insert SMS cases" 
ON public.sms_cases 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_sms_cases_assigned_to ON public.sms_cases(assigned_to);
CREATE INDEX idx_sms_cases_status ON public.sms_cases(status);
CREATE INDEX idx_sms_cases_wants_hr ON public.sms_cases(wants_hr);
CREATE INDEX idx_sms_cases_phone ON public.sms_cases(phone_number);

-- Enable real-time updates for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_cases;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_sms_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sms_cases_updated_at
    BEFORE UPDATE ON public.sms_cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sms_cases_updated_at();