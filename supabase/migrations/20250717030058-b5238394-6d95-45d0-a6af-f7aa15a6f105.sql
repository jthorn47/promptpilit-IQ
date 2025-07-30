-- Create case management enums
CREATE TYPE public.case_type AS ENUM ('hr', 'payroll', 'compliance', 'safety', 'onboarding', 'general_support', 'technical', 'billing');
CREATE TYPE public.case_status AS ENUM ('open', 'in_progress', 'waiting', 'closed');
CREATE TYPE public.case_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.case_source AS ENUM ('email', 'manual', 'phone', 'internal', 'web_form');

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type case_type NOT NULL,
  priority case_priority NOT NULL DEFAULT 'medium',
  status case_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  related_company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  related_contact_email TEXT,
  source case_source NOT NULL DEFAULT 'manual',
  description TEXT NOT NULL,
  internal_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2) DEFAULT 0
);

-- Create time entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  duration_minutes INTEGER NOT NULL,
  billable_rate NUMERIC(8,2) NOT NULL,
  is_billable BOOLEAN DEFAULT true,
  notes TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case attachments table
CREATE TABLE public.case_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case activity logs table
CREATE TABLE public.case_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_details TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case email threads table
CREATE TABLE public.case_email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  email_subject TEXT NOT NULL,
  email_from TEXT NOT NULL,
  email_to TEXT[],
  email_cc TEXT[],
  email_body TEXT NOT NULL,
  email_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_inbound BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user billable rates table
CREATE TABLE public.user_billable_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role_type TEXT NOT NULL,
  hourly_rate NUMERIC(8,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_billable_rates ENABLE ROW LEVEL SECURITY;

-- Create policies for cases
CREATE POLICY "Users can view assigned cases" 
ON public.cases FOR SELECT 
USING (assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role) OR has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id));

CREATE POLICY "Users can create cases" 
ON public.cases FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id) OR assigned_to = auth.uid());

CREATE POLICY "Users can update assigned cases" 
ON public.cases FOR UPDATE 
USING (assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role) OR has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id));

-- Create policies for time entries
CREATE POLICY "Users can view their time entries" 
ON public.time_entries FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can create their time entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can update their time entries" 
ON public.time_entries FOR UPDATE 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create policies for attachments
CREATE POLICY "Users can view case attachments" 
ON public.case_attachments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND (c.assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))));

CREATE POLICY "Users can upload case attachments" 
ON public.case_attachments FOR INSERT 
WITH CHECK (uploaded_by = auth.uid());

-- Create policies for activity logs
CREATE POLICY "Users can view case activity logs" 
ON public.case_activity_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND (c.assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))));

CREATE POLICY "System can insert activity logs" 
ON public.case_activity_logs FOR INSERT 
WITH CHECK (true);

-- Create policies for email threads
CREATE POLICY "Users can view case emails" 
ON public.case_email_threads FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND (c.assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))));

-- Create policies for billable rates
CREATE POLICY "Admins can manage billable rates" 
ON public.user_billable_rates FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their rates" 
ON public.user_billable_rates FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX idx_cases_company_id ON public.cases(related_company_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_type ON public.cases(type);
CREATE INDEX idx_time_entries_case_id ON public.time_entries(case_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_case_activity_logs_case_id ON public.case_activity_logs(case_id);

-- Create triggers for updated_at
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log case activity
CREATE OR REPLACE FUNCTION public.log_case_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.case_activity_logs (
    case_id,
    user_id,
    action_type,
    action_details,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    CASE TG_OP
      WHEN 'INSERT' THEN 'case_created'
      WHEN 'UPDATE' THEN 'case_updated'
      WHEN 'DELETE' THEN 'case_deleted'
    END,
    CASE TG_OP
      WHEN 'INSERT' THEN 'Case created'
      WHEN 'UPDATE' THEN 'Case updated'
      WHEN 'DELETE' THEN 'Case deleted'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for case activity logging
CREATE TRIGGER log_case_activity_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.log_case_activity();

-- Function to calculate actual hours from time entries
CREATE OR REPLACE FUNCTION public.update_case_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cases 
  SET actual_hours = (
    SELECT COALESCE(SUM(duration_minutes) / 60.0, 0) 
    FROM public.time_entries 
    WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
  )
  WHERE id = COALESCE(NEW.case_id, OLD.case_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update actual hours when time entries change
CREATE TRIGGER update_case_actual_hours_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_case_actual_hours();

-- Function to prevent case closure without time entries
CREATE OR REPLACE FUNCTION public.validate_case_closure()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status is changing to closed
  IF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
    -- Check if there are any time entries for this case
    IF NOT EXISTS (SELECT 1 FROM public.time_entries WHERE case_id = NEW.id) THEN
      RAISE EXCEPTION 'Cannot close case without at least one time entry';
    END IF;
    
    -- Set closed_at timestamp
    NEW.closed_at = now();
  END IF;
  
  -- Clear closed_at if status is changed from closed to something else
  IF OLD.status = 'closed' AND NEW.status != 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for case closure validation
CREATE TRIGGER validate_case_closure_trigger
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.validate_case_closure();