-- Enhanced Quiz System for Training Modules

-- First, create enum types for quiz-related fields
CREATE TYPE quiz_question_type AS ENUM (
  'multiple_choice_single',
  'multiple_choice_multiple', 
  'true_false',
  'fill_in_blank',
  'drag_drop',
  'scenario_based'
);

CREATE TYPE quiz_attempt_status AS ENUM (
  'in_progress',
  'completed',
  'passed',
  'failed'
);

-- Quiz configurations table (per training module)
CREATE TABLE public.quiz_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Module Quiz',
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 80,
  max_attempts INTEGER DEFAULT 3,
  allow_retries BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_answers BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  allow_review BOOLEAN DEFAULT true,
  time_limit_minutes INTEGER, -- NULL means no time limit
  random_pool_size INTEGER, -- NULL means use all questions
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_configuration_id UUID NOT NULL REFERENCES public.quiz_configurations(id) ON DELETE CASCADE,
  question_type quiz_question_type NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  question_video_url TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  explanation TEXT, -- General explanation shown after answering
  correct_feedback TEXT, -- Feedback for correct answers
  incorrect_feedback TEXT, -- Feedback for incorrect answers
  question_order INTEGER NOT NULL DEFAULT 0,
  category TEXT, -- For tagging questions (e.g., "Harassment Law")
  metadata JSONB DEFAULT '{}', -- For storing additional question-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz answer options table
CREATE TABLE public.quiz_answer_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_image_url TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  option_order INTEGER NOT NULL DEFAULT 0,
  explanation TEXT, -- Optional explanation for this specific option
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz attempts table (tracks learner attempts)
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_configuration_id UUID NOT NULL REFERENCES public.quiz_configurations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status quiz_attempt_status NOT NULL DEFAULT 'in_progress',
  score NUMERIC(5,2), -- Percentage score
  total_points INTEGER,
  earned_points INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  metadata JSONB DEFAULT '{}', -- For storing additional attempt data
  UNIQUE(quiz_configuration_id, employee_id, attempt_number)
);

-- Quiz responses table (individual question responses)
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[], -- Array of selected option IDs
  text_response TEXT, -- For fill-in-blank questions
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  response_metadata JSONB DEFAULT '{}', -- For storing response-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- Quiz analytics table (for admin reporting)
CREATE TABLE public.quiz_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_configuration_id UUID NOT NULL REFERENCES public.quiz_configurations(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  average_time_seconds NUMERIC(10,2),
  difficulty_index NUMERIC(5,2), -- Percentage of correct answers
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Quiz Configurations
CREATE POLICY "Company admins can manage their quiz configurations"
ON public.quiz_configurations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    WHERE tm.id = quiz_configurations.training_module_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Learners can view quiz configurations for their assigned training"
ON public.quiz_configurations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    JOIN public.training_assignments ta ON tm.id = ta.training_module_id
    JOIN public.employees e ON ta.employee_id = e.id
    JOIN public.profiles p ON e.email = p.email
    WHERE tm.id = quiz_configurations.training_module_id
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for Quiz Questions
CREATE POLICY "Company admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_configurations qc
    JOIN public.training_modules tm ON qc.training_module_id = tm.id
    WHERE qc.id = quiz_questions.quiz_configuration_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Learners can view quiz questions for their assigned training"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_configurations qc
    JOIN public.training_modules tm ON qc.training_module_id = tm.id
    JOIN public.training_assignments ta ON tm.id = ta.training_module_id
    JOIN public.employees e ON ta.employee_id = e.id
    JOIN public.profiles p ON e.email = p.email
    WHERE qc.id = quiz_questions.quiz_configuration_id
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for Quiz Answer Options
CREATE POLICY "Company admins can manage quiz answer options"
ON public.quiz_answer_options
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quiz_configurations qc ON qq.quiz_configuration_id = qc.id
    JOIN public.training_modules tm ON qc.training_module_id = tm.id
    WHERE qq.id = quiz_answer_options.question_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Learners can view quiz answer options for their assigned training"
ON public.quiz_answer_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions qq
    JOIN public.quiz_configurations qc ON qq.quiz_configuration_id = qc.id
    JOIN public.training_modules tm ON qc.training_module_id = tm.id
    JOIN public.training_assignments ta ON tm.id = ta.training_module_id
    JOIN public.employees e ON ta.employee_id = e.id
    JOIN public.profiles p ON e.email = p.email
    WHERE qq.id = quiz_answer_options.question_id
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for Quiz Attempts
CREATE POLICY "Learners can manage their own quiz attempts"
ON public.quiz_attempts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON e.email = p.email
    WHERE e.id = quiz_attempts.employee_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can view all quiz attempts for their company"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = quiz_attempts.employee_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      (has_role(auth.uid(), 'company_admin'::app_role) AND e.company_id = get_user_company_id(auth.uid()))
    )
  )
);

-- RLS Policies for Quiz Responses
CREATE POLICY "Learners can manage their own quiz responses"
ON public.quiz_responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    JOIN public.employees e ON qa.employee_id = e.id
    JOIN public.profiles p ON e.email = p.email
    WHERE qa.id = quiz_responses.attempt_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can view quiz responses for their company"
ON public.quiz_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    JOIN public.employees e ON qa.employee_id = e.id
    WHERE qa.id = quiz_responses.attempt_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      (has_role(auth.uid(), 'company_admin'::app_role) AND e.company_id = get_user_company_id(auth.uid()))
    )
  )
);

-- RLS Policies for Quiz Analytics
CREATE POLICY "Company admins can view quiz analytics"
ON public.quiz_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_configurations qc
    JOIN public.training_modules tm ON qc.training_module_id = tm.id
    WHERE qc.id = quiz_analytics.quiz_configuration_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_configurations_training_module ON public.quiz_configurations(training_module_id);
CREATE INDEX idx_quiz_questions_configuration ON public.quiz_questions(quiz_configuration_id);
CREATE INDEX idx_quiz_questions_type ON public.quiz_questions(question_type);
CREATE INDEX idx_quiz_answer_options_question ON public.quiz_answer_options(question_id);
CREATE INDEX idx_quiz_attempts_employee ON public.quiz_attempts(employee_id);
CREATE INDEX idx_quiz_attempts_configuration ON public.quiz_attempts(quiz_configuration_id);
CREATE INDEX idx_quiz_responses_attempt ON public.quiz_responses(attempt_id);
CREATE INDEX idx_quiz_responses_question ON public.quiz_responses(question_id);
CREATE INDEX idx_quiz_analytics_configuration ON public.quiz_analytics(quiz_configuration_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_quiz_configurations_updated_at
  BEFORE UPDATE ON public.quiz_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_analytics_updated_at
  BEFORE UPDATE ON public.quiz_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();