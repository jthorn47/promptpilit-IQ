-- Create tables for client experience features

-- Client case visibility settings
CREATE TABLE public.case_client_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  is_client_visible BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT UNIQUE,
  client_contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(case_id)
);

-- Client-visible case updates/comments
CREATE TABLE public.case_client_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL, -- 'status_change', 'comment', 'assignment', 'resolution'
  title TEXT NOT NULL,
  content TEXT,
  is_visible_to_client BOOLEAN NOT NULL DEFAULT false,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Client feedback on case resolutions
CREATE TABLE public.case_client_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL, -- 'thumbs_up', 'thumbs_down'
  sentiment_score INTEGER CHECK (sentiment_score >= 1 AND sentiment_score <= 5),
  comment TEXT,
  client_email TEXT,
  client_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Client notification preferences per company
CREATE TABLE public.client_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  case_created_notifications BOOLEAN NOT NULL DEFAULT true,
  status_change_notifications BOOLEAN NOT NULL DEFAULT true,
  resolution_notifications BOOLEAN NOT NULL DEFAULT true,
  public_sharing_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_feedback_request BOOLEAN NOT NULL DEFAULT true,
  notification_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.case_client_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_client_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_client_visibility
CREATE POLICY "Users can view case visibility for their cases"
ON public.case_client_visibility FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_client_visibility.case_id 
    AND (c.created_by = auth.uid() OR c.assigned_to::uuid = auth.uid())
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can manage case visibility for their cases"
ON public.case_client_visibility FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_client_visibility.case_id 
    AND (c.created_by = auth.uid() OR c.assigned_to::uuid = auth.uid())
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for case_client_updates
CREATE POLICY "Users can view client updates for their cases"
ON public.case_client_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_client_updates.case_id 
    AND (c.created_by = auth.uid() OR c.assigned_to::uuid = auth.uid())
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can create client updates for their cases"
ON public.case_client_updates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_client_updates.case_id 
    AND (c.created_by = auth.uid() OR c.assigned_to::uuid = auth.uid())
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for case_client_feedback
CREATE POLICY "Anyone can submit client feedback"
ON public.case_client_feedback FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view feedback for their cases"
ON public.case_client_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_client_feedback.case_id 
    AND (c.created_by = auth.uid() OR c.assigned_to::uuid = auth.uid())
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for client_notification_settings
CREATE POLICY "Company admins can manage notification settings"
ON public.client_notification_settings FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add indexes for performance
CREATE INDEX idx_case_client_visibility_case_id ON public.case_client_visibility(case_id);
CREATE INDEX idx_case_client_visibility_share_token ON public.case_client_visibility(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_case_client_updates_case_id ON public.case_client_updates(case_id);
CREATE INDEX idx_case_client_updates_visible ON public.case_client_updates(case_id, is_visible_to_client);
CREATE INDEX idx_case_client_feedback_case_id ON public.case_client_feedback(case_id);

-- Add updated_at triggers
CREATE TRIGGER update_case_client_visibility_updated_at
  BEFORE UPDATE ON public.case_client_visibility
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_case_intelligence();

CREATE TRIGGER update_client_notification_settings_updated_at
  BEFORE UPDATE ON public.client_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_case_intelligence();

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION public.generate_case_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to create default client notification settings
CREATE OR REPLACE FUNCTION public.ensure_client_notification_settings(p_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.client_notification_settings (company_id)
  VALUES (p_company_id)
  ON CONFLICT (company_id) DO NOTHING;
END;
$$;

-- Insert default notification settings for existing companies
INSERT INTO public.client_notification_settings (company_id)
SELECT id FROM public.company_settings
ON CONFLICT (company_id) DO NOTHING;