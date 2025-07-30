-- Add Colossyan integration provider
INSERT INTO integration_providers (
  name,
  display_name,
  category,
  description,
  auth_type,
  config_schema,
  webhook_events,
  rate_limits,
  status
) VALUES (
  'colossyan',
  'Colossyan Enterprise',
  'ai_video_generation',
  'Enterprise AI video generation platform for training content',
  'api_key',
  '{
    "type": "object",
    "properties": {
      "api_key": {"type": "string", "description": "Colossyan Enterprise API Key"},
      "workspace_id": {"type": "string", "description": "Workspace ID"},
      "brand_kit_id": {"type": "string", "description": "Brand Kit ID for consistent branding"},
      "webhook_url": {"type": "string", "description": "Webhook URL for generation callbacks"}
    },
    "required": ["api_key", "workspace_id"]
  }'::jsonb,
  '["video.generation.started", "video.generation.completed", "video.generation.failed"]'::text[],
  '{
    "requests_per_minute": 30,
    "requests_per_hour": 500,
    "concurrent_generations": 5
  }'::jsonb,
  'active'
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  config_schema = EXCLUDED.config_schema,
  webhook_events = EXCLUDED.webhook_events,
  rate_limits = EXCLUDED.rate_limits,
  updated_at = now();

-- Create table to track Colossyan video generations
CREATE TABLE IF NOT EXISTS public.colossyan_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.company_settings(id),
  training_module_id UUID REFERENCES public.training_modules(id),
  training_scene_id UUID REFERENCES public.training_scenes(id),
  generation_id TEXT, -- Colossyan's generation ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  script_content TEXT NOT NULL,
  selected_avatar TEXT,
  selected_template TEXT,
  language_code TEXT DEFAULT 'en',
  brand_settings JSONB DEFAULT '{}',
  generation_config JSONB DEFAULT '{}',
  result_data JSONB DEFAULT '{}',
  video_url TEXT,
  scorm_package_url TEXT,
  error_message TEXT,
  webhook_received_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on colossyan_generations
ALTER TABLE public.colossyan_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for colossyan_generations
CREATE POLICY "Company users can view their generations" ON public.colossyan_generations
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_company_role(auth.uid(), 'learner'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    user_id = auth.uid()
  );

CREATE POLICY "Company users can create generations" ON public.colossyan_generations
  FOR INSERT WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_company_role(auth.uid(), 'learner'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can update generations" ON public.colossyan_generations
  FOR UPDATE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    user_id = auth.uid()
  );

-- Add updated_at trigger
CREATE TRIGGER update_colossyan_generations_updated_at
  BEFORE UPDATE ON public.colossyan_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_colossyan_generations_user_id ON public.colossyan_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_colossyan_generations_company_id ON public.colossyan_generations(company_id);
CREATE INDEX IF NOT EXISTS idx_colossyan_generations_status ON public.colossyan_generations(status);
CREATE INDEX IF NOT EXISTS idx_colossyan_generations_generation_id ON public.colossyan_generations(generation_id);