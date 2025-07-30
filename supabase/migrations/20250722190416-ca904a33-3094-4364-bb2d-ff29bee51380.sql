-- Create email integration tables for case management
CREATE TABLE public.email_case_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL UNIQUE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  email_message_id TEXT,
  email_thread_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_case_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for email case mappings
CREATE POLICY "Users can view email case mappings for their company cases" 
ON public.email_case_mappings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = email_case_mappings.case_id
    AND (
      c.created_by = auth.uid() OR
      c.assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.company_id = c.related_company_id
        AND (
          has_role(auth.uid(), 'company_admin'::app_role) OR 
          has_role(auth.uid(), 'super_admin'::app_role)
        )
      )
    )
  )
);

CREATE POLICY "System can insert email case mappings" 
ON public.email_case_mappings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update email case mappings" 
ON public.email_case_mappings 
FOR UPDATE 
USING (true);

-- Create AI case processing log table
CREATE TABLE public.ai_case_processing_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  email_subject TEXT,
  email_from TEXT,
  email_content TEXT,
  ai_decision TEXT NOT NULL CHECK (ai_decision IN ('create_case', 'no_case_needed', 'auto_close', 'needs_review')),
  ai_reasoning TEXT,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.ai_case_processing_log ENABLE ROW LEVEL SECURITY;

-- Create policies for AI processing log
CREATE POLICY "Company admins can view AI processing logs" 
ON public.ai_case_processing_log 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_email_case_mappings_updated_at
BEFORE UPDATE ON public.email_case_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_email_case_mappings_email_id ON public.email_case_mappings(email_id);
CREATE INDEX idx_email_case_mappings_case_id ON public.email_case_mappings(case_id);
CREATE INDEX idx_ai_case_processing_log_processed_at ON public.ai_case_processing_log(processed_at);
CREATE INDEX idx_ai_case_processing_log_email_id ON public.ai_case_processing_log(email_id);