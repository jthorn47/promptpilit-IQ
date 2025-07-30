-- Create behavior tracking table for detailed learner analytics
CREATE TABLE IF NOT EXISTS public.learner_behavior_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_id UUID,
  training_module_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  
  -- Detailed behavior data
  behavior_type TEXT NOT NULL, -- 'pause', 'rewind', 'fast_forward', 'quiz_retry', 'help_request', 'section_complete', 'module_abandon'
  section_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  
  -- Context data
  content_position INTEGER, -- Position in video/content (seconds or percentage)
  quiz_question_id TEXT,
  quiz_attempt_number INTEGER,
  quiz_answer_selected TEXT,
  quiz_correct_answer TEXT,
  
  -- Behavioral tags and metadata
  behavioral_tags JSONB DEFAULT '[]'::jsonb,
  struggle_indicators JSONB DEFAULT '{}'::jsonb,
  engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create behavior insights table for Sarah's analysis
CREATE TABLE IF NOT EXISTS public.sarah_behavior_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_module_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'struggle_pattern', 'engagement_drop', 'improvement_needed', 'high_performance'
  
  -- Insight details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Affected users and patterns
  affected_user_count INTEGER DEFAULT 0,
  behavior_pattern JSONB NOT NULL,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Context
  section_id TEXT,
  content_topic TEXT,
  quiz_question_ids TEXT[],
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'addressed', 'dismissed'
  flagged_for_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create microlearning recommendations table
CREATE TABLE IF NOT EXISTS public.microlearning_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_id UUID,
  training_module_id UUID NOT NULL,
  
  -- Recommendation details
  recommendation_type TEXT NOT NULL, -- 'content_review', 'practice_quiz', 'concept_reinforcement', 'coaching_session'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_url TEXT,
  estimated_duration_minutes INTEGER,
  
  -- Triggering behavior
  triggered_by_behavior_id UUID,
  trigger_reason TEXT NOT NULL,
  behavioral_context JSONB DEFAULT '{}'::jsonb,
  
  -- Delivery
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  delivery_method TEXT DEFAULT 'notification', -- 'notification', 'email', 'dashboard', 'coach_gpt'
  scheduled_for TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'viewed', 'completed', 'dismissed'
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_behavior_tracking_user_module ON public.learner_behavior_tracking(user_id, training_module_id);
CREATE INDEX idx_behavior_tracking_session ON public.learner_behavior_tracking(session_id);
CREATE INDEX idx_behavior_tracking_timestamp ON public.learner_behavior_tracking(timestamp);
CREATE INDEX idx_behavior_tracking_type ON public.learner_behavior_tracking(behavior_type);

CREATE INDEX idx_sarah_insights_module ON public.sarah_behavior_insights(training_module_id);
CREATE INDEX idx_sarah_insights_severity ON public.sarah_behavior_insights(severity);
CREATE INDEX idx_sarah_insights_status ON public.sarah_behavior_insights(status);

CREATE INDEX idx_microlearning_user ON public.microlearning_recommendations(user_id);
CREATE INDEX idx_microlearning_priority ON public.microlearning_recommendations(priority, status);

-- Enable RLS
ALTER TABLE public.learner_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarah_behavior_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microlearning_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for behavior tracking
CREATE POLICY "Users can insert their own behavior data" 
ON public.learner_behavior_tracking FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id AND e.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can view their own behavior data" 
ON public.learner_behavior_tracking FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id AND e.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for Sarah insights
CREATE POLICY "Company admins can view insights" 
ON public.sarah_behavior_insights FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can manage insights" 
ON public.sarah_behavior_insights FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for microlearning recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.microlearning_recommendations FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id AND e.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their recommendation status" 
ON public.microlearning_recommendations FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id AND e.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert recommendations" 
ON public.microlearning_recommendations FOR INSERT 
WITH CHECK (true);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_behavior_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_behavior_tracking_updated_at
  BEFORE UPDATE ON public.learner_behavior_tracking
  FOR EACH ROW EXECUTE FUNCTION update_behavior_updated_at();

CREATE TRIGGER update_sarah_insights_updated_at
  BEFORE UPDATE ON public.sarah_behavior_insights
  FOR EACH ROW EXECUTE FUNCTION update_behavior_updated_at();

CREATE TRIGGER update_microlearning_updated_at
  BEFORE UPDATE ON public.microlearning_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_behavior_updated_at();