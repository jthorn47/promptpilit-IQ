-- Phase 2 Pulse: Email Integration & Sarah AI Enhancement

-- Add email threading support to cases
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS email_thread_id TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS source_email_subject TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS source_email_from TEXT;

-- Create email threads table for tracking email conversations
CREATE TABLE IF NOT EXISTS public.case_email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  email_subject TEXT NOT NULL,
  email_from TEXT NOT NULL,
  email_to TEXT[] DEFAULT '{}',
  email_cc TEXT[] DEFAULT '{}',
  email_body TEXT NOT NULL,
  email_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_inbound BOOLEAN DEFAULT true,
  message_id TEXT, -- Email message ID for threading
  thread_id TEXT, -- Email thread ID for grouping
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company domain mapping for email plugin
CREATE TABLE IF NOT EXISTS public.company_email_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

-- Create case suggestions table for Sarah AI
CREATE TABLE IF NOT EXISTS public.case_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- 'category', 'assignee', 'related_case', 'priority'
  suggested_value TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.0, -- 0.00 to 1.00
  reasoning TEXT,
  source_content TEXT, -- Original email/content that generated suggestion
  accepted BOOLEAN DEFAULT null, -- null=pending, true=accepted, false=rejected
  created_by TEXT DEFAULT 'sarah_ai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email triggers table for smart detection
CREATE TABLE IF NOT EXISTS public.email_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_phrase TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'support_request', 'urgent', 'billing', etc.
  category TEXT, -- Maps to case types
  priority TEXT, -- Maps to case priorities
  confidence_weight NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default email triggers for Sarah AI
INSERT INTO public.email_triggers (trigger_phrase, trigger_type, category, priority, confidence_weight) VALUES
  ('please fix', 'support_request', 'technical', 'medium', 0.8),
  ('can you help', 'support_request', 'general_support', 'medium', 0.7),
  ('this is wrong', 'support_request', 'general_support', 'medium', 0.8),
  ('urgent', 'urgent', null, 'high', 0.9),
  ('emergency', 'urgent', null, 'high', 1.0),
  ('paycheck', 'payroll_request', 'payroll', 'medium', 0.9),
  ('missing pay', 'payroll_request', 'payroll', 'high', 0.9),
  ('payroll issue', 'payroll_request', 'payroll', 'medium', 0.8),
  ('insurance', 'benefits_request', 'benefits', 'medium', 0.8),
  ('medical', 'benefits_request', 'benefits', 'medium', 0.7),
  ('open enrollment', 'benefits_request', 'benefits', 'medium', 0.8),
  ('I-9', 'compliance_request', 'compliance', 'medium', 0.9),
  ('harassment', 'compliance_request', 'compliance', 'high', 0.9),
  ('SB 553', 'compliance_request', 'compliance', 'medium', 0.9),
  ('E-Verify', 'compliance_request', 'compliance', 'medium', 0.8),
  ('not working', 'technical_issue', 'technical', 'medium', 0.8),
  ('error', 'technical_issue', 'technical', 'medium', 0.7),
  ('bug', 'technical_issue', 'technical', 'medium', 0.8),
  ('broken', 'technical_issue', 'technical', 'medium', 0.8);

-- Enable RLS on new tables
ALTER TABLE public.case_email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_email_threads
CREATE POLICY "Users can view email threads for accessible cases" ON public.case_email_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_email_threads.case_id 
      AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        c.assigned_to = auth.uid()::text OR
        c.created_by = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can insert email threads for accessible cases" ON public.case_email_threads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_email_threads.case_id 
      AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        c.assigned_to = auth.uid()::text OR
        c.created_by = auth.uid()::text
      )
    )
  );

-- RLS Policies for company_email_domains
CREATE POLICY "Company admins can manage their email domains" ON public.company_email_domains
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  );

CREATE POLICY "Users can view email domains for accessible companies" ON public.company_email_domains
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.related_company_id = company_email_domains.company_id
      AND (c.assigned_to = auth.uid()::text OR c.created_by = auth.uid()::text)
    )
  );

-- RLS Policies for case_suggestions  
CREATE POLICY "Users can view suggestions for accessible cases" ON public.case_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_suggestions.case_id 
      AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        c.assigned_to = auth.uid()::text OR
        c.created_by = auth.uid()::text
      )
    )
  );

CREATE POLICY "System can insert case suggestions" ON public.case_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update suggestion acceptance" ON public.case_suggestions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_suggestions.case_id 
      AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        c.assigned_to = auth.uid()::text OR
        c.created_by = auth.uid()::text
      )
    )
  );

-- RLS Policies for email_triggers
CREATE POLICY "Admins can manage email triggers" ON public.email_triggers
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view active email triggers" ON public.email_triggers
  FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_email_threads_case_id ON public.case_email_threads(case_id);
CREATE INDEX IF NOT EXISTS idx_case_email_threads_thread_id ON public.case_email_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_company_email_domains_domain ON public.company_email_domains(domain);
CREATE INDEX IF NOT EXISTS idx_case_suggestions_case_id ON public.case_suggestions(case_id);
CREATE INDEX IF NOT EXISTS idx_email_triggers_active ON public.email_triggers(is_active) WHERE is_active = true;

-- Create function to extract domain from email
CREATE OR REPLACE FUNCTION public.extract_domain_from_email(email_address text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF email_address IS NULL OR email_address = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract domain part after @
  RETURN lower(split_part(email_address, '@', 2));
END;
$$;

-- Create function to find company by email domain
CREATE OR REPLACE FUNCTION public.find_company_by_email_domain(email_address text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  domain_name text;
  company_uuid uuid;
BEGIN
  domain_name := extract_domain_from_email(email_address);
  
  IF domain_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Look for exact domain match
  SELECT company_id INTO company_uuid
  FROM public.company_email_domains
  WHERE domain = domain_name
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$;