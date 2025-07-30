-- PropGEN Integration Trigger System Schema

-- Add PropGEN workflow fields to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN propgen_status text DEFAULT 'not_started' CHECK (propgen_status IN ('not_started', 'risk_assessment_pending', 'risk_assessment_completed', 'spin_generated', 'investment_analysis_completed', 'proposal_drafted', 'proposal_pending_approval', 'proposal_approved', 'proposal_sent')),
ADD COLUMN current_risk_score integer,
ADD COLUMN last_assessment_date date,
ADD COLUMN propgen_updated_at timestamp with time zone DEFAULT now();

-- Create PropGEN workflow state table
CREATE TABLE public.propgen_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  workflow_status text NOT NULL DEFAULT 'not_started',
  risk_assessment_id UUID REFERENCES public.company_hr_assessments(id),
  spin_content_status text DEFAULT 'not_generated' CHECK (spin_content_status IN ('not_generated', 'generating', 'draft_generated', 'final')),
  spin_content jsonb DEFAULT '{}',
  investment_analysis_data jsonb DEFAULT '{}',
  investment_analysis_status text DEFAULT 'not_started' CHECK (investment_analysis_status IN ('not_started', 'draft', 'completed')),
  proposal_data jsonb DEFAULT '{}',
  proposal_status text DEFAULT 'not_generated' CHECK (proposal_status IN ('not_generated', 'drafted', 'pending_approval', 'approved', 'sent')),
  proposal_approval_id UUID REFERENCES public.proposal_approvals(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id)
);

-- Enable RLS on propgen_workflows
ALTER TABLE public.propgen_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies for propgen_workflows
CREATE POLICY "Company users can view their propgen workflows" 
ON public.propgen_workflows 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_crm_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "Internal staff can manage propgen workflows" 
ON public.propgen_workflows 
FOR ALL
USING (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create PropGEN audit log table
CREATE TABLE public.propgen_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  trigger_data jsonb DEFAULT '{}',
  action_type text NOT NULL,
  action_result jsonb DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on propgen_audit_logs
ALTER TABLE public.propgen_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for propgen_audit_logs
CREATE POLICY "Super admins can view all propgen audit logs" 
ON public.propgen_audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Internal staff can view propgen audit logs" 
ON public.propgen_audit_logs 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role));

CREATE POLICY "System can insert propgen audit logs" 
ON public.propgen_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_propgen_workflows_company_id ON public.propgen_workflows(company_id);
CREATE INDEX idx_propgen_workflows_status ON public.propgen_workflows(workflow_status);
CREATE INDEX idx_propgen_audit_logs_company_id ON public.propgen_audit_logs(company_id);
CREATE INDEX idx_propgen_audit_logs_trigger_type ON public.propgen_audit_logs(trigger_type);

-- Update trigger for propgen_workflows
CREATE TRIGGER update_propgen_workflows_updated_at
  BEFORE UPDATE ON public.propgen_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle risk assessment completion
CREATE OR REPLACE FUNCTION public.handle_risk_assessment_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update company settings risk score
  UPDATE public.company_settings 
  SET 
    current_risk_score = NEW.risk_score,
    last_assessment_date = NEW.assessment_date,
    propgen_status = 'risk_assessment_completed',
    propgen_updated_at = now()
  WHERE id = NEW.company_id;

  -- Create or update PropGEN workflow
  INSERT INTO public.propgen_workflows (
    company_id,
    workflow_status,
    risk_assessment_id,
    created_by
  ) VALUES (
    NEW.company_id,
    'risk_assessment_completed',
    NEW.id,
    auth.uid()
  )
  ON CONFLICT (company_id) 
  DO UPDATE SET
    workflow_status = 'risk_assessment_completed',
    risk_assessment_id = NEW.id,
    updated_at = now();

  -- Log the trigger
  INSERT INTO public.propgen_audit_logs (
    company_id,
    trigger_type,
    trigger_data,
    action_type,
    action_result,
    performed_by
  ) VALUES (
    NEW.company_id,
    'risk_assessment_completed',
    jsonb_build_object(
      'assessment_id', NEW.id,
      'risk_score', NEW.risk_score,
      'risk_level', NEW.risk_level
    ),
    'workflow_status_updated',
    jsonb_build_object(
      'new_status', 'risk_assessment_completed',
      'risk_score_updated', true
    ),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for risk assessment completion
CREATE TRIGGER trigger_risk_assessment_completed
  AFTER INSERT OR UPDATE ON public.company_hr_assessments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.handle_risk_assessment_completed();

-- Create function to handle proposal approval requests
CREATE OR REPLACE FUNCTION public.handle_proposal_approval_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Update PropGEN workflow status
  UPDATE public.propgen_workflows 
  SET 
    workflow_status = 'proposal_pending_approval',
    proposal_status = 'pending_approval',
    proposal_approval_id = NEW.id,
    updated_at = now()
  WHERE company_id = NEW.company_id;

  -- Update company settings
  UPDATE public.company_settings 
  SET 
    propgen_status = 'proposal_pending_approval',
    propgen_updated_at = now()
  WHERE id = NEW.company_id;

  -- Log the trigger
  INSERT INTO public.propgen_audit_logs (
    company_id,
    trigger_type,
    trigger_data,
    action_type,
    action_result,
    performed_by
  ) VALUES (
    NEW.company_id,
    'proposal_approval_requested',
    jsonb_build_object(
      'approval_id', NEW.id,
      'proposal_data', NEW.proposal_data
    ),
    'approval_notification_triggered',
    jsonb_build_object(
      'notification_sent', true
    ),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for proposal approval requests
CREATE TRIGGER trigger_proposal_approval_request
  AFTER INSERT ON public.proposal_approvals
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.handle_proposal_approval_request();

-- Create function to handle proposal approvals
CREATE OR REPLACE FUNCTION public.handle_proposal_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Update PropGEN workflow status
    UPDATE public.propgen_workflows 
    SET 
      workflow_status = 'proposal_approved',
      proposal_status = 'approved',
      updated_at = now()
    WHERE company_id = NEW.company_id;

    -- Update company settings
    UPDATE public.company_settings 
    SET 
      propgen_status = 'proposal_approved',
      propgen_updated_at = now()
    WHERE id = NEW.company_id;

    -- Log the trigger
    INSERT INTO public.propgen_audit_logs (
      company_id,
      trigger_type,
      trigger_data,
      action_type,
      action_result,
      performed_by
    ) VALUES (
      NEW.company_id,
      'proposal_approved',
      jsonb_build_object(
        'approval_id', NEW.id,
        'approved_by', NEW.approved_by,
        'approved_at', NEW.approved_at
      ),
      'proposal_unlocked',
      jsonb_build_object(
        'pdf_unlocked', true,
        'email_unlocked', true,
        'print_unlocked', true
      ),
      NEW.approved_by
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for proposal approvals
CREATE TRIGGER trigger_proposal_approved
  AFTER UPDATE ON public.proposal_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_proposal_approved();