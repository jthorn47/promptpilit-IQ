-- Phase 5: Advanced CRM Features - User Management, Automation, Integrations

-- Enhanced user management
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_name TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- lead, deal, campaign, report, etc.
  resource_id UUID, -- specific resource or null for global
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_name, resource_type, resource_id)
);

-- Team management
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- lead, member, viewer
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Automation workflows
CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- lead_created, deal_stage_changed, email_opened, etc.
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]', -- array of actions to execute
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id),
  trigger_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhooks and integrations
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}', -- array of events to listen for
  secret_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  headers JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API keys for integrations
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT NOT NULL, -- first 8 chars for display
  permissions TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Global search index
CREATE TABLE public.search_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- lead, deal, activity, etc.
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Notifications system
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- info, warning, error, success
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Data import/export jobs
CREATE TABLE public.import_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- leads, deals, activities
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  mapping_config JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- System settings
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, key)
);

-- Create search function
CREATE OR REPLACE FUNCTION public.update_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search index when leads are modified
  IF TG_TABLE_NAME = 'leads' THEN
    INSERT INTO public.search_index (entity_type, entity_id, title, content, metadata)
    VALUES (
      'lead',
      NEW.id,
      NEW.first_name || ' ' || NEW.last_name,
      COALESCE(NEW.first_name, '') || ' ' || 
      COALESCE(NEW.last_name, '') || ' ' || 
      COALESCE(NEW.email, '') || ' ' || 
      COALESCE(NEW.company_name, '') || ' ' || 
      COALESCE(NEW.notes, ''),
      json_build_object('status', NEW.status, 'source', NEW.source)
    )
    ON CONFLICT (entity_type, entity_id) 
    DO UPDATE SET 
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END IF;
  
  -- Update search index when deals are modified
  IF TG_TABLE_NAME = 'deals' THEN
    INSERT INTO public.search_index (entity_type, entity_id, title, content, metadata)
    VALUES (
      'deal',
      NEW.id,
      NEW.title,
      COALESCE(NEW.title, '') || ' ' || 
      COALESCE(NEW.company_name, '') || ' ' || 
      COALESCE(NEW.contact_name, '') || ' ' || 
      COALESCE(NEW.notes, ''),
      json_build_object('status', NEW.status, 'value', NEW.value)
    )
    ON CONFLICT (entity_type, entity_id) 
    DO UPDATE SET 
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create automation trigger function
CREATE OR REPLACE FUNCTION public.trigger_automation_workflows()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  execution_id UUID;
BEGIN
  -- Find matching workflows for this trigger
  FOR workflow_record IN
    SELECT * FROM public.automation_workflows 
    WHERE is_active = true 
    AND trigger_type = TG_TABLE_NAME || '_' || TG_OP
  LOOP
    -- Create execution record
    INSERT INTO public.automation_executions (workflow_id, trigger_data, status)
    VALUES (
      workflow_record.id,
      row_to_json(NEW),
      'pending'
    ) RETURNING id INTO execution_id;
    
    -- Log the trigger
    RAISE NOTICE 'Automation workflow % triggered by % on %', 
      workflow_record.name, TG_OP, TG_TABLE_NAME;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_permissions
CREATE POLICY "Super admins manage all permissions" ON public.user_permissions
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions" ON public.user_permissions
FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for teams
CREATE POLICY "Team management by admins and sales reps" ON public.teams
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role));

CREATE POLICY "Team members can view their teams" ON public.team_members
FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Team leads can manage their team members" ON public.team_members
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM public.teams t 
    WHERE t.id = team_id AND t.team_lead_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for automation
CREATE POLICY "Sales reps manage automation workflows" ON public.automation_workflows
FOR ALL USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "View automation executions" ON public.automation_executions
FOR SELECT USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for webhooks
CREATE POLICY "Super admins manage webhooks" ON public.webhooks
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "View webhook deliveries" ON public.webhook_deliveries
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for API keys
CREATE POLICY "Super admins manage API keys" ON public.api_keys
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for search
CREATE POLICY "Authenticated users can search" ON public.search_index
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage search index" ON public.search_index
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for notifications
CREATE POLICY "Users manage their own notifications" ON public.notifications
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for imports
CREATE POLICY "Sales reps manage imports" ON public.import_jobs
FOR ALL USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for settings
CREATE POLICY "Public settings are viewable by all" ON public.system_settings
FOR SELECT USING (is_public = true OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins manage all settings" ON public.system_settings
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for search indexing
CREATE TRIGGER update_leads_search_index
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_search_index();

CREATE TRIGGER update_deals_search_index
  AFTER INSERT OR UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_search_index();

-- Create triggers for automation workflows
CREATE TRIGGER automation_trigger_leads
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trigger_automation_workflows();

CREATE TRIGGER automation_trigger_deals
  AFTER INSERT OR UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.trigger_automation_workflows();

-- Create updated_at triggers
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON public.automation_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_search_index_updated_at
  BEFORE UPDATE ON public.search_index
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON public.user_permissions(resource_type, resource_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_automation_executions_workflow_id ON public.automation_executions(workflow_id);
CREATE INDEX idx_automation_executions_status ON public.automation_executions(status);
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_search_index_entity ON public.search_index(entity_type, entity_id);
CREATE INDEX idx_search_content ON public.search_index USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status);
CREATE INDEX idx_system_settings_category ON public.system_settings(category);

-- Insert default system settings
INSERT INTO public.system_settings (category, key, value, description, is_public, created_by) VALUES
('general', 'company_name', '"Easeworks CRM"', 'Company name displayed in the application', true, '00000000-0000-0000-0000-000000000000'),
('general', 'timezone', '"UTC"', 'Default timezone for the application', true, '00000000-0000-0000-0000-000000000000'),
('email', 'from_name', '"Easeworks CRM"', 'Default sender name for emails', false, '00000000-0000-0000-0000-000000000000'),
('automation', 'max_executions_per_hour', '100', 'Maximum automation executions per hour', false, '00000000-0000-0000-0000-000000000000'),
('search', 'max_results', '50', 'Maximum search results to return', true, '00000000-0000-0000-0000-000000000000');