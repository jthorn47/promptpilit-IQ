-- Create micro-content library table
CREATE TABLE public.micro_content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Content identification
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'video', 'flashcard_set', 'drill_question', 'coachgpt_replay'
  topic_tags TEXT[] DEFAULT '{}', -- e.g., ['escalation', 'documentation', 'conflict_resolution']
  skill_level TEXT DEFAULT 'basic', -- 'basic', 'intermediate', 'advanced'
  estimated_duration_seconds INTEGER DEFAULT 60, -- Duration in seconds
  
  -- Content data
  content_url TEXT, -- For videos
  content_data JSONB DEFAULT '{}', -- For flashcards, questions, etc.
  thumbnail_url TEXT,
  description TEXT,
  
  -- Targeting criteria
  target_roles TEXT[] DEFAULT '{}', -- Which roles this content is for
  target_industries TEXT[] DEFAULT '{}',
  trigger_contexts TEXT[] DEFAULT '{}', -- 'quiz_failure', 'scenario_failure', 'long_pause', 'missed_refresh'
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC DEFAULT 0.0, -- How effective this content is
  
  -- Metadata
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_micro_content_tags ON public.micro_content_library USING GIN(topic_tags);
CREATE INDEX idx_micro_content_roles ON public.micro_content_library USING GIN(target_roles);
CREATE INDEX idx_micro_content_triggers ON public.micro_content_library USING GIN(trigger_contexts);
CREATE INDEX idx_micro_content_active ON public.micro_content_library(is_active);

-- Enable RLS
ALTER TABLE public.micro_content_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage micro-content"
  ON public.micro_content_library
  FOR ALL
  USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view active micro-content"
  ON public.micro_content_library
  FOR SELECT
  USING (is_active = true);

-- Create learning trigger events table
CREATE TABLE public.learning_trigger_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  training_module_id UUID,
  scene_id UUID,
  assignment_id UUID,
  
  -- Trigger details
  trigger_type TEXT NOT NULL, -- 'quiz_failure', 'scenario_failure', 'long_pause', 'missed_refresh'
  trigger_context JSONB DEFAULT '{}', -- Additional context about the trigger
  detected_topics TEXT[] DEFAULT '{}', -- Topics the learner is struggling with
  
  -- Response
  micro_content_served UUID[], -- IDs of micro-content served
  response_effectiveness NUMERIC, -- How effective the intervention was
  learner_engaged BOOLEAN, -- Did learner engage with micro-content
  
  -- Session data
  session_id TEXT,
  current_progress NUMERIC DEFAULT 0.0,
  performance_before JSONB DEFAULT '{}',
  performance_after JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_trigger_events_employee ON public.learning_trigger_events(employee_id);
CREATE INDEX idx_trigger_events_module ON public.learning_trigger_events(training_module_id);
CREATE INDEX idx_trigger_events_type ON public.learning_trigger_events(trigger_type);
CREATE INDEX idx_trigger_events_topics ON public.learning_trigger_events USING GIN(detected_topics);
CREATE INDEX idx_trigger_events_created ON public.learning_trigger_events(created_at);

-- Enable RLS
ALTER TABLE public.learning_trigger_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trigger events"
  ON public.learning_trigger_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = learning_trigger_events.employee_id 
      AND e.user_id = auth.uid()
    )
    OR 
    has_role(auth.uid(), 'company_admin'::app_role)
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage trigger events"
  ON public.learning_trigger_events
  FOR ALL
  USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create micro-learning interventions table
CREATE TABLE public.micro_learning_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_event_id UUID NOT NULL REFERENCES public.learning_trigger_events(id),
  micro_content_id UUID NOT NULL REFERENCES public.micro_content_library(id),
  
  -- Delivery details
  delivery_method TEXT DEFAULT 'modal', -- 'modal', 'sidebar', 'notification', 'inline'
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Engagement tracking
  viewed BOOLEAN DEFAULT false,
  view_duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  rated BOOLEAN DEFAULT false,
  rating INTEGER, -- 1-5 scale
  feedback TEXT,
  
  -- Effectiveness
  helped_performance BOOLEAN,
  performance_improvement NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_interventions_trigger ON public.micro_learning_interventions(trigger_event_id);
CREATE INDEX idx_interventions_content ON public.micro_learning_interventions(micro_content_id);
CREATE INDEX idx_interventions_delivered ON public.micro_learning_interventions(delivered_at);

-- Enable RLS
ALTER TABLE public.micro_learning_interventions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view interventions for their trigger events"
  ON public.micro_learning_interventions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_trigger_events lte
      JOIN employees e ON lte.employee_id = e.id
      WHERE lte.id = micro_learning_interventions.trigger_event_id
      AND e.user_id = auth.uid()
    )
    OR 
    has_role(auth.uid(), 'company_admin'::app_role)
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage interventions"
  ON public.micro_learning_interventions
  FOR ALL
  USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_micro_content_library_updated_at
  BEFORE UPDATE ON public.micro_content_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_learning();

-- Insert sample micro-content
INSERT INTO public.micro_content_library (
  title, content_type, topic_tags, estimated_duration_seconds, content_data,
  description, target_roles, trigger_contexts
) VALUES
(
  'Quick Escalation Tactics Review',
  'video',
  ARRAY['escalation', 'conflict_management', 'communication'],
  90,
  '{"video_id": "escalation_tactics_90s", "chapters": [{"start": 0, "title": "When to Escalate"}, {"start": 30, "title": "How to Escalate"}, {"start": 60, "title": "Follow-up Steps"}]}',
  '90-second refresher on escalation tactics used by other supervisors',
  ARRAY['manager', 'supervisor', 'team_lead'],
  ARRAY['quiz_failure', 'scenario_failure']
),
(
  'Documentation Essentials Flashcards',
  'flashcard_set',
  ARRAY['documentation', 'compliance', 'record_keeping'],
  120,
  '{"cards": [{"front": "What are the 3 key elements of proper documentation?", "back": "1. Objective facts 2. Specific dates/times 3. Actionable outcomes"}, {"front": "When should you document an employee interaction?", "back": "Within 24 hours while details are fresh"}]}',
  'Key documentation principles in quick flashcard format',
  ARRAY['hr_generalist', 'manager', 'supervisor'],
  ARRAY['quiz_failure', 'long_pause']
),
(
  'Conflict Resolution Drill',
  'drill_question',
  ARRAY['conflict_resolution', 'mediation', 'communication'],
  60,
  '{"question": "Two team members are arguing about project priorities. Your first step should be:", "options": ["A) Side with the senior employee", "B) Listen to both perspectives separately", "C) Immediately schedule a group meeting", "D) Refer to company policy"], "correct": "B", "explanation": "Gathering individual perspectives first prevents escalation and shows respect for both parties."}',
  'Quick drill on conflict resolution first steps',
  ARRAY['manager', 'team_lead', 'supervisor'],
  ARRAY['scenario_failure', 'long_pause']
),
(
  'Safety Protocol Reminder',
  'coachgpt_replay',
  ARRAY['safety', 'protocols', 'sb_553'],
  45,
  '{"replay_scenario": "safety_incident_response", "key_points": ["Secure the area", "Check for injuries", "Document everything", "Report immediately"], "coach_personality": "direct"}',
  'CoachGPT replay of safety incident response protocol',
  ARRAY['safety_manager', 'supervisor', 'frontline_worker'],
  ARRAY['missed_refresh', 'scenario_failure']
);