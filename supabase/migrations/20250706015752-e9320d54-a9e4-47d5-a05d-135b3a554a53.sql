-- Update remaining CRM-related policies to use domain-restricted access

-- Update analytics_reports table policies
DROP POLICY IF EXISTS "Sales reps can manage analytics reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Sales reps can view analytics reports" ON public.analytics_reports;

CREATE POLICY "Easeworks sales reps can manage analytics reports" 
ON public.analytics_reports 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update automation_workflows table policies
DROP POLICY IF EXISTS "Sales reps manage automation workflows" ON public.automation_workflows;

CREATE POLICY "Easeworks sales reps manage automation workflows" 
ON public.automation_workflows 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update automation_executions table policies
DROP POLICY IF EXISTS "View automation executions" ON public.automation_executions;

CREATE POLICY "Easeworks users view automation executions" 
ON public.automation_executions 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update performance_targets table policies
DROP POLICY IF EXISTS "Sales reps can manage performance targets" ON public.performance_targets;
DROP POLICY IF EXISTS "Sales reps can view performance targets" ON public.performance_targets;

CREATE POLICY "Easeworks sales reps can manage performance targets" 
ON public.performance_targets 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update activity_templates table policies  
DROP POLICY IF EXISTS "Sales reps can manage activity templates" ON public.activity_templates;

CREATE POLICY "Easeworks sales reps can manage activity templates" 
ON public.activity_templates 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_workflow_executions table policies
DROP POLICY IF EXISTS "Sales reps can view workflow executions" ON public.email_workflow_executions;

CREATE POLICY "Easeworks sales reps can view workflow executions" 
ON public.email_workflow_executions 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_workflow_steps table policies
DROP POLICY IF EXISTS "Sales reps can manage workflow steps" ON public.email_workflow_steps;

CREATE POLICY "Easeworks sales reps can manage workflow steps" 
ON public.email_workflow_steps 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_workflows table policies
DROP POLICY IF EXISTS "Sales reps can manage email workflows" ON public.email_workflows;

CREATE POLICY "Easeworks sales reps can manage email workflows" 
ON public.email_workflows 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update import_jobs table policies
DROP POLICY IF EXISTS "Sales reps manage imports" ON public.import_jobs;

CREATE POLICY "Easeworks sales reps manage imports" 
ON public.import_jobs 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));