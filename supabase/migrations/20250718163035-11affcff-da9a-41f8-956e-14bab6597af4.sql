-- Create missing tables for Pulse CMS integration

-- Email case links table
CREATE TABLE public.email_case_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(email_id, case_id)
);

-- Case notes table
CREATE TABLE public.case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case tasks table
CREATE TABLE public.case_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_case_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_case_links
CREATE POLICY "Users can manage their email case links" ON public.email_case_links
  FOR ALL USING (auth.uid() = created_by OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for case_notes
CREATE POLICY "Users can view case notes for assigned cases" ON public.case_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_notes.case_id 
      AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Users can create case notes for assigned cases" ON public.case_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_notes.case_id 
      AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- RLS policies for case_tasks  
CREATE POLICY "Users can view case tasks for assigned cases" ON public.case_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_tasks.case_id 
      AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Users can create case tasks for assigned cases" ON public.case_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_tasks.case_id 
      AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Users can update case tasks for assigned cases" ON public.case_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_tasks.case_id 
      AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- Create indexes for performance
CREATE INDEX idx_email_case_links_email_id ON public.email_case_links(email_id);
CREATE INDEX idx_email_case_links_case_id ON public.email_case_links(case_id);
CREATE INDEX idx_case_notes_case_id ON public.case_notes(case_id);
CREATE INDEX idx_case_notes_created_at ON public.case_notes(created_at);
CREATE INDEX idx_case_tasks_case_id ON public.case_tasks(case_id);
CREATE INDEX idx_case_tasks_assigned_to ON public.case_tasks(assigned_to);
CREATE INDEX idx_case_tasks_status ON public.case_tasks(status);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_case_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_case_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_notes_updated_at
    BEFORE UPDATE ON public.case_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_case_notes_updated_at();

CREATE TRIGGER update_case_tasks_updated_at
    BEFORE UPDATE ON public.case_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_case_tasks_updated_at();