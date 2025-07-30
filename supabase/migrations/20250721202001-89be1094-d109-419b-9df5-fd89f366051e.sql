-- Phase 4: Compliance Monitoring & Alerts System

-- Create wage compliance alerts table
CREATE TABLE public.wage_compliance_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('wage_violation', 'upcoming_change', 'threshold_breach', 'documentation_required')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    violation_details JSONB DEFAULT '{}',
    affected_employees UUID[] DEFAULT '{}',
    jurisdiction TEXT NOT NULL,
    recommended_actions TEXT[],
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wage compliance monitoring rules
CREATE TABLE public.wage_compliance_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('minimum_wage', 'overtime', 'exempt_salary', 'tipped_wage')),
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    alert_threshold JSONB NOT NULL DEFAULT '{}',
    notification_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
    notification_channels TEXT[] NOT NULL DEFAULT '{email}',
    recipients UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance reports table
CREATE TABLE public.wage_compliance_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    report_type TEXT NOT NULL CHECK (report_type IN ('violation_summary', 'compliance_audit', 'risk_assessment', 'action_plan')),
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}',
    executive_summary TEXT,
    total_violations INTEGER NOT NULL DEFAULT 0,
    high_risk_violations INTEGER NOT NULL DEFAULT 0,
    compliance_score NUMERIC(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    recommendations TEXT[],
    generated_by UUID,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit trail for compliance actions
CREATE TABLE public.wage_compliance_audit_trail (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('alert_created', 'alert_resolved', 'violation_detected', 'correction_applied', 'report_generated')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('employee', 'payroll_run', 'wage_rule', 'alert', 'report')),
    entity_id UUID NOT NULL,
    action_details JSONB NOT NULL DEFAULT '{}',
    performed_by UUID,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    compliance_context JSONB DEFAULT '{}'
);

-- Enable RLS on all tables
ALTER TABLE public.wage_compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wage_compliance_alerts
CREATE POLICY "Company admins can manage compliance alerts"
ON public.wage_compliance_alerts
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for wage_compliance_rules
CREATE POLICY "Company admins can manage compliance rules"
ON public.wage_compliance_rules
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for wage_compliance_reports
CREATE POLICY "Company admins can view compliance reports"
ON public.wage_compliance_reports
FOR SELECT
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can create compliance reports"
ON public.wage_compliance_reports
FOR INSERT
WITH CHECK (true);

-- RLS Policies for wage_compliance_audit_trail
CREATE POLICY "Company admins can view compliance audit trail"
ON public.wage_compliance_audit_trail
FOR SELECT
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert compliance audit trail"
ON public.wage_compliance_audit_trail
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_wage_compliance_alerts_company_severity ON public.wage_compliance_alerts(company_id, severity);
CREATE INDEX idx_wage_compliance_alerts_resolved ON public.wage_compliance_alerts(is_resolved, created_at);
CREATE INDEX idx_wage_compliance_rules_company_active ON public.wage_compliance_rules(company_id, is_active);
CREATE INDEX idx_wage_compliance_reports_company_period ON public.wage_compliance_reports(company_id, report_period_start, report_period_end);
CREATE INDEX idx_wage_compliance_audit_company_action ON public.wage_compliance_audit_trail(company_id, action_type, performed_at);

-- Create triggers for automatic timestamps
CREATE TRIGGER update_wage_compliance_alerts_updated_at
    BEFORE UPDATE ON public.wage_compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wage_compliance_rules_updated_at
    BEFORE UPDATE ON public.wage_compliance_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate compliance alerts
CREATE OR REPLACE FUNCTION public.generate_wage_compliance_alert(
    p_company_id UUID,
    p_alert_type TEXT,
    p_severity TEXT,
    p_title TEXT,
    p_description TEXT,
    p_violation_details JSONB DEFAULT '{}',
    p_affected_employees UUID[] DEFAULT '{}',
    p_jurisdiction TEXT DEFAULT 'Unknown',
    p_recommended_actions TEXT[] DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO public.wage_compliance_alerts (
        company_id,
        alert_type,
        severity,
        title,
        description,
        violation_details,
        affected_employees,
        jurisdiction,
        recommended_actions
    ) VALUES (
        p_company_id,
        p_alert_type,
        p_severity,
        p_title,
        p_description,
        p_violation_details,
        p_affected_employees,
        p_jurisdiction,
        p_recommended_actions
    ) RETURNING id INTO alert_id;
    
    -- Log the alert creation
    INSERT INTO public.wage_compliance_audit_trail (
        company_id,
        action_type,
        entity_type,
        entity_id,
        action_details,
        performed_by
    ) VALUES (
        p_company_id,
        'alert_created',
        'alert',
        alert_id,
        jsonb_build_object(
            'alert_type', p_alert_type,
            'severity', p_severity,
            'affected_count', array_length(p_affected_employees, 1)
        ),
        auth.uid()
    );
    
    RETURN alert_id;
END;
$$;

-- Function to resolve compliance alerts
CREATE OR REPLACE FUNCTION public.resolve_wage_compliance_alert(
    p_alert_id UUID,
    p_resolution_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    alert_record RECORD;
BEGIN
    -- Get alert details and update
    UPDATE public.wage_compliance_alerts
    SET 
        is_resolved = true,
        resolved_at = now(),
        resolved_by = auth.uid(),
        resolution_notes = p_resolution_notes,
        updated_at = now()
    WHERE id = p_alert_id
    RETURNING * INTO alert_record;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Log the resolution
    INSERT INTO public.wage_compliance_audit_trail (
        company_id,
        action_type,
        entity_type,
        entity_id,
        action_details,
        performed_by
    ) VALUES (
        alert_record.company_id,
        'alert_resolved',
        'alert',
        p_alert_id,
        jsonb_build_object(
            'resolution_notes', p_resolution_notes,
            'resolution_time_hours', EXTRACT(EPOCH FROM (now() - alert_record.created_at))/3600
        ),
        auth.uid()
    );
    
    RETURN true;
END;
$$;