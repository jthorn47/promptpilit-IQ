-- Add case_id column to tasks table to link tasks to cases
ALTER TABLE public.tasks ADD COLUMN case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);

-- Add RLS policies for case-linked tasks
CREATE POLICY "Users can view tasks for their company cases" ON public.tasks
FOR SELECT USING (
  case_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = tasks.case_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role) OR
      c.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Users can create tasks for their company cases" ON public.tasks
FOR INSERT WITH CHECK (
  case_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = tasks.case_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role) OR
      c.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Users can update tasks for their company cases" ON public.tasks
FOR UPDATE USING (
  case_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = tasks.case_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role) OR
      c.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete tasks for their company cases" ON public.tasks
FOR DELETE USING (
  case_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = tasks.case_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role) OR
      c.assigned_to = auth.uid()
    )
  )
);