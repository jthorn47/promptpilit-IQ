
-- Create cases table with proper structure
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'payroll', 'benefits', 'hr', 'technical')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMP WITH TIME ZONE,
  company_id UUID,
  estimated_hours INTEGER DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  client_viewable BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'internal',
  tags TEXT[] DEFAULT '{}',
  external_reference TEXT,
  assigned_team TEXT,
  related_company_id UUID,
  related_contact_email TEXT,
  source TEXT DEFAULT 'internal'
);

-- Create case_files table for attachments
CREATE TABLE public.case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create case_sla_configs table
CREATE TABLE public.case_sla_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  escalation_time_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create case_activities table for audit trail
CREATE TABLE public.case_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'email', 'file', 'status_change', 'assignment_change')),
  content TEXT,
  action TEXT NOT NULL,
  actor UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create time_entries table for time tracking
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases
CREATE POLICY "Users can view cases they are assigned to or created"
ON public.cases FOR SELECT
USING (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Users can create cases"
ON public.cases FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "Users can update cases they have access to"
ON public.cases FOR UPDATE
USING (
  assigned_to = auth.uid() OR 
  created_by = auth.uid() OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- Create RLS policies for case_files
CREATE POLICY "Users can view files for cases they have access to"
ON public.case_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_files.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can upload files to cases they have access to"
ON public.case_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_files.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

-- Create RLS policies for case_sla_configs
CREATE POLICY "Admins can manage SLA configs"
ON public.case_sla_configs FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- Create RLS policies for case_activities
CREATE POLICY "Users can view activities for cases they have access to"
ON public.case_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_activities.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Users can create activities for cases they have access to"
ON public.case_activities FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_activities.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

-- Create RLS policies for time_entries
CREATE POLICY "Users can view their own time entries"
ON public.time_entries FOR SELECT
USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Users can create their own time entries"
ON public.time_entries FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
ON public.time_entries FOR UPDATE
USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX idx_cases_created_by ON public.cases(created_by);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_priority ON public.cases(priority);
CREATE INDEX idx_cases_created_at ON public.cases(created_at);
CREATE INDEX idx_case_files_case_id ON public.case_files(case_id);
CREATE INDEX idx_case_activities_case_id ON public.case_activities(case_id);
CREATE INDEX idx_time_entries_case_id ON public.time_entries(case_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cases_updated_at();

CREATE TRIGGER update_case_sla_configs_updated_at
    BEFORE UPDATE ON public.case_sla_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
