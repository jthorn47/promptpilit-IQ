-- Create learning reflections table
CREATE TABLE public.learning_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  training_module_id UUID,
  scene_id UUID,
  assignment_id UUID,
  reflection_type TEXT NOT NULL DEFAULT 'post_training', -- 'post_training', 'post_scenario'
  
  -- The four reflection questions
  usefulness_response TEXT, -- "What part of this training will be most useful in your real job?"
  confusion_response TEXT,  -- "Was there anything confusing or unclear?"
  application_response TEXT, -- "What would you do differently if this happened tomorrow?"
  teaching_response TEXT,   -- "If you had to explain this concept to a new teammate, how would you say it?"
  
  -- Metadata
  module_topic TEXT,
  tags TEXT[] DEFAULT '{}',
  sentiment_score NUMERIC, -- Optional AI analysis of sentiment
  themes TEXT[] DEFAULT '{}', -- Identified themes
  
  -- Privacy and sharing
  is_anonymous BOOLEAN DEFAULT true,
  allow_peer_sharing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_learning_reflections_employee ON public.learning_reflections(employee_id);
CREATE INDEX idx_learning_reflections_module ON public.learning_reflections(training_module_id);
CREATE INDEX idx_learning_reflections_topic ON public.learning_reflections(module_topic);
CREATE INDEX idx_learning_reflections_tags ON public.learning_reflections USING GIN(tags);
CREATE INDEX idx_learning_reflections_themes ON public.learning_reflections USING GIN(themes);
CREATE INDEX idx_learning_reflections_created ON public.learning_reflections(created_at);

-- Enable RLS
ALTER TABLE public.learning_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own reflections"
  ON public.learning_reflections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = learning_reflections.employee_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own reflections"
  ON public.learning_reflections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = learning_reflections.employee_id 
      AND e.user_id = auth.uid()
    )
    OR 
    has_role(auth.uid(), 'company_admin'::app_role)
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can view company reflections"
  ON public.learning_reflections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e 
      JOIN company_settings cs ON e.company_id = cs.id
      WHERE e.id = learning_reflections.employee_id 
      AND has_company_role(auth.uid(), 'company_admin'::app_role, cs.id)
    )
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view anonymized peer reflections"
  ON public.learning_reflections
  FOR SELECT
  USING (
    allow_peer_sharing = true 
    AND is_anonymous = true
  );

-- Create trigger for updated_at
CREATE TRIGGER update_learning_reflections_updated_at
  BEFORE UPDATE ON public.learning_reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_learning();

-- Create reflection themes summary table for analytics
CREATE TABLE public.reflection_themes_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  training_module_id UUID,
  module_topic TEXT,
  theme TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  sentiment_avg NUMERIC,
  question_type TEXT, -- 'usefulness', 'confusion', 'application', 'teaching'
  
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reflection_themes_company ON public.reflection_themes_summary(company_id);
CREATE INDEX idx_reflection_themes_module ON public.reflection_themes_summary(training_module_id);
CREATE INDEX idx_reflection_themes_week ON public.reflection_themes_summary(week_start);
CREATE INDEX idx_reflection_themes_theme ON public.reflection_themes_summary(theme);

-- Enable RLS for themes summary
ALTER TABLE public.reflection_themes_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view reflection themes"
  ON public.reflection_themes_summary
  FOR SELECT
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create trigger for themes summary updated_at
CREATE TRIGGER update_reflection_themes_summary_updated_at
  BEFORE UPDATE ON public.reflection_themes_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_learning();