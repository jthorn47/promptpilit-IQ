-- Create sms_conversations table for conversation memory
CREATE TABLE public.sms_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    employee_name TEXT,
    client_name TEXT,
    current_step TEXT NOT NULL DEFAULT 'initial_contact',
    last_message TEXT,
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    case_id UUID REFERENCES public.sms_cases(id),
    conversation_data JSONB DEFAULT '{}',
    error_flagged BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    timeout_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_sms_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_active ON public.sms_conversations(is_active);
CREATE INDEX idx_sms_conversations_step ON public.sms_conversations(current_step);
CREATE INDEX idx_sms_conversations_updated ON public.sms_conversations(last_updated_at);

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage SMS conversations" 
ON public.sms_conversations 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "System can insert SMS conversations" 
ON public.sms_conversations 
FOR INSERT 
WITH CHECK (true);

-- Add conversation_id to sms_cases for linking
ALTER TABLE public.sms_cases ADD COLUMN conversation_id UUID REFERENCES public.sms_conversations(id);
CREATE INDEX idx_sms_cases_conversation ON public.sms_cases(conversation_id);

-- Create intent_patterns table for natural language processing
CREATE TABLE public.intent_patterns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern TEXT NOT NULL,
    intent_category TEXT NOT NULL,
    priority_level TEXT NOT NULL DEFAULT 'normal',
    auto_escalate BOOLEAN DEFAULT false,
    suggested_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Insert default intent patterns
INSERT INTO public.intent_patterns (pattern, intent_category, priority_level, auto_escalate, suggested_response) VALUES
('not paid|didnt get paid|missing paycheck|no paycheck|payroll issue', 'Payroll', 'high', false, 'I understand you have a payroll concern. Let me help you with that.'),
('cant login|cannot login|login issue|password|access problem', 'Software', 'medium', false, 'I can help you with login issues. Let me gather some details.'),
('harassed|harassment|discriminat|hostile|bullying|abuse', 'HR', 'critical', true, 'I need to escalate this to HR immediately. Your safety and wellbeing are important.'),
('manager|supervisor|boss.*problem|unfair treatment', 'HR', 'high', false, 'I understand you have concerns about your supervisor. Let me help address this.'),
('overtime|hours|schedule|time off|pto|vacation', 'HR', 'medium', false, 'I can help with scheduling and time-off related questions.'),
('benefits|health insurance|401k|retirement|medical', 'HR', 'medium', false, 'Let me help you with your benefits questions.'),
('system down|app not working|technical issue|bug|error', 'Software', 'medium', false, 'I can help troubleshoot technical issues.'),
('quit|resign|termination|fired|unemployment', 'HR', 'high', true, 'This requires immediate HR attention. Let me connect you with the right person.');

-- Enable RLS on intent_patterns
ALTER TABLE public.intent_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read intent patterns" 
ON public.intent_patterns 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage intent patterns" 
ON public.intent_patterns 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Enable real-time for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_conversations;

-- Create trigger for updated_at
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