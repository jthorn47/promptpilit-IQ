-- Create enum types for the PEO onboarding system
CREATE TYPE peo_setup_type AS ENUM ('peo', 'aso', 'lms', 'payroll_only');
CREATE TYPE onboarding_role AS ENUM ('client_admin', 'onboarding_manager');
CREATE TYPE section_status AS ENUM ('not_started', 'in_progress', 'completed', 'locked', 'requires_approval');
CREATE TYPE time_collection_method AS ENUM ('web', 'mobile', 'swipe_clock', 'manual', 'biometric');

-- Main onboarding sessions table
CREATE TABLE public.peo_onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_onboarding_manager UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Session metadata
  session_name TEXT NOT NULL,
  setup_type peo_setup_type NOT NULL DEFAULT 'peo',
  current_section INTEGER DEFAULT 1,
  overall_progress DECIMAL(5,2) DEFAULT 0.00,
  
  -- Status and timestamps
  status section_status DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  go_live_date DATE,
  
  -- Configuration
  template_id UUID, -- For cloning from templates
  is_template BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Section progress tracking
CREATE TABLE public.peo_onboarding_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  section_number INTEGER NOT NULL,
  section_name TEXT NOT NULL,
  status section_status DEFAULT 'not_started',
  progress DECIMAL(5,2) DEFAULT 0.00,
  
  -- Section-specific data storage
  section_data JSONB DEFAULT '{}',
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Locking mechanism
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  lock_reason TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(session_id, section_number)
);

-- Document uploads for onboarding
CREATE TABLE public.peo_onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.peo_onboarding_sections(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL, -- 'ach_authorization', 'voided_check', 'payroll_history', etc.
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Document metadata
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employee assignments during onboarding
CREATE TABLE public.peo_onboarding_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  -- Employee info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Job assignment
  pay_type TEXT,
  job_category TEXT,
  department TEXT,
  default_schedule_id UUID,
  
  -- Onboarding status
  invite_sent BOOLEAN DEFAULT false,
  invite_sent_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Historical data
  ytd_gross DECIMAL(10,2) DEFAULT 0,
  ytd_taxes DECIMAL(10,2) DEFAULT 0,
  ytd_deductions DECIMAL(10,2) DEFAULT 0,
  prior_payroll_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll schedules configuration
CREATE TABLE public.peo_payroll_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
  
  -- Schedule configuration
  pay_dates JSONB NOT NULL, -- Array of dates or rules
  holidays JSONB DEFAULT '[]', -- Array of holiday dates
  
  -- Processing settings
  cutoff_days INTEGER DEFAULT 2,
  approval_deadline_days INTEGER DEFAULT 1,
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Banking and ACH information
CREATE TABLE public.peo_banking_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  -- Bank details (encrypted)
  bank_name TEXT NOT NULL,
  routing_number_encrypted TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'checking', 'savings'
  
  -- Verification
  voided_check_document_id UUID REFERENCES public.peo_onboarding_documents(id),
  ach_authorization_signed BOOLEAN DEFAULT false,
  ach_authorization_document_id UUID REFERENCES public.peo_onboarding_documents(id),
  
  -- Validation status
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- '2_step_validation', 'micro_deposits'
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  
  -- Usage tracking
  is_locked_for_payroll BOOLEAN DEFAULT false,
  first_payroll_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Time and attendance configuration
CREATE TABLE public.peo_time_attendance_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  -- Collection method
  collection_method time_collection_method NOT NULL,
  
  -- Overtime rules
  overtime_rules JSONB DEFAULT '{}', -- {daily_threshold: 8, weekly_threshold: 40, etc.}
  break_rules JSONB DEFAULT '{}',
  rounding_rules JSONB DEFAULT '{}',
  
  -- PTO configuration
  pto_accrual_rules JSONB DEFAULT '{}',
  vacation_accrual_rules JSONB DEFAULT '{}',
  sick_accrual_rules JSONB DEFAULT '{}',
  
  -- Approvers
  time_approvers UUID[] DEFAULT '{}',
  
  -- Testing
  test_completed BOOLEAN DEFAULT false,
  test_completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Message center for onboarding questions
CREATE TABLE public.peo_onboarding_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.peo_onboarding_sections(id) ON DELETE CASCADE,
  
  -- Message details
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Threading
  parent_message_id UUID REFERENCES public.peo_onboarding_messages(id) ON DELETE SET NULL,
  thread_id UUID, -- For grouping related messages
  
  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Sender/recipient
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_to_role onboarding_role,
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll testing records
CREATE TABLE public.peo_payroll_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.peo_onboarding_sessions(id) ON DELETE CASCADE,
  
  test_type TEXT NOT NULL, -- 'sample', 'parallel'
  test_date DATE NOT NULL,
  
  -- Test data
  test_employees JSONB NOT NULL, -- Array of test employee data
  test_results JSONB DEFAULT '{}',
  
  -- Approval
  approved_by_client BOOLEAN DEFAULT false,
  client_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_approved_at TIMESTAMPTZ,
  
  approved_by_manager BOOLEAN DEFAULT false,
  manager_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_approved_at TIMESTAMPTZ,
  
  -- Notes
  client_notes TEXT,
  manager_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.peo_onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_onboarding_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_onboarding_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_payroll_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_banking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_time_attendance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_onboarding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peo_payroll_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Onboarding sessions
CREATE POLICY "Company admins and onboarding managers can view sessions"
ON public.peo_onboarding_sessions FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  assigned_onboarding_manager = auth.uid() OR
  created_by = auth.uid()
);

CREATE POLICY "Company admins and onboarding managers can manage sessions"
ON public.peo_onboarding_sessions FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  assigned_onboarding_manager = auth.uid() OR
  created_by = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
  assigned_onboarding_manager = auth.uid() OR
  created_by = auth.uid()
);

-- Sections (inherit from session permissions)
CREATE POLICY "Session participants can view sections"
ON public.peo_onboarding_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage sections"
ON public.peo_onboarding_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

-- Apply similar policies to all other tables
CREATE POLICY "Session participants can manage documents"
ON public.peo_onboarding_documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage employees"
ON public.peo_onboarding_employees FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage schedules"
ON public.peo_payroll_schedules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage banking info"
ON public.peo_banking_info FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage time attendance config"
ON public.peo_time_attendance_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage messages"
ON public.peo_onboarding_messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Session participants can manage payroll tests"
ON public.peo_payroll_tests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.peo_onboarding_sessions s
    WHERE s.id = session_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, s.company_id) OR
      s.assigned_onboarding_manager = auth.uid() OR
      s.created_by = auth.uid()
    )
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_peo_onboarding_sessions_updated_at
  BEFORE UPDATE ON public.peo_onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_onboarding_sections_updated_at
  BEFORE UPDATE ON public.peo_onboarding_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_onboarding_employees_updated_at
  BEFORE UPDATE ON public.peo_onboarding_employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_payroll_schedules_updated_at
  BEFORE UPDATE ON public.peo_payroll_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_banking_info_updated_at
  BEFORE UPDATE ON public.peo_banking_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_time_attendance_config_updated_at
  BEFORE UPDATE ON public.peo_time_attendance_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_onboarding_messages_updated_at
  BEFORE UPDATE ON public.peo_onboarding_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peo_payroll_tests_updated_at
  BEFORE UPDATE ON public.peo_payroll_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default section templates
INSERT INTO public.peo_onboarding_sessions (
  id,
  company_id,
  session_name,
  setup_type,
  is_template,
  created_by
) VALUES (
  gen_random_uuid(),
  NULL,
  'Default PEO Onboarding Template',
  'peo',
  true,
  NULL
);

-- Get the template ID for section creation
DO $$
DECLARE
  template_id UUID;
BEGIN
  SELECT id INTO template_id FROM public.peo_onboarding_sessions WHERE is_template = true LIMIT 1;
  
  -- Insert default sections
  INSERT INTO public.peo_onboarding_sections (session_id, section_number, section_name, requires_approval) VALUES
  (template_id, 1, 'Company & Legal Setup', false),
  (template_id, 2, 'Employee Setup & Job Type Assignment', true),
  (template_id, 3, 'Historical Payroll & Deductions', true),
  (template_id, 4, 'Payroll Schedule & Custom Docs', true),
  (template_id, 5, 'Workers Comp & Payroll Banking', true),
  (template_id, 6, 'Time & Attendance Configuration', true),
  (template_id, 7, 'Payroll Testing & Go-Live', true);
END $$;