-- Create user behavior analytics table for EaseLearnX tracking
CREATE TABLE public.user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.training_assignments(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'play', 'pause', 'seek', 'rewind', 'quiz_attempt', 'quiz_pass', 'quiz_fail', 'dropout', 'complete'
    event_data JSONB DEFAULT '{}', -- Store additional data like timestamp, seek_from, seek_to, quiz_score, etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    current_time_seconds NUMERIC,
    video_duration_seconds NUMERIC,
    engagement_score NUMERIC DEFAULT 0, -- Calculated engagement metric
    metadata JSONB DEFAULT '{}', -- Additional context data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learner struggle profiles table
CREATE TABLE public.learner_struggle_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    struggle_indicators JSONB DEFAULT '{}', -- pause_frequency, rewind_rate, quiz_retry_count, avg_completion_time
    learning_patterns JSONB DEFAULT '{}', -- preferred_time_of_day, avg_session_length, content_preferences
    knowledge_gaps JSONB DEFAULT '{}', -- topics where user struggles most
    engagement_metrics JSONB DEFAULT '{}', -- overall engagement scores and trends
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employee_id)
);

-- Create content effectiveness analytics table
CREATE TABLE public.content_effectiveness_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    training_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
    avg_completion_time NUMERIC,
    avg_pause_frequency NUMERIC,
    avg_rewind_rate NUMERIC,
    dropout_rate NUMERIC,
    struggle_points JSONB DEFAULT '[]', -- Array of timestamps where users commonly struggle
    effectiveness_score NUMERIC DEFAULT 0,
    total_learners INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(scene_id)
);

-- Enable RLS
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_struggle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_effectiveness_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_behavior_analytics
CREATE POLICY "Users can view their own behavior analytics"
ON public.user_behavior_analytics
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = user_behavior_analytics.employee_id
        AND e.user_id = auth.uid()
    )
    OR has_company_role(auth.uid(), 'company_admin'::app_role, 
        (SELECT e.company_id FROM public.employees e WHERE e.id = user_behavior_analytics.employee_id)
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert behavior analytics"
ON public.user_behavior_analytics
FOR INSERT
WITH CHECK (true);

-- RLS policies for learner_struggle_profiles
CREATE POLICY "Users can view their own struggle profiles"
ON public.learner_struggle_profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = learner_struggle_profiles.employee_id
        AND e.user_id = auth.uid()
    )
    OR has_company_role(auth.uid(), 'company_admin'::app_role, 
        (SELECT e.company_id FROM public.employees e WHERE e.id = learner_struggle_profiles.employee_id)
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS policies for content_effectiveness_analytics
CREATE POLICY "Authorized users can view content effectiveness"
ON public.content_effectiveness_analytics
FOR ALL
USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'company_admin'::app_role)
);

-- Create indexes for better performance
CREATE INDEX idx_user_behavior_analytics_employee ON public.user_behavior_analytics(employee_id);
CREATE INDEX idx_user_behavior_analytics_scene ON public.user_behavior_analytics(scene_id);
CREATE INDEX idx_user_behavior_analytics_session ON public.user_behavior_analytics(session_id);
CREATE INDEX idx_user_behavior_analytics_event_type ON public.user_behavior_analytics(event_type);
CREATE INDEX idx_user_behavior_analytics_timestamp ON public.user_behavior_analytics(timestamp);
CREATE INDEX idx_learner_struggle_profiles_employee ON public.learner_struggle_profiles(employee_id);
CREATE INDEX idx_content_effectiveness_scene ON public.content_effectiveness_analytics(scene_id);