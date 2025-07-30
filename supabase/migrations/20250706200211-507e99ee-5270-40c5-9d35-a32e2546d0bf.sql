-- Create compliance policies table for managing organizational policies
CREATE TABLE public.compliance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'data_protection', 'security', 'privacy', 'financial', 'operational', 'legal'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
    compliance_frameworks TEXT[] DEFAULT '{}', -- GDPR, HIPAA, SOX, PCI DSS, etc.
    requirements TEXT[] DEFAULT '{}', -- List of specific requirements
    implementation_notes TEXT,
    review_frequency_months INTEGER NOT NULL DEFAULT 12,
    next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_to TEXT, -- Email of person responsible
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create compliance assessments table for tracking policy compliance
CREATE TABLE public.compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
    findings TEXT[] DEFAULT '{}', -- List of findings/issues
    recommendations TEXT[] DEFAULT '{}', -- List of recommendations
    assessor_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance audit trail for tracking all compliance-related activities
CREATE TABLE public.compliance_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.compliance_policies(id),
    assessment_id UUID REFERENCES public.compliance_assessments(id),
    action_type TEXT NOT NULL, -- 'policy_created', 'policy_updated', 'assessment_completed', etc.
    action_details JSONB DEFAULT '{}',
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_compliance_policies_category ON public.compliance_policies(category);
CREATE INDEX idx_compliance_policies_status ON public.compliance_policies(status);
CREATE INDEX idx_compliance_policies_next_review ON public.compliance_policies(next_review_date);
CREATE INDEX idx_compliance_assessments_policy_id ON public.compliance_assessments(policy_id);
CREATE INDEX idx_compliance_assessments_date ON public.compliance_assessments(assessment_date);
CREATE INDEX idx_compliance_audit_trail_policy_id ON public.compliance_audit_trail(policy_id);

-- RLS Policies for compliance_policies
CREATE POLICY "Super admins can manage all compliance policies"
ON public.compliance_policies
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their company compliance policies"
ON public.compliance_policies
FOR ALL
USING (has_role(auth.uid(), 'company_admin'));

-- RLS Policies for compliance_assessments
CREATE POLICY "Super admins can manage all compliance assessments"
ON public.compliance_assessments
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their company compliance assessments"
ON public.compliance_assessments
FOR ALL
USING (has_role(auth.uid(), 'company_admin'));

-- RLS Policies for compliance_audit_trail
CREATE POLICY "Super admins can view all compliance audit trail"
ON public.compliance_audit_trail
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their company compliance audit trail"
ON public.compliance_audit_trail
FOR SELECT
USING (has_role(auth.uid(), 'company_admin'));

CREATE POLICY "System can insert compliance audit trail"
ON public.compliance_audit_trail
FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_compliance_policies_updated_at
    BEFORE UPDATE ON public.compliance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for compliance audit trail
CREATE OR REPLACE FUNCTION public.log_compliance_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log policy changes
    IF TG_TABLE_NAME = 'compliance_policies' THEN
        INSERT INTO public.compliance_audit_trail (
            policy_id, action_type, action_details, performed_by
        )
        VALUES (
            NEW.id,
            CASE TG_OP
                WHEN 'INSERT' THEN 'policy_created'
                WHEN 'UPDATE' THEN 'policy_updated'
                WHEN 'DELETE' THEN 'policy_deleted'
            END,
            jsonb_build_object('old_values', to_jsonb(OLD), 'new_values', to_jsonb(NEW)),
            auth.uid()
        );
    END IF;
    
    -- Log assessment changes
    IF TG_TABLE_NAME = 'compliance_assessments' THEN
        INSERT INTO public.compliance_audit_trail (
            assessment_id, policy_id, action_type, action_details, performed_by
        )
        VALUES (
            NEW.id,
            NEW.policy_id,
            CASE TG_OP
                WHEN 'INSERT' THEN 'assessment_created'
                WHEN 'UPDATE' THEN 'assessment_updated'
                WHEN 'DELETE' THEN 'assessment_deleted'
            END,
            jsonb_build_object('old_values', to_jsonb(OLD), 'new_values', to_jsonb(NEW)),
            auth.uid()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit trail
CREATE TRIGGER compliance_policies_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.compliance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.log_compliance_audit();

CREATE TRIGGER compliance_assessments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.compliance_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_compliance_audit();