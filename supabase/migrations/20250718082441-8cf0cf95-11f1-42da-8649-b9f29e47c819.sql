-- Create adaptive quiz system tables
CREATE TABLE public.adaptive_quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  training_module_id UUID NOT NULL,
  assignment_id UUID NOT NULL,
  current_difficulty TEXT NOT NULL DEFAULT 'basic' CHECK (current_difficulty IN ('basic', 'intermediate', 'advanced')),
  correct_streak INTEGER DEFAULT 0,
  incorrect_streak INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0.0,
  struggle_topics TEXT[] DEFAULT '{}',
  mastered_topics TEXT[] DEFAULT '{}',
  adaptive_rules JSONB DEFAULT '{}',
  session_metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create adaptive question log to track difficulty progression
CREATE TABLE public.adaptive_question_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.adaptive_quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  difficulty_presented TEXT NOT NULL,
  topic TEXT,
  answer_correct BOOLEAN,
  time_spent_seconds INTEGER,
  struggle_indicators JSONB DEFAULT '{}',
  adaptive_reason TEXT, -- Why this question was selected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add metadata fields to question_bank for better adaptive selection
ALTER TABLE public.question_bank 
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS remediation_hint TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];

-- Create indexes for performance
CREATE INDEX idx_adaptive_quiz_sessions_employee_module ON public.adaptive_quiz_sessions(employee_id, training_module_id);
CREATE INDEX idx_adaptive_question_log_session ON public.adaptive_question_log(session_id);
CREATE INDEX idx_question_bank_difficulty_topic ON public.question_bank(difficulty, topic);
CREATE INDEX idx_question_bank_company_difficulty ON public.question_bank(company_id, difficulty);

-- Enable RLS
ALTER TABLE public.adaptive_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_question_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adaptive_quiz_sessions
CREATE POLICY "Users can view their own adaptive quiz sessions" ON public.adaptive_quiz_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = adaptive_quiz_sessions.employee_id 
      AND e.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'company_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can insert their own adaptive quiz sessions" ON public.adaptive_quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = adaptive_quiz_sessions.employee_id 
      AND e.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'company_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can update their own adaptive quiz sessions" ON public.adaptive_quiz_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = adaptive_quiz_sessions.employee_id 
      AND e.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'company_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for adaptive_question_log
CREATE POLICY "Users can view their own adaptive question logs" ON public.adaptive_question_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.adaptive_quiz_sessions aqs
      JOIN public.employees e ON aqs.employee_id = e.id
      WHERE aqs.id = adaptive_question_log.session_id 
      AND e.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'company_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can insert their own adaptive question logs" ON public.adaptive_question_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.adaptive_quiz_sessions aqs
      JOIN public.employees e ON aqs.employee_id = e.id
      WHERE aqs.id = adaptive_question_log.session_id 
      AND e.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'company_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create function to update adaptive session
CREATE OR REPLACE FUNCTION public.update_adaptive_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_adaptive_quiz_sessions_updated_at
  BEFORE UPDATE ON public.adaptive_quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_adaptive_session_updated_at();