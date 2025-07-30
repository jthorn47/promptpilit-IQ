-- Create investment_analysis table for PropGEN calculations
CREATE TABLE public.investment_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    deal_id UUID REFERENCES public.deals(id),
    proposal_id UUID REFERENCES public.proposals(id),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Company Information
    company_name TEXT NOT NULL,
    wse_count INTEGER NOT NULL,
    annual_payroll DECIMAL(12,2) NOT NULL,
    
    -- Current HR Burden
    current_hr_burden DECIMAL(12,2) NOT NULL,
    suta_rate DECIMAL(5,2) NOT NULL DEFAULT 4.2,
    wc_rate DECIMAL(5,2) NOT NULL DEFAULT 4.23,
    
    -- Easeworks Pricing
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('% of Payroll', 'PEPM')),
    easeworks_fee DECIMAL(5,2), -- % of payroll
    easeworks_pepm DECIMAL(10,2), -- per employee per month
    setup_fee_per_wse DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    
    -- Calculated Values
    fica_cost DECIMAL(12,2) NOT NULL,
    suta_cost DECIMAL(12,2) NOT NULL,
    futa_cost DECIMAL(12,2) NOT NULL,
    wc_cost DECIMAL(12,2) NOT NULL,
    backend_addons DECIMAL(12,2) NOT NULL,
    admin_total DECIMAL(12,2) NOT NULL,
    setup_fee DECIMAL(12,2) NOT NULL,
    total_easeworks_cost DECIMAL(12,2) NOT NULL,
    savings_dollar DECIMAL(12,2) NOT NULL,
    savings_percent DECIMAL(5,2) NOT NULL,
    gp_total DECIMAL(12,2) NOT NULL,
    gp_pepm DECIMAL(10,2) NOT NULL,
    
    -- Metadata
    version INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'presented', 'accepted', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.investment_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Easeworks sales reps can manage investment analysis"
ON public.investment_analysis
FOR ALL
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_investment_analysis_company_id ON public.investment_analysis(company_id);
CREATE INDEX idx_investment_analysis_deal_id ON public.investment_analysis(deal_id);
CREATE INDEX idx_investment_analysis_proposal_id ON public.investment_analysis(proposal_id);
CREATE INDEX idx_investment_analysis_created_by ON public.investment_analysis(created_by);

-- Create updated_at trigger
CREATE TRIGGER update_investment_analysis_updated_at
    BEFORE UPDATE ON public.investment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add investment_analysis_id to deals table for easier linking
ALTER TABLE public.deals ADD COLUMN investment_analysis_id UUID REFERENCES public.investment_analysis(id);

-- Create audit table for investment analysis changes
CREATE TABLE public.investment_analysis_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    investment_analysis_id UUID NOT NULL REFERENCES public.investment_analysis(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.investment_analysis_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for audit table
CREATE POLICY "Easeworks sales reps can view investment analysis audit"
ON public.investment_analysis_audit
FOR SELECT
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- Create audit trigger
CREATE OR REPLACE FUNCTION public.log_investment_analysis_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.investment_analysis_audit (
            investment_analysis_id,
            action_type,
            old_values,
            new_values,
            changed_by
        )
        VALUES (
            NEW.id,
            'updated',
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_analysis_audit_trigger
    AFTER UPDATE ON public.investment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.log_investment_analysis_changes();