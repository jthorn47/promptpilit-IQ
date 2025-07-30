-- Create proposals table for storing generated proposals
CREATE TABLE public.proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_by UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    
    -- Section toggles
    include_investment_analysis BOOLEAN NOT NULL DEFAULT true,
    include_risk_assessment BOOLEAN NOT NULL DEFAULT true,
    include_recommendations BOOLEAN NOT NULL DEFAULT true,
    
    -- Proposal content
    proposal_data JSONB NOT NULL DEFAULT '{}',
    brand_settings JSONB NOT NULL DEFAULT '{}',
    financial_data JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    version INTEGER NOT NULL DEFAULT 1,
    parent_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    pdf_url TEXT,
    word_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(company_id, title, version)
);

-- Create proposal templates table
CREATE TABLE public.proposal_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investment analysis configurations table
CREATE TABLE public.investment_analysis_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    config_name TEXT NOT NULL DEFAULT 'Default',
    
    -- Base rates and costs
    hourly_admin_cost DECIMAL(10,2) NOT NULL DEFAULT 45.00,
    hourly_manager_cost DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    compliance_risk_factor DECIMAL(5,4) NOT NULL DEFAULT 0.15,
    turnover_cost_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.5,
    
    -- Service pricing
    peo_cost_per_employee DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    aso_cost_per_employee DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    payroll_base_cost DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    payroll_per_employee DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    
    -- Industry benchmarks
    industry_turnover_rate DECIMAL(5,4) NOT NULL DEFAULT 0.20,
    avg_hiring_cost DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(company_id, config_name)
);

-- Enable RLS on all tables
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_analysis_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Company admins can manage their proposals" 
ON public.proposals 
FOR ALL 
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid()
);

-- RLS Policies for proposal templates
CREATE POLICY "Admins can manage proposal templates" 
ON public.proposal_templates 
FOR ALL 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'company_admin'::app_role)
);

-- RLS Policies for investment configs
CREATE POLICY "Company admins can manage their investment configs" 
ON public.investment_analysis_configs 
FOR ALL 
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_templates_updated_at
    BEFORE UPDATE ON public.proposal_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_configs_updated_at
    BEFORE UPDATE ON public.investment_analysis_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default investment analysis config
INSERT INTO public.investment_analysis_configs (
    company_id,
    config_name,
    hourly_admin_cost,
    hourly_manager_cost,
    compliance_risk_factor,
    turnover_cost_multiplier,
    peo_cost_per_employee,
    aso_cost_per_employee,
    payroll_base_cost,
    payroll_per_employee,
    industry_turnover_rate,
    avg_hiring_cost
) 
SELECT 
    id as company_id,
    'Default Configuration' as config_name,
    45.00,
    75.00,
    0.15,
    1.5,
    150.00,
    75.00,
    500.00,
    15.00,
    0.20,
    5000.00
FROM public.company_settings 
WHERE id NOT IN (
    SELECT company_id 
    FROM public.investment_analysis_configs 
    WHERE company_id IS NOT NULL
);

-- Insert default proposal template
INSERT INTO public.proposal_templates (
    name,
    description,
    template_data,
    is_default,
    created_by
) VALUES (
    'Standard HR Proposal',
    'Default template for comprehensive HR service proposals',
    '{
        "sections": {
            "executive_summary": true,
            "investment_analysis": true,
            "risk_assessment": true,
            "recommendations": true,
            "next_steps": true
        },
        "branding": {
            "primary_color": "#655DC6",
            "show_logo": true,
            "show_company_info": true
        }
    }'::jsonb,
    true,
    '00000000-0000-0000-0000-000000000000'
);