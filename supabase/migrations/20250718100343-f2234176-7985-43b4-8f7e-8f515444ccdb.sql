-- Enhance cases table for Pulse CMS Phase 1
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('internal', 'client_viewable')),
ADD COLUMN IF NOT EXISTS assigned_team TEXT,
ADD COLUMN IF NOT EXISTS external_reference TEXT,
ADD COLUMN IF NOT EXISTS client_viewable BOOLEAN DEFAULT false;

-- Update case_type enum to include Benefits
ALTER TYPE case_type ADD VALUE IF NOT EXISTS 'benefits';

-- Create case_activities table for timeline
CREATE TABLE IF NOT EXISTS public.case_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'email', 'file', 'status_change', 'assignment_change')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_attachments table
CREATE TABLE IF NOT EXISTS public.case_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_activities_case_id ON public.case_activities(case_id);
CREATE INDEX IF NOT EXISTS idx_case_activities_created_at ON public.case_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON public.case_files(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_tags ON public.cases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_cases_visibility ON public.cases(visibility);

-- Enable RLS on new tables
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for case_activities
CREATE POLICY "Users can view case activities if they can view the case"
ON public.case_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_activities.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id)
    )
  )
);

CREATE POLICY "Users can create activities for their cases"
ON public.case_activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_activities.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id)
    )
  )
);

-- RLS policies for case_files  
CREATE POLICY "Users can view case files if they can view the case"
ON public.case_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_files.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id)
    )
  )
);

CREATE POLICY "Users can upload files to their cases"
ON public.case_files
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_files.case_id 
    AND (
      c.assigned_to = auth.uid() OR 
      c.created_by = auth.uid() OR
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id)
    )
  )
);

-- Function to automatically create activity when case is updated
CREATE OR REPLACE FUNCTION public.log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.case_activities (case_id, activity_type, content, created_by)
    VALUES (NEW.id, 'status_change', 
           'Status changed from ' || OLD.status || ' to ' || NEW.status,
           auth.uid());
  END IF;
  
  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.case_activities (case_id, activity_type, content, created_by)
    VALUES (NEW.id, 'assignment_change',
           'Case reassigned',
           auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;