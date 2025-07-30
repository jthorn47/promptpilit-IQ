-- ConnectIQ CRM Schema v3 - RLS Policies Implementation
-- Create comprehensive RLS policies for all CRM tables

-- Enable RLS on all CRM tables (they are already enabled from the previous migration)
-- Just ensuring proper RLS policies exist

-- Helper function to check if user has CRM access
CREATE OR REPLACE FUNCTION public.has_crm_access(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    AND (
      ur.role IN ('super_admin', 'company_admin', 'internal_staff') OR
      (ur.role = 'company_admin' AND ur.company_id = _company_id)
    )
  );
$$;

-- CRM Companies table RLS policies
CREATE POLICY "Users can view companies they have access to"
ON public.crm_companies FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    assigned_rep_id = auth.uid()
  )
);

CREATE POLICY "Internal staff can create companies"
ON public.crm_companies FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role)
  )
);

CREATE POLICY "Users can update companies they have access to"
ON public.crm_companies FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    assigned_rep_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    assigned_rep_id = auth.uid()
  )
);

CREATE POLICY "Super admins can delete companies"
ON public.crm_companies FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- CRM Contacts table RLS policies
CREATE POLICY "Users can view contacts for companies they have access to"
ON public.crm_contacts FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_contacts.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create contacts for companies they have access to"
ON public.crm_contacts FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_contacts.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update contacts for companies they have access to"
ON public.crm_contacts FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_contacts.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_contacts.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete contacts for companies they have access to"
ON public.crm_contacts FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_contacts.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

-- CRM Opportunities table RLS policies
CREATE POLICY "Users can view opportunities for companies they have access to"
ON public.crm_opportunities FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_opportunities.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid() OR
      crm_opportunities.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create opportunities for companies they have access to"
ON public.crm_opportunities FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_opportunities.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update opportunities they have access to"
ON public.crm_opportunities FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    assigned_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.crm_companies c
      WHERE c.id = crm_opportunities.company_id AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'internal_staff'::app_role) OR
        c.assigned_rep_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    assigned_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.crm_companies c
      WHERE c.id = crm_opportunities.company_id AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'internal_staff'::app_role) OR
        c.assigned_rep_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Admins can delete opportunities"
ON public.crm_opportunities FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

-- CRM SPIN contents table RLS policies
CREATE POLICY "Users can view SPIN contents for opportunities they have access to"
ON public.crm_spin_contents FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_opportunities o
    JOIN public.crm_companies c ON c.id = o.company_id
    WHERE o.id = crm_spin_contents.opportunity_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid() OR
      o.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage SPIN contents for opportunities they have access to"
ON public.crm_spin_contents FOR ALL
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_opportunities o
    JOIN public.crm_companies c ON c.id = o.company_id
    WHERE o.id = crm_spin_contents.opportunity_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid() OR
      o.assigned_rep_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_opportunities o
    JOIN public.crm_companies c ON c.id = o.company_id
    WHERE o.id = crm_spin_contents.opportunity_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid() OR
      o.assigned_rep_id = auth.uid()
    )
  )
);

-- CRM Risk assessments table RLS policies
CREATE POLICY "Users can view risk assessments for companies they have access to"
ON public.crm_risk_assessments FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_risk_assessments.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create risk assessments for companies they have access to"
ON public.crm_risk_assessments FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_risk_assessments.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update risk assessments for companies they have access to"
ON public.crm_risk_assessments FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_risk_assessments.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_risk_assessments.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

-- CRM Proposals table RLS policies
CREATE POLICY "Users can view proposals for companies they have access to"
ON public.crm_proposals FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_proposals.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid() OR
      crm_proposals.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can create proposals for companies they have access to"
ON public.crm_proposals FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.crm_companies c
    WHERE c.id = crm_proposals.company_id AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'internal_staff'::app_role) OR
      c.assigned_rep_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update proposals they created or have access to"
ON public.crm_proposals FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.crm_companies c
      WHERE c.id = crm_proposals.company_id AND (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'internal_staff'::app_role) OR
        c.assigned_rep_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can delete proposals"
ON public.crm_proposals FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

-- CRM Tasks table RLS policies
CREATE POLICY "Users can view tasks assigned to them or for companies they have access to"
ON public.crm_tasks FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    assigned_user_id = auth.uid() OR
    created_by = auth.uid() OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    (
      company_id IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.crm_companies c
        WHERE c.id = crm_tasks.company_id AND
        c.assigned_rep_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can create tasks"
ON public.crm_tasks FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() AND
    (has_role(auth.uid(), 'super_admin'::app_role) OR
     has_role(auth.uid(), 'internal_staff'::app_role) OR
     assigned_user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own tasks or tasks for companies they manage"
ON public.crm_tasks FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    assigned_user_id = auth.uid() OR
    created_by = auth.uid() OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    (
      company_id IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM public.crm_companies c
        WHERE c.id = crm_tasks.company_id AND
        c.assigned_rep_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own tasks or admins can delete any tasks"
ON public.crm_tasks FOR DELETE
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role)
  )
);

-- CRM Automation rules table RLS policies
CREATE POLICY "Admins can view automation rules"
ON public.crm_automation_rules FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "Admins can manage automation rules"
ON public.crm_automation_rules FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

-- CRM Activity log table RLS policies
CREATE POLICY "Users can view activity logs for entities they have access to"
ON public.crm_activity_log FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    performed_by = auth.uid() OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'internal_staff'::app_role) OR
    (
      entity_type = 'crm_companies' AND 
      EXISTS (
        SELECT 1 FROM public.crm_companies c
        WHERE c.id = crm_activity_log.entity_id AND
        c.assigned_rep_id = auth.uid()
      )
    ) OR
    (
      entity_type = 'crm_contacts' AND 
      EXISTS (
        SELECT 1 FROM public.crm_contacts ct
        JOIN public.crm_companies c ON c.id = ct.company_id
        WHERE ct.id = crm_activity_log.entity_id AND
        c.assigned_rep_id = auth.uid()
      )
    ) OR
    (
      entity_type = 'crm_opportunities' AND 
      EXISTS (
        SELECT 1 FROM public.crm_opportunities o
        JOIN public.crm_companies c ON c.id = o.company_id
        WHERE o.id = crm_activity_log.entity_id AND (
          c.assigned_rep_id = auth.uid() OR
          o.assigned_rep_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "System can insert activity logs"
ON public.crm_activity_log FOR INSERT
WITH CHECK (true);

-- Enable RLS on any remaining tables that might not have it
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_spin_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activity_log ENABLE ROW LEVEL SECURITY;

-- Create helper view for CRM metrics
CREATE OR REPLACE VIEW public.crm_metrics AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.status as company_status,
  c.type as company_type,
  c.assigned_rep_id,
  COUNT(DISTINCT ct.id) as total_contacts,
  COUNT(DISTINCT o.id) as total_opportunities,
  COUNT(DISTINCT CASE WHEN o.stage = 'won' THEN o.id END) as won_opportunities,
  COUNT(DISTINCT CASE WHEN o.stage = 'lost' THEN o.id END) as lost_opportunities,
  COALESCE(SUM(CASE WHEN o.stage = 'won' THEN o.deal_value END), 0) as total_won_value,
  COALESCE(SUM(CASE WHEN o.stage NOT IN ('won', 'lost') THEN o.deal_value END), 0) as pipeline_value,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT ra.id) as total_assessments,
  AVG(ra.score) as avg_risk_score
FROM public.crm_companies c
LEFT JOIN public.crm_contacts ct ON ct.company_id = c.id
LEFT JOIN public.crm_opportunities o ON o.company_id = c.id
LEFT JOIN public.crm_tasks t ON t.company_id = c.id
LEFT JOIN public.crm_risk_assessments ra ON ra.company_id = c.id
GROUP BY c.id, c.name, c.status, c.type, c.assigned_rep_id;

-- Grant access to the metrics view
GRANT SELECT ON public.crm_metrics TO authenticated;