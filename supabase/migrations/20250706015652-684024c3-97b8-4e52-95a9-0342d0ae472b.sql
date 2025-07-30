-- Update RLS policies for CRM tables to use domain-restricted access

-- Update leads table policies
DROP POLICY IF EXISTS "Sales reps can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Sales reps can view all leads" ON public.leads;

CREATE POLICY "Easeworks sales reps can manage leads" 
ON public.leads 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update deals table policies  
DROP POLICY IF EXISTS "Sales reps can manage deals" ON public.deals;
DROP POLICY IF EXISTS "Sales reps can view all deals" ON public.deals;

CREATE POLICY "Easeworks sales reps can manage deals" 
ON public.deals 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update activities table policies
DROP POLICY IF EXISTS "Sales reps can manage activities" ON public.activities;
DROP POLICY IF EXISTS "Sales reps can view all activities" ON public.activities;

CREATE POLICY "Easeworks sales reps can manage activities" 
ON public.activities 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update deal_activities table policies
DROP POLICY IF EXISTS "Sales reps can manage deal activities" ON public.deal_activities;
DROP POLICY IF EXISTS "Sales reps can view deal activities" ON public.deal_activities;

CREATE POLICY "Easeworks sales reps can manage deal activities" 
ON public.deal_activities 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_campaigns table policies
DROP POLICY IF EXISTS "Sales reps can manage email campaigns" ON public.email_campaigns;

CREATE POLICY "Easeworks sales reps can manage email campaigns" 
ON public.email_campaigns 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_templates table policies
DROP POLICY IF EXISTS "Sales reps can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Sales reps can view all email templates" ON public.email_templates;

CREATE POLICY "Easeworks sales reps can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update email_campaign_recipients table policies
DROP POLICY IF EXISTS "Sales reps can manage campaign recipients" ON public.email_campaign_recipients;

CREATE POLICY "Easeworks sales reps can manage campaign recipients" 
ON public.email_campaign_recipients 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));