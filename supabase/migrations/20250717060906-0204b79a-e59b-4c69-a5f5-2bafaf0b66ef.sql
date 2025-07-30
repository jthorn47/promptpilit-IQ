-- Create employee portal tables for HALOself

-- Employee profiles and preferences
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_name TEXT,
  profile_photo_url TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  session_timeout_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id),
  UNIQUE(user_id)
);

-- Employee pay stubs and payroll history
CREATE TABLE IF NOT EXISTS public.employee_pay_stubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_period_id UUID REFERENCES public.payroll_periods(id),
  pay_date DATE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  gross_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_taxes DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  earnings_breakdown JSONB DEFAULT '{}'::jsonb,
  tax_breakdown JSONB DEFAULT '{}'::jsonb,
  deduction_breakdown JSONB DEFAULT '{}'::jsonb,
  hours_breakdown JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('draft', 'generated', 'issued', 'corrected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee tax documents center
CREATE TABLE IF NOT EXISTS public.employee_tax_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('w2', '1099', '941', 'de9', 'w4', 'other')),
  tax_year INTEGER NOT NULL,
  document_url TEXT NOT NULL,
  document_status TEXT DEFAULT 'available' CHECK (document_status IN ('pending', 'available', 'corrected', 'voided')),
  available_date DATE,
  correction_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee direct deposit settings
CREATE TABLE IF NOT EXISTS public.employee_direct_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  account_nickname TEXT NOT NULL,
  bank_name TEXT,
  routing_number TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
  allocation_type TEXT DEFAULT 'percentage' CHECK (allocation_type IN ('percentage', 'amount', 'remainder')),
  allocation_value DECIMAL(10,2),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_amounts DECIMAL(5,2)[] DEFAULT NULL,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee smart alerts and inbox
CREATE TABLE IF NOT EXISTS public.employee_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('payroll', 'tax', 'benefits', 'system', 'halo_insight')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee AI copilot conversations
CREATE TABLE IF NOT EXISTS public.employee_copilot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.95,
  sources JSONB DEFAULT '[]'::jsonb,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee pay calendar and notifications
CREATE TABLE IF NOT EXISTS public.employee_pay_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_period_id UUID REFERENCES public.payroll_periods(id),
  pay_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'approved', 'processed', 'paid')),
  hours_submitted BOOLEAN DEFAULT false,
  hours_approved BOOLEAN DEFAULT false,
  timecard_deadline TIMESTAMP WITH TIME ZONE,
  payroll_deadline TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_id ON public.employee_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON public.employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_pay_stubs_employee_id ON public.employee_pay_stubs(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_pay_stubs_pay_date ON public.employee_pay_stubs(pay_date DESC);
CREATE INDEX IF NOT EXISTS idx_employee_tax_documents_employee_id ON public.employee_tax_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_tax_documents_tax_year ON public.employee_tax_documents(tax_year DESC);
CREATE INDEX IF NOT EXISTS idx_employee_direct_deposits_employee_id ON public.employee_direct_deposits(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_alerts_employee_id ON public.employee_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_alerts_created_at ON public.employee_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_copilot_employee_id ON public.employee_copilot_conversations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_pay_calendar_employee_id ON public.employee_pay_calendar(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_pay_calendar_pay_date ON public.employee_pay_calendar(pay_date DESC);

-- Enable RLS on all tables
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_pay_stubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_direct_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_pay_calendar ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employee self-service access
CREATE POLICY "Employees can view and update their own profile"
ON public.employee_profiles
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employees can view their own pay stubs"
ON public.employee_pay_stubs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_pay_stubs.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage all pay stubs"
ON public.employee_pay_stubs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.company_settings cs ON e.company_id = cs.id
    WHERE e.id = employee_pay_stubs.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "Employees can view their own tax documents"
ON public.employee_tax_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_tax_documents.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage all tax documents"
ON public.employee_tax_documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.company_settings cs ON e.company_id = cs.id
    WHERE e.id = employee_tax_documents.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "Employees can manage their own direct deposit settings"
ON public.employee_direct_deposits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_direct_deposits.employee_id
    AND ep.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_direct_deposits.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can view and update their own alerts"
ON public.employee_alerts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_alerts.employee_id
    AND ep.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_alerts.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert alerts for employees"
ON public.employee_alerts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Employees can view their own copilot conversations"
ON public.employee_copilot_conversations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_copilot_conversations.employee_id
    AND ep.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_copilot_conversations.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can view their own pay calendar"
ON public.employee_pay_calendar
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.employee_id = employee_pay_calendar.employee_id
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage employee pay calendar"
ON public.employee_pay_calendar
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.company_settings cs ON e.company_id = cs.id
    WHERE e.id = employee_pay_calendar.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_employee_portal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_profiles_updated_at
    BEFORE UPDATE ON public.employee_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();

CREATE TRIGGER update_employee_pay_stubs_updated_at
    BEFORE UPDATE ON public.employee_pay_stubs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();

CREATE TRIGGER update_employee_tax_documents_updated_at
    BEFORE UPDATE ON public.employee_tax_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();

CREATE TRIGGER update_employee_direct_deposits_updated_at
    BEFORE UPDATE ON public.employee_direct_deposits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();

CREATE TRIGGER update_employee_alerts_updated_at
    BEFORE UPDATE ON public.employee_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();

CREATE TRIGGER update_employee_pay_calendar_updated_at
    BEFORE UPDATE ON public.employee_pay_calendar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_employee_portal_updated_at();