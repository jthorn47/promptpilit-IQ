-- Create role-based learning profiles table
CREATE TABLE public.role_learning_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_title TEXT NOT NULL,
  industry TEXT NOT NULL,
  org_size_category TEXT NOT NULL, -- 'small', 'medium', 'large', 'enterprise'
  
  -- Core learning priorities for this role/context
  priority_areas TEXT[] DEFAULT '{}', -- e.g., ['compliance', 'safety', 'leadership']
  focus_topics TEXT[] DEFAULT '{}', -- e.g., ['leave_laws', 'sb_553', 'conflict_resolution']
  
  -- Learning track configuration
  recommended_modules TEXT[] DEFAULT '{}',
  scenario_types TEXT[] DEFAULT '{}', -- e.g., ['escalation', 'documentation', 'coaching']
  difficulty_progression TEXT DEFAULT 'gradual', -- 'gradual', 'accelerated', 'intensive'
  
  -- CoachGPT personalization rules
  coaching_style TEXT DEFAULT 'supportive', -- 'supportive', 'direct', 'analytical'
  context_prompts TEXT[] DEFAULT '{}',
  role_specific_examples TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_role_learning_profiles_role ON public.role_learning_profiles(role_title);
CREATE INDEX idx_role_learning_profiles_industry ON public.role_learning_profiles(industry);
CREATE INDEX idx_role_learning_profiles_org_size ON public.role_learning_profiles(org_size_category);
CREATE INDEX idx_role_learning_profiles_areas ON public.role_learning_profiles USING GIN(priority_areas);

-- Enable RLS
ALTER TABLE public.role_learning_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage role learning profiles"
  ON public.role_learning_profiles
  FOR ALL
  USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view active role learning profiles"
  ON public.role_learning_profiles
  FOR SELECT
  USING (is_active = true);

-- Create adaptive learning journeys table
CREATE TABLE public.adaptive_learning_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  
  -- Input data
  role_title TEXT NOT NULL,
  industry TEXT NOT NULL,
  org_size_category TEXT NOT NULL,
  hr_risk_score INTEGER, -- From HR risk assessment
  risk_areas TEXT[] DEFAULT '{}', -- Specific risk areas identified
  
  -- Generated learning path
  learning_track_id UUID, -- Reference to generated track
  suggested_modules TEXT[] DEFAULT '{}',
  priority_scenarios TEXT[] DEFAULT '{}',
  
  -- Personalization rules
  coachgpt_personality TEXT DEFAULT 'supportive',
  context_rules JSONB DEFAULT '{}',
  adaptation_triggers JSONB DEFAULT '{}', -- When to adjust the journey
  
  -- Progress tracking
  current_module_index INTEGER DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0.0,
  performance_metrics JSONB DEFAULT '{}',
  last_adaptation_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_adaptive_journeys_employee ON public.adaptive_learning_journeys(employee_id);
CREATE INDEX idx_adaptive_journeys_role ON public.adaptive_learning_journeys(role_title);
CREATE INDEX idx_adaptive_journeys_industry ON public.adaptive_learning_journeys(industry);
CREATE INDEX idx_adaptive_journeys_risk ON public.adaptive_learning_journeys(hr_risk_score);

-- Enable RLS
ALTER TABLE public.adaptive_learning_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own learning journey"
  ON public.adaptive_learning_journeys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = adaptive_learning_journeys.employee_id 
      AND e.user_id = auth.uid()
    )
    OR 
    has_role(auth.uid(), 'company_admin'::app_role)
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage learning journeys"
  ON public.adaptive_learning_journeys
  FOR ALL
  USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_role_learning_profiles_updated_at
  BEFORE UPDATE ON public.role_learning_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_learning();

CREATE TRIGGER update_adaptive_learning_journeys_updated_at
  BEFORE UPDATE ON public.adaptive_learning_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_learning();

-- Insert sample role-based learning profiles
INSERT INTO public.role_learning_profiles (
  role_title, industry, org_size_category, priority_areas, focus_topics, 
  recommended_modules, scenario_types, coaching_style, context_prompts, role_specific_examples
) VALUES
(
  'HR Generalist', 'general', 'medium',
  ARRAY['compliance', 'documentation', 'conflict_management'],
  ARRAY['leave_laws', 'fmla', 'documentation_standards', 'conflict_resolution', 'employee_relations'],
  ARRAY['compliance_fundamentals', 'hr_documentation', 'conflict_management'],
  ARRAY['documentation', 'employee_inquiry', 'conflict_mediation'],
  'supportive',
  ARRAY['Focus on practical compliance scenarios', 'Emphasize documentation best practices', 'Include employee relations examples'],
  ARRAY['FMLA leave request from employee with chronic condition', 'Documentation for performance improvement plan', 'Mediating conflict between team members']
),
(
  'Safety Manager', 'manufacturing', 'large',
  ARRAY['safety_compliance', 'incident_management', 'hazard_recognition'],
  ARRAY['sb_553', 'osha_standards', 'incident_reporting', 'hazard_identification', 'safety_training'],
  ARRAY['sb_553_compliance', 'incident_management', 'safety_leadership'],
  ARRAY['incident_response', 'hazard_assessment', 'safety_training'],
  'direct',
  ARRAY['Focus on immediate safety responses', 'Emphasize regulatory compliance', 'Include real-world safety scenarios'],
  ARRAY['Workplace violence prevention under SB 553', 'Investigating safety incident with potential OSHA involvement', 'Conducting safety training for resistant employees']
),
(
  'Frontline Manager', 'retail', 'small',
  ARRAY['leadership', 'performance_management', 'employee_engagement'],
  ARRAY['coaching', 'feedback', 'escalation', 'team_morale', 'performance_conversations'],
  ARRAY['supervisory_skills', 'performance_management', 'employee_engagement'],
  ARRAY['coaching', 'performance_feedback', 'escalation_management'],
  'analytical',
  ARRAY['Focus on practical leadership scenarios', 'Emphasize team dynamics', 'Include performance management examples'],
  ARRAY['Coaching underperforming employee', 'Managing team conflict during busy season', 'Escalating HR issue while maintaining team morale']
);