-- Create EaseLearn LMS database schema

-- Training modules table
CREATE TABLE public.training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_type TEXT DEFAULT 'upload', -- 'upload', 'youtube', 'vimeo'
  estimated_duration INTEGER, -- in minutes
  is_required BOOLEAN DEFAULT false,
  credit_value INTEGER DEFAULT 1,
  quiz_enabled BOOLEAN DEFAULT false,
  quiz_questions JSONB,
  passing_score INTEGER DEFAULT 80,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees/Learners table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  employee_id TEXT,
  department TEXT,
  position TEXT,
  preferred_language TEXT DEFAULT 'en', -- 'en', 'es'
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  company_id UUID, -- for future multi-company support
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training assignments table
CREATE TABLE public.training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'overdue'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  UNIQUE(employee_id, training_module_id)
);

-- Training completions/progress table
CREATE TABLE public.training_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.training_assignments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  video_watched_seconds INTEGER DEFAULT 0,
  video_total_seconds INTEGER,
  quiz_attempts INTEGER DEFAULT 0,
  quiz_score INTEGER,
  quiz_passed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id)
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number TEXT NOT NULL UNIQUE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  completion_id UUID NOT NULL REFERENCES public.training_completions(id) ON DELETE CASCADE,
  certificate_data JSONB, -- stores certificate details for regeneration
  pdf_url TEXT, -- URL to generated PDF
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- for recertification
  verification_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active', -- 'active', 'revoked', 'expired'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company settings for EaseLearn
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  primary_color TEXT DEFAULT '#655DC6', -- Easeworks purple
  email_notifications BOOLEAN DEFAULT true,
  certificate_template TEXT DEFAULT 'default',
  max_employees INTEGER DEFAULT 3, -- for billing
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'suspended'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access
CREATE POLICY "Admins can manage training modules" ON public.training_modules
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage employees" ON public.employees
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage training assignments" ON public.training_assignments
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can view training completions" ON public.training_completions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage certificates" ON public.certificates
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage company settings" ON public.company_settings
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_training_modules_updated_at
BEFORE UPDATE ON public.training_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_completions_updated_at
BEFORE UPDATE ON public.training_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings
INSERT INTO public.company_settings (company_name, primary_color)
VALUES ('Easeworks', '#655DC6');