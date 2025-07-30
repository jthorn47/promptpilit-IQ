-- Create enhanced completion tracking system
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.training_assignments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  training_module_id UUID NOT NULL,
  scene_id UUID,
  
  -- Progress tracking
  overall_progress_percentage INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Content progress
  content_viewed_percentage INTEGER NOT NULL DEFAULT 0,
  content_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assessment progress
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  quiz_best_score INTEGER,
  quiz_passed BOOLEAN DEFAULT false,
  quiz_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Final completion
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'content_complete', 'quiz_complete', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(assignment_id, employee_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_learning_progress_employee ON public.learning_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_module ON public.learning_progress(training_module_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON public.learning_progress(status);

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Learners can view their own progress" ON public.learning_progress
FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "System can manage learning progress" ON public.learning_progress
FOR ALL USING (true);

CREATE POLICY "Company admins can view their company progress" ON public.learning_progress
FOR SELECT USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create learning paths system
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.company_settings(id),
  
  -- Path configuration
  is_sequential BOOLEAN NOT NULL DEFAULT true,
  estimated_duration_hours INTEGER,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_path_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL,
  sequence_order INTEGER NOT NULL,
  
  -- Prerequisites
  prerequisite_modules UUID[], -- Array of module IDs that must be completed first
  required_score_percentage INTEGER DEFAULT 80,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(learning_path_id, training_module_id),
  UNIQUE(learning_path_id, sequence_order)
);

-- Learning path assignments
CREATE TABLE IF NOT EXISTS public.learning_path_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  assigned_by UUID,
  
  -- Timeline
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress
  current_module_sequence INTEGER DEFAULT 1,
  overall_progress_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'paused')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(learning_path_id, employee_id)
);

-- Enhanced analytics tracking
CREATE TABLE IF NOT EXISTS public.training_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  assignment_id UUID REFERENCES public.training_assignments(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  training_module_id UUID,
  scene_id UUID,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'start', 'progress', 'pause', 'resume', 'complete', 'quiz_attempt', etc.
  event_data JSONB DEFAULT '{}',
  
  -- Context
  session_id UUID,
  user_agent TEXT,
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning paths
CREATE POLICY "Company users can view their learning paths" ON public.learning_paths
FOR SELECT USING (
  company_id IS NULL OR 
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage learning paths" ON public.learning_paths
FOR ALL USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_learning()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_learning();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_learning();

CREATE TRIGGER update_learning_path_assignments_updated_at
  BEFORE UPDATE ON public.learning_path_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_learning();