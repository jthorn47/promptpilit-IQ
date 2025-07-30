-- Add AI fields to sms_cases table for real-time case summarization and action recommendations
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS ai_suggested_action TEXT;
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1);
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sms_cases ADD COLUMN IF NOT EXISTS ai_last_content_hash TEXT; -- To track if content changed

-- Create indexes for AI fields
CREATE INDEX IF NOT EXISTS idx_sms_cases_ai_processed ON public.sms_cases(ai_processed_at);
CREATE INDEX IF NOT EXISTS idx_sms_cases_ai_confidence ON public.sms_cases(ai_confidence_score);

-- Update the existing Case interface type to include source 'sms'
ALTER TYPE case_source ADD VALUE IF NOT EXISTS 'sms';