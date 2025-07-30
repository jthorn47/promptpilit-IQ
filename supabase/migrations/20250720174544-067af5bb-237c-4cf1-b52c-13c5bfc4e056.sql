
-- Enhanced ReportIQ Schema - Phase 1: Foundation
-- This creates the core tables needed for the advanced report system

-- Report templates with enhanced metadata
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  template_config JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_by UUID,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data connectors for external data sources
CREATE TABLE public.data_connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  connector_type TEXT NOT NULL, -- 'api', 'database', 'file', 'webhook'
  connection_config JSONB NOT NULL DEFAULT '{}',
  auth_config JSONB DEFAULT '{}',
  schema_definition JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  error_message TEXT,
  created_by UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report components for modular builder
CREATE TABLE public.report_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  component_type TEXT NOT NULL, -- 'chart', 'table', 'kpi', 'text', 'filter'
  component_config JSONB NOT NULL DEFAULT '{}',
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI assistant sessions for context tracking
CREATE TABLE public.ai_assistant_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'report_builder',
  context_data JSONB NOT NULL DEFAULT '{}',
  conversation_history JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report collaboration
CREATE TABLE public.report_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Report comments for collaboration
CREATE TABLE public.report_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  component_id UUID, -- Optional: comment on specific component
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  thread_id UUID, -- For threaded conversations
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report analytics for usage tracking
CREATE TABLE public.report_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID,
  template_id UUID,
  user_id UUID,
  event_type TEXT NOT NULL, -- 'view', 'edit', 'export', 'share', 'clone'
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced saved reports with new fields
ALTER TABLE public.saved_reports ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE public.saved_reports ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.saved_reports ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '{}';
ALTER TABLE public.saved_reports ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.saved_reports ADD COLUMN IF NOT EXISTS access_count INTEGER NOT NULL DEFAULT 0;

-- Foreign key constraints
ALTER TABLE public.report_components 
ADD CONSTRAINT fk_report_components_report_id 
FOREIGN KEY (report_id) REFERENCES public.saved_reports(id) ON DELETE CASCADE;

ALTER TABLE public.report_collaborators 
ADD CONSTRAINT fk_report_collaborators_report_id 
FOREIGN KEY (report_id) REFERENCES public.saved_reports(id) ON DELETE CASCADE;

ALTER TABLE public.report_comments 
ADD CONSTRAINT fk_report_comments_report_id 
FOREIGN KEY (report_id) REFERENCES public.saved_reports(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX idx_report_templates_category ON public.report_templates(category);
CREATE INDEX idx_report_templates_public ON public.report_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_data_connectors_company ON public.data_connectors(company_id);
CREATE INDEX idx_report_components_report ON public.report_components(report_id);
CREATE INDEX idx_ai_assistant_sessions_user ON public.ai_assistant_sessions(user_id);
CREATE INDEX idx_report_analytics_report ON public.report_analytics(report_id);
CREATE INDEX idx_report_analytics_created ON public.report_analytics(created_at);

-- RLS Policies
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_analytics ENABLE ROW LEVEL SECURITY;

-- Report templates policies
CREATE POLICY "Public templates are viewable by all" 
ON public.report_templates FOR SELECT 
USING (is_public = true OR company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can manage their company templates" 
ON public.report_templates FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Data connectors policies
CREATE POLICY "Company users can manage data connectors" 
ON public.data_connectors FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Report components policies
CREATE POLICY "Report owners can manage components" 
ON public.report_components FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.saved_reports sr 
  WHERE sr.id = report_components.report_id 
  AND (sr.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- AI assistant sessions policies
CREATE POLICY "Users can manage their AI sessions" 
ON public.ai_assistant_sessions FOR ALL 
USING (user_id = auth.uid());

-- Report collaborators policies
CREATE POLICY "Report collaborators can view collaboration data" 
ON public.report_collaborators FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.saved_reports sr 
  WHERE sr.id = report_collaborators.report_id 
  AND sr.created_by = auth.uid()
));

CREATE POLICY "Report owners can manage collaborators" 
ON public.report_collaborators FOR INSERT, UPDATE, DELETE 
USING (EXISTS (
  SELECT 1 FROM public.saved_reports sr 
  WHERE sr.id = report_collaborators.report_id 
  AND sr.created_by = auth.uid()
));

-- Report comments policies
CREATE POLICY "Collaborators can view and create comments" 
ON public.report_comments FOR SELECT, INSERT 
USING (EXISTS (
  SELECT 1 FROM public.report_collaborators rc 
  WHERE rc.report_id = report_comments.report_id 
  AND rc.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.saved_reports sr 
  WHERE sr.id = report_comments.report_id 
  AND sr.created_by = auth.uid()
));

CREATE POLICY "Users can update their own comments" 
ON public.report_comments FOR UPDATE 
USING (user_id = auth.uid());

-- Report analytics policies
CREATE POLICY "System can insert analytics" 
ON public.report_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Report owners can view analytics" 
ON public.report_analytics FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.saved_reports sr 
  WHERE sr.id = report_analytics.report_id 
  AND sr.created_by = auth.uid()
) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update triggers
CREATE OR REPLACE FUNCTION update_report_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_templates_updated_at
BEFORE UPDATE ON public.report_templates
FOR EACH ROW EXECUTE FUNCTION update_report_templates_updated_at();

CREATE TRIGGER update_data_connectors_updated_at
BEFORE UPDATE ON public.data_connectors
FOR EACH ROW EXECUTE FUNCTION update_report_templates_updated_at();

CREATE TRIGGER update_report_components_updated_at
BEFORE UPDATE ON public.report_components
FOR EACH ROW EXECUTE FUNCTION update_report_templates_updated_at();

CREATE TRIGGER update_ai_assistant_sessions_updated_at
BEFORE UPDATE ON public.ai_assistant_sessions
FOR EACH ROW EXECUTE FUNCTION update_report_templates_updated_at();

CREATE TRIGGER update_report_comments_updated_at
BEFORE UPDATE ON public.report_comments
FOR EACH ROW EXECUTE FUNCTION update_report_templates_updated_at();

-- Enable realtime for collaboration
ALTER TABLE public.report_comments REPLICA IDENTITY FULL;
ALTER TABLE public.report_collaborators REPLICA IDENTITY FULL;
ALTER TABLE public.ai_assistant_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_assistant_sessions;
