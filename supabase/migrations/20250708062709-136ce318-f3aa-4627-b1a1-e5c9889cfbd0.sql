-- Create missing user engagement system tables

-- 2. Gamification system
CREATE TABLE public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'award',
  badge_color TEXT DEFAULT '#655DC6',
  points INTEGER NOT NULL DEFAULT 0,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('training_completion', 'streak', 'speed', 'perfect_score', 'milestone', 'special')),
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievement_definitions(id),
  company_id UUID REFERENCES public.company_settings(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.company_settings(id),
  total_points INTEGER NOT NULL DEFAULT 0,
  points_this_month INTEGER NOT NULL DEFAULT 0,
  points_this_week INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- 3. Bulk operations tracking
CREATE TABLE public.bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('training_assignment', 'employee_import', 'email_campaign', 'certificate_generation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  created_by UUID NOT NULL,
  company_id UUID REFERENCES public.company_settings(id),
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  successful_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  operation_data JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '{}',
  error_log TEXT[],
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Integration triggers
CREATE TABLE public.integration_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  secret_key TEXT,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('slack', 'teams', 'zapier', 'webhook', 'email')),
  trigger_events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID NOT NULL,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Achievement definitions are viewable by everyone" 
ON public.achievement_definitions FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage achievement definitions" 
ON public.achievement_definitions FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their achievements" 
ON public.user_achievements FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Company admins can view company achievements" 
ON public.user_achievements FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (true);

-- RLS Policies for user points
CREATE POLICY "Users can view their own points" 
ON public.user_points FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Company admins can view company points" 
ON public.user_points FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can manage user points" 
ON public.user_points FOR ALL 
USING (true);

-- RLS Policies for bulk operations
CREATE POLICY "Company admins can manage bulk operations" 
ON public.bulk_operations FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR created_by = auth.uid()
);

-- RLS Policies for integration webhooks
CREATE POLICY "Company admins can manage webhooks" 
ON public.integration_webhooks FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add triggers for updated_at
CREATE TRIGGER update_user_points_updated_at
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_operations_updated_at
BEFORE UPDATE ON public.bulk_operations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_webhooks_updated_at
BEFORE UPDATE ON public.integration_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_bulk_operations_status ON public.bulk_operations(status);

-- Insert default achievement definitions
INSERT INTO public.achievement_definitions (name, description, icon, points, achievement_type, criteria) VALUES
('First Steps', 'Complete your first training module', 'award', 10, 'training_completion', '{"modules_required": 1}'),
('Learning Streak', 'Complete training for 7 days in a row', 'flame', 50, 'streak', '{"days_required": 7}'),
('Speed Learner', 'Complete a training module in under 10 minutes', 'zap', 25, 'speed', '{"max_minutes": 10}'),
('Perfect Score', 'Score 100% on a training assessment', 'star', 30, 'perfect_score', '{"score_required": 100}'),
('Training Champion', 'Complete 10 training modules', 'trophy', 100, 'milestone', '{"modules_required": 10}'),
('Compliance Master', 'Complete all required compliance training', 'shield', 75, 'special', '{"type": "compliance_complete"}'),
('Quick Starter', 'Complete training within 24 hours of assignment', 'clock', 20, 'speed', '{"max_hours": 24}'),
('Team Player', 'Help 5 colleagues with training questions', 'users', 40, 'special', '{"help_count": 5}'),
('Knowledge Seeker', 'Complete 25 training modules', 'book-open', 200, 'milestone', '{"modules_required": 25}'),
('Training Legend', 'Complete 50 training modules', 'crown', 500, 'milestone', '{"modules_required": 50}');

-- Enable realtime for key tables
ALTER TABLE public.user_achievements REPLICA IDENTITY FULL;
ALTER TABLE public.user_points REPLICA IDENTITY FULL;
ALTER TABLE public.bulk_operations REPLICA IDENTITY FULL;