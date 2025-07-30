-- Create SCORM progress tracking table
CREATE TABLE public.scorm_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  assignment_id UUID NOT NULL,
  completion_status TEXT NOT NULL DEFAULT 'incomplete',
  score_percentage NUMERIC DEFAULT NULL,
  session_time INTERVAL DEFAULT NULL,
  suspend_data TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Ensure one progress record per employee/scene/assignment combination
  UNIQUE(employee_id, scene_id, assignment_id)
);

-- Enable RLS
ALTER TABLE public.scorm_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can view their SCORM progress"
ON public.scorm_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = scorm_progress.employee_id 
    AND (
      e.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Company users can manage their SCORM progress"
ON public.scorm_progress 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = scorm_progress.employee_id 
    AND (
      e.company_id = get_user_company_id(auth.uid()) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_scorm_progress_updated_at
BEFORE UPDATE ON public.scorm_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();