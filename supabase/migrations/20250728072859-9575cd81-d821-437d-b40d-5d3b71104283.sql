-- Create case templates table
CREATE TABLE public.case_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_duration_days INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  company_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create case template steps table
CREATE TABLE public.case_template_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_template_id UUID NOT NULL REFERENCES public.case_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_role TEXT,
  due_days INTEGER NOT NULL DEFAULT 1,
  required_fields JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_template_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for case_templates
CREATE POLICY "Company admins can manage their case templates"
ON public.case_templates
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  company_id IS NULL
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  company_id IS NULL
);

-- Create policies for case_template_steps
CREATE POLICY "Company admins can manage case template steps"
ON public.case_template_steps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.case_templates ct
    WHERE ct.id = case_template_steps.case_template_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, ct.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role) OR
      ct.company_id IS NULL
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.case_templates ct
    WHERE ct.id = case_template_steps.case_template_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, ct.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role) OR
      ct.company_id IS NULL
    )
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_case_templates_updated_at
  BEFORE UPDATE ON public.case_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_template_steps_updated_at
  BEFORE UPDATE ON public.case_template_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint for step order within template
CREATE UNIQUE INDEX case_template_steps_order_unique 
ON public.case_template_steps(case_template_id, step_order);

-- Insert default templates
INSERT INTO public.case_templates (name, category, estimated_duration_days, description, company_id) VALUES
('Harassment Investigation', 'HR', 14, 'Complete workflow for handling harassment complaints including documentation, interviews, and resolution', NULL),
('ADA Accommodation Request', 'Compliance', 10, 'Step-by-step process for evaluating and implementing reasonable accommodations', NULL),
('Disciplinary Action', 'HR', 7, 'Progressive discipline workflow with proper documentation and due process', NULL),
('Workplace Investigation', 'Legal', 21, 'General investigation template for policy violations and misconduct', NULL);

-- Insert default template steps for Harassment Investigation
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields) VALUES
((SELECT id FROM public.case_templates WHERE name = 'Harassment Investigation'), 1, 'Initial Complaint Intake', 'Document initial complaint, time/date, and employee involved.', 'HR Manager', 1, '["Employee Name", "Date of Incident", "Initial Statement"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'Harassment Investigation'), 2, 'Preliminary Review', 'Assess complaint for credibility and need for full investigation.', 'Compliance Officer', 2, '["Summary of Review", "Decision Notes"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'Harassment Investigation'), 3, 'Witness Interviews', 'Interview any witnesses and log their statements.', 'HR Specialist', 5, '["Witness Name", "Interview Notes", "Date"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'Harassment Investigation'), 4, 'Final Report and Decision', 'Compile all findings, reach conclusion, and notify parties.', 'HR Manager', 3, '["Final Report", "Corrective Actions", "Communication Notes"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'Harassment Investigation'), 5, 'Follow-Up and Closure', 'Ensure any actions are completed and file is archived.', 'Case Owner', 3, '["Follow-Up Notes", "Date Closed"]'::jsonb);

-- Insert steps for other templates
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields) VALUES
((SELECT id FROM public.case_templates WHERE name = 'ADA Accommodation Request'), 1, 'Request Intake', 'Document accommodation request and employee information.', 'HR Manager', 1, '["Employee Name", "Requested Accommodation", "Medical Documentation"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'ADA Accommodation Request'), 2, 'Interactive Process', 'Engage in interactive dialogue to identify effective accommodations.', 'HR Specialist', 3, '["Meeting Notes", "Alternative Options Discussed"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'ADA Accommodation Request'), 3, 'Feasibility Assessment', 'Evaluate undue hardship and effectiveness of proposed accommodations.', 'Compliance Officer', 3, '["Cost Analysis", "Impact Assessment"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'ADA Accommodation Request'), 4, 'Implementation', 'Implement approved accommodation and monitor effectiveness.', 'HR Manager', 2, '["Implementation Plan", "Monitoring Schedule"]'::jsonb),
((SELECT id FROM public.case_templates WHERE name = 'ADA Accommodation Request'), 5, 'Follow-Up Review', 'Review accommodation effectiveness and make adjustments.', 'HR Specialist', 1, '["Effectiveness Review", "Adjustment Notes"]'::jsonb);