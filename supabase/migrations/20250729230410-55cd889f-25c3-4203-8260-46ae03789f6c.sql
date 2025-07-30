-- Add assigned_to column to existing sms_cases table
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_cases_assigned_to ON public.sms_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sms_cases_status ON public.sms_cases(status);
CREATE INDEX IF NOT EXISTS idx_sms_cases_wants_hr ON public.sms_cases(wants_hr);

-- Enable real-time updates for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_cases;