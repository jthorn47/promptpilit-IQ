-- Create RLS policies for all CRM tables

-- CRM Companies policies
CREATE POLICY "Users can view companies they have access to" 
ON public.crm_companies 
FOR SELECT 
USING (has_crm_access(auth.uid(), id));

CREATE POLICY "Company admins can insert companies" 
ON public.crm_companies 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can update companies" 
ON public.crm_companies 
FOR UPDATE 
USING (has_crm_access(auth.uid(), id))
WITH CHECK (has_crm_access(auth.uid(), id));

CREATE POLICY "Company admins can delete companies" 
ON public.crm_companies 
FOR DELETE 
USING (has_crm_access(auth.uid(), id));

-- CRM Contacts policies
CREATE POLICY "Users can view contacts from companies they have access to" 
ON public.crm_contacts 
FOR SELECT 
USING (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can insert contacts for companies they have access to" 
ON public.crm_contacts 
FOR INSERT 
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can update contacts for companies they have access to" 
ON public.crm_contacts 
FOR UPDATE 
USING (has_crm_access(auth.uid(), company_id))
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can delete contacts for companies they have access to" 
ON public.crm_contacts 
FOR DELETE 
USING (has_crm_access(auth.uid(), company_id));

-- CRM Opportunities policies
CREATE POLICY "Users can view opportunities from companies they have access to" 
ON public.crm_opportunities 
FOR SELECT 
USING (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can insert opportunities for companies they have access to" 
ON public.crm_opportunities 
FOR INSERT 
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can update opportunities for companies they have access to" 
ON public.crm_opportunities 
FOR UPDATE 
USING (has_crm_access(auth.uid(), company_id))
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can delete opportunities for companies they have access to" 
ON public.crm_opportunities 
FOR DELETE 
USING (has_crm_access(auth.uid(), company_id));

-- CRM SPIN Contents policies
CREATE POLICY "Users can view SPIN contents from opportunities they have access to" 
ON public.crm_spin_contents 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_spin_contents.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can insert SPIN contents for opportunities they have access to" 
ON public.crm_spin_contents 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_spin_contents.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can update SPIN contents for opportunities they have access to" 
ON public.crm_spin_contents 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_spin_contents.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_spin_contents.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can delete SPIN contents for opportunities they have access to" 
ON public.crm_spin_contents 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_spin_contents.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

-- CRM Risk Assessments policies
CREATE POLICY "Users can view risk assessments from companies they have access to" 
ON public.crm_risk_assessments 
FOR SELECT 
USING (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can insert risk assessments for companies they have access to" 
ON public.crm_risk_assessments 
FOR INSERT 
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can update risk assessments for companies they have access to" 
ON public.crm_risk_assessments 
FOR UPDATE 
USING (has_crm_access(auth.uid(), company_id))
WITH CHECK (has_crm_access(auth.uid(), company_id));

CREATE POLICY "Users can delete risk assessments for companies they have access to" 
ON public.crm_risk_assessments 
FOR DELETE 
USING (has_crm_access(auth.uid(), company_id));

-- CRM Proposals policies
CREATE POLICY "Users can view proposals from opportunities they have access to" 
ON public.crm_proposals 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_proposals.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can insert proposals for opportunities they have access to" 
ON public.crm_proposals 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_proposals.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can update proposals for opportunities they have access to" 
ON public.crm_proposals 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_proposals.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_proposals.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

CREATE POLICY "Users can delete proposals for opportunities they have access to" 
ON public.crm_proposals 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.crm_opportunities o 
    WHERE o.id = crm_proposals.opportunity_id 
    AND has_crm_access(auth.uid(), o.company_id)
));

-- CRM Tasks policies
CREATE POLICY "Users can view tasks they created or are assigned to" 
ON public.crm_tasks 
FOR SELECT 
USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can insert tasks" 
ON public.crm_tasks 
FOR INSERT 
WITH CHECK (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can update tasks they created or are assigned to" 
ON public.crm_tasks 
FOR UPDATE 
USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can delete tasks they created" 
ON public.crm_tasks 
FOR DELETE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- CRM Automation Rules policies
CREATE POLICY "Company admins can manage automation rules" 
ON public.crm_automation_rules 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- CRM Activity Log policies
CREATE POLICY "Users can view activity logs for companies they have access to" 
ON public.crm_activity_log 
FOR SELECT 
USING (
    CASE 
        WHEN entity_type = 'crm_companies' THEN has_crm_access(auth.uid(), entity_id)
        WHEN entity_type = 'crm_contacts' THEN EXISTS (
            SELECT 1 FROM public.crm_contacts c 
            WHERE c.id = crm_activity_log.entity_id 
            AND has_crm_access(auth.uid(), c.company_id)
        )
        WHEN entity_type = 'crm_opportunities' THEN EXISTS (
            SELECT 1 FROM public.crm_opportunities o 
            WHERE o.id = crm_activity_log.entity_id 
            AND has_crm_access(auth.uid(), o.company_id)
        )
        ELSE performed_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role)
    END
);

CREATE POLICY "System can insert activity logs" 
ON public.crm_activity_log 
FOR INSERT 
WITH CHECK (true);