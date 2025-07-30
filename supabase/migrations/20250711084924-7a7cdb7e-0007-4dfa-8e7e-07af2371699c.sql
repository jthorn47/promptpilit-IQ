-- Performance Evaluation System Database Schema

-- Enum types for performance evaluation system
CREATE TYPE evaluation_type AS ENUM (
  'self_evaluation',
  'manager_evaluation', 
  'peer_review',
  '360_feedback',
  'probationary_review',
  'annual_review',
  'semi_annual_review',
  'quarterly_review',
  'one_on_one',
  'custom'
);

CREATE TYPE review_status AS ENUM (
  'draft',
  'active',
  'pending_review',
  'completed',
  'overdue',
  'cancelled'
);

CREATE TYPE development_plan_status AS ENUM (
  'draft',
  'active',
  'completed',
  'extended',
  'cancelled'
);

CREATE TYPE probation_outcome AS ENUM (
  'pass',
  'extend',
  'fail',
  'pending'
);

-- Evaluation Templates
CREATE TABLE public.evaluation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_type evaluation_type NOT NULL,
  form_config JSONB NOT NULL DEFAULT '{}',
  scoring_model JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Review Cycles
CREATE TABLE public.review_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_type evaluation_type NOT NULL,
  template_id UUID REFERENCES public.evaluation_templates(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status review_status NOT NULL DEFAULT 'draft',
  target_criteria JSONB DEFAULT '{}', -- departments, roles, specific users
  notification_schedule JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Evaluations
CREATE TABLE public.performance_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  review_cycle_id UUID REFERENCES public.review_cycles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES auth.users(id),
  evaluation_type evaluation_type NOT NULL,
  status review_status NOT NULL DEFAULT 'draft',
  responses JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  overall_score DECIMAL(3,2),
  feedback TEXT,
  goals_review JSONB DEFAULT '{}',
  development_areas JSONB DEFAULT '{}',
  strengths JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Development Plans
CREATE TABLE public.development_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  evaluation_id UUID REFERENCES public.performance_evaluations(id),
  title TEXT NOT NULL,
  description TEXT,
  trigger_reason TEXT, -- e.g., "Score below 3.0", "Manager recommendation"
  goals JSONB NOT NULL DEFAULT '[]',
  training_assignments JSONB DEFAULT '[]',
  check_in_schedule JSONB DEFAULT '{}',
  status development_plan_status NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  final_evaluation_date DATE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One-on-One Meetings
CREATE TABLE public.one_on_one_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  manager_id UUID REFERENCES auth.users(id) NOT NULL,
  evaluation_id UUID REFERENCES public.performance_evaluations(id),
  development_plan_id UUID REFERENCES public.development_plans(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  agenda JSONB DEFAULT '{}',
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance-Based Raise Requests
CREATE TABLE public.raise_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  evaluation_id UUID REFERENCES public.performance_evaluations(id) NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  current_salary DECIMAL(12,2),
  proposed_salary DECIMAL(12,2),
  percentage_increase DECIMAL(5,2),
  justification TEXT NOT NULL,
  effective_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  denial_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Probation Tracking
CREATE TABLE public.probation_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL, -- 'new_hire', 'performance', 'role_change', 'return_from_leave'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  supervisor_id UUID REFERENCES auth.users(id),
  required_training JSONB DEFAULT '[]',
  required_evaluations JSONB DEFAULT '[]',
  outcome probation_outcome DEFAULT 'pending',
  outcome_notes TEXT,
  extension_reason TEXT,
  new_end_date DATE,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  payroll_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Audit Log
CREATE TABLE public.performance_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id),
  resource_type TEXT NOT NULL, -- 'evaluation', 'development_plan', 'one_on_one', 'raise_request', 'probation'
  resource_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'submitted', 'approved', 'cancelled'
  performed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning Path Recommendations
CREATE TABLE public.learning_path_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  evaluation_id UUID REFERENCES public.performance_evaluations(id),
  development_plan_id UUID REFERENCES public.development_plans(id),
  recommended_courses JSONB NOT NULL DEFAULT '[]',
  recommendation_reason TEXT,
  ai_confidence_score DECIMAL(3,2),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, completed
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Peer Review Nominations
CREATE TABLE public.peer_review_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_cycle_id UUID REFERENCES public.review_cycles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  nominated_peer_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  nominated_by UUID REFERENCES auth.users(id), -- self-nomination or manager nomination
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raise_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_nominations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_templates
CREATE POLICY "Company admins can manage evaluation templates"
ON public.evaluation_templates
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "HR can view evaluation templates"
ON public.evaluation_templates
FOR SELECT
USING (
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR 
  has_company_role(auth.uid(), 'manager'::app_role, company_id) OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for review_cycles
CREATE POLICY "Company users can view review cycles"
ON public.review_cycles
FOR SELECT
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR
  has_company_role(auth.uid(), 'manager'::app_role, company_id) OR
  has_company_role(auth.uid(), 'learner'::app_role, company_id) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "HR and admins can manage review cycles"
ON public.review_cycles
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_company_role(auth.uid(), 'hr'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_company_role(auth.uid(), 'hr'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for performance_evaluations
CREATE POLICY "Users can view their own evaluations"
ON public.performance_evaluations
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()) OR
  evaluator_id = auth.uid() OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Evaluators can create and update evaluations"
ON public.performance_evaluations
FOR ALL
USING (
  evaluator_id = auth.uid() OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  evaluator_id = auth.uid() OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Similar policies for other tables (abbreviated for space)
CREATE POLICY "Company users can access development plans"
ON public.development_plans
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()) OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  has_company_role(auth.uid(), 'hr'::app_role, company_id) OR
  has_company_role(auth.uid(), 'manager'::app_role, company_id) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Indexes for performance
CREATE INDEX idx_evaluation_templates_company_id ON public.evaluation_templates(company_id);
CREATE INDEX idx_review_cycles_company_id ON public.review_cycles(company_id);
CREATE INDEX idx_performance_evaluations_company_id ON public.performance_evaluations(company_id);
CREATE INDEX idx_performance_evaluations_employee_id ON public.performance_evaluations(employee_id);
CREATE INDEX idx_development_plans_company_id ON public.development_plans(company_id);
CREATE INDEX idx_development_plans_employee_id ON public.development_plans(employee_id);

-- Triggers for updated_at
CREATE TRIGGER update_evaluation_templates_updated_at
BEFORE UPDATE ON public.evaluation_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_cycles_updated_at
BEFORE UPDATE ON public.review_cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_evaluations_updated_at
BEFORE UPDATE ON public.performance_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_development_plans_updated_at
BEFORE UPDATE ON public.development_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();