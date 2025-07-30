-- Create training modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  category TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  estimated_duration_minutes INTEGER DEFAULT 30,
  company_id UUID REFERENCES companies(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID,
  employee_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  position TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adaptive quiz sessions table
CREATE TABLE IF NOT EXISTS public.adaptive_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  training_module_id UUID REFERENCES training_modules(id),
  status TEXT DEFAULT 'active',
  current_difficulty TEXT DEFAULT 'intermediate',
  performance_score DECIMAL(3,2),
  total_questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  correct_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  difficulty_adjustments JSONB DEFAULT '[]',
  topics_mastered TEXT[] DEFAULT '{}',
  topics_struggling TEXT[] DEFAULT '{}',
  last_question_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_module_id UUID REFERENCES training_modules(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  topic_tags TEXT[] DEFAULT '{}',
  points INTEGER DEFAULT 1,
  time_limit_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create quiz responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES adaptive_quiz_sessions(id),
  question_id UUID REFERENCES quiz_questions(id),
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  difficulty_at_time TEXT,
  response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_modules
CREATE POLICY "Users can view training modules from their company" ON public.training_modules
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins and company admins can manage training modules" ON public.training_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'super_admin' OR (role IN ('company_admin', 'admin') AND company_id = training_modules.company_id))
    )
  );

-- Create RLS policies for employees
CREATE POLICY "Users can view employees from their company" ON public.employees
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can manage employees" ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'super_admin' OR (role IN ('company_admin', 'admin') AND company_id = employees.company_id))
    )
  );

-- Create RLS policies for adaptive_quiz_sessions
CREATE POLICY "Users can view quiz sessions from their company" ON public.adaptive_quiz_sessions
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees WHERE company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create their own quiz sessions" ON public.adaptive_quiz_sessions
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own quiz sessions" ON public.adaptive_quiz_sessions
  FOR UPDATE USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for quiz_questions
CREATE POLICY "Users can view quiz questions from their company modules" ON public.quiz_questions
  FOR SELECT USING (
    training_module_id IN (
      SELECT id FROM training_modules WHERE company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Company admins can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN training_modules tm ON tm.company_id = p.company_id
      WHERE p.user_id = auth.uid() 
      AND tm.id = quiz_questions.training_module_id
      AND (p.role = 'super_admin' OR p.role IN ('company_admin', 'admin'))
    )
  );

-- Create RLS policies for quiz_responses
CREATE POLICY "Users can view quiz responses from their sessions" ON public.quiz_responses
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM adaptive_quiz_sessions WHERE employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create quiz responses for their sessions" ON public.quiz_responses
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM adaptive_quiz_sessions WHERE employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_modules_company_id ON public.training_modules(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_quiz_sessions_employee_id ON public.adaptive_quiz_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_quiz_sessions_status ON public.adaptive_quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_training_module_id ON public.quiz_questions(training_module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_id ON public.quiz_responses(session_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adaptive_quiz_sessions_updated_at BEFORE UPDATE ON public.adaptive_quiz_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();