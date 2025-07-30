-- Add missing columns to existing sms_conversations table step by step
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT 'initial_contact';
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS conversation_data JSONB DEFAULT '{}';
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS error_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS timeout_count INTEGER DEFAULT 0;
ALTER TABLE public.sms_conversations ADD COLUMN IF NOT EXISTS case_id UUID;

-- Add foreign key constraint for case_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sms_conversations_case_id_fkey') THEN
        ALTER TABLE public.sms_conversations ADD CONSTRAINT sms_conversations_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES public.sms_cases(id);
    END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_active ON public.sms_conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_step ON public.sms_conversations(current_step);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_updated ON public.sms_conversations(last_updated_at);

-- Add conversation_id to sms_cases for linking
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Add foreign key constraint for conversation_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sms_cases_conversation_id_fkey') THEN
        ALTER TABLE public.sms_cases ADD CONSTRAINT sms_cases_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES public.sms_conversations(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sms_cases_conversation ON public.sms_cases(conversation_id);

-- Create intent_patterns table for natural language processing
CREATE TABLE IF NOT EXISTS public.intent_patterns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern TEXT NOT NULL,
    intent_category TEXT NOT NULL,
    priority_level TEXT NOT NULL DEFAULT 'normal',
    auto_escalate BOOLEAN DEFAULT false,
    suggested_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Insert default intent patterns only if table is empty
INSERT INTO public.intent_patterns (pattern, intent_category, priority_level, auto_escalate, suggested_response) 
SELECT 'not paid|didnt get paid|missing paycheck|no paycheck|payroll issue', 'Payroll', 'high', false, 'I understand you have a payroll concern. Let me help you with that.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE intent_category = 'Payroll')
UNION ALL
SELECT 'cant login|cannot login|login issue|password|access problem', 'Software', 'medium', false, 'I can help you with login issues. Let me gather some details.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE intent_category = 'Software' AND pattern LIKE '%login%')
UNION ALL
SELECT 'harassed|harassment|discriminat|hostile|bullying|abuse', 'HR', 'critical', true, 'I need to escalate this to HR immediately. Your safety and wellbeing are important.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%harass%')
UNION ALL
SELECT 'manager|supervisor|boss.*problem|unfair treatment', 'HR', 'high', false, 'I understand you have concerns about your supervisor. Let me help address this.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%manager%')
UNION ALL
SELECT 'overtime|hours|schedule|time off|pto|vacation', 'HR', 'medium', false, 'I can help with scheduling and time-off related questions.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%overtime%')
UNION ALL
SELECT 'benefits|health insurance|401k|retirement|medical', 'HR', 'medium', false, 'Let me help you with your benefits questions.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%benefits%')
UNION ALL
SELECT 'system down|app not working|technical issue|bug|error', 'Software', 'medium', false, 'I can help troubleshoot technical issues.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%system down%')
UNION ALL
SELECT 'quit|resign|termination|fired|unemployment', 'HR', 'high', true, 'This requires immediate HR attention. Let me connect you with the right person.'
WHERE NOT EXISTS (SELECT 1 FROM public.intent_patterns WHERE pattern LIKE '%quit%');

-- Enable RLS on intent_patterns
ALTER TABLE public.intent_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for intent_patterns
DROP POLICY IF EXISTS "Everyone can read intent patterns" ON public.intent_patterns;
DROP POLICY IF EXISTS "Admins can manage intent patterns" ON public.intent_patterns;

CREATE POLICY "Everyone can read intent patterns" 
ON public.intent_patterns 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage intent patterns" 
ON public.intent_patterns 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_sms_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sms_conversations_updated_at ON public.sms_conversations;
CREATE TRIGGER update_sms_conversations_updated_at
    BEFORE UPDATE ON public.sms_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sms_conversations_updated_at();