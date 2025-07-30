-- ConnectIQ CRM Schema v3 Implementation
-- Phase 3: Core CRM Schema with Company-Anchored Architecture

-- Create custom types and enums
CREATE TYPE public.company_type AS ENUM ('HRO', 'Staffing', 'PEO', 'LMS', 'Consulting', 'Other');
CREATE TYPE public.company_status AS ENUM ('lead', 'prospect', 'client', 'inactive');
CREATE TYPE public.opportunity_stage AS ENUM ('lead', 'prospect', 'assessment', 'proposal_sent', 'verbal', 'won', 'lost');
CREATE TYPE public.proposal_status AS ENUM ('draft', 'under_review', 'sent', 'signed', 'rejected');
CREATE TYPE public.task_status AS ENUM ('to_do', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.product_line AS ENUM ('HRO', 'LMS', 'Staffing', 'Consulting', 'PEO', 'Other');

-- Create the core companies table (enhanced from company_settings)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type public.company_type DEFAULT 'Other',
    status public.company_status DEFAULT 'lead',
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    business_description TEXT,
    assigned_rep_id UUID,
    
    -- Contact information
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Address information
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Business details
    industry TEXT,
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    
    -- CRM tracking
    lead_source TEXT,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contacts table (enhanced)
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile_phone TEXT,
    title TEXT,
    department TEXT,
    is_primary_contact BOOLEAN DEFAULT false,
    
    -- Additional contact info
    linkedin_url TEXT,
    direct_line TEXT,
    assistant_name TEXT,
    assistant_phone TEXT,
    
    -- Communication preferences
    preferred_contact_method TEXT DEFAULT 'email',
    timezone TEXT,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create opportunities table (enhanced deals)
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    product_line public.product_line DEFAULT 'Other',
    deal_value DECIMAL(15,2),
    close_probability INTEGER CHECK (close_probability >= 0 AND close_probability <= 100),
    forecast_close_date DATE,
    stage public.opportunity_stage DEFAULT 'lead',
    assigned_rep_id UUID,
    
    -- Linked entities
    risk_assessment_id UUID,
    proposal_id UUID,
    
    -- Sales tracking
    lead_source TEXT,
    competitors TEXT[],
    decision_criteria TEXT,
    decision_makers UUID[], -- Array of contact IDs
    
    -- Timeline tracking
    last_activity_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- SPIN methodology tracking
    spin_completion_score INTEGER DEFAULT 0 CHECK (spin_completion_score >= 0 AND spin_completion_score <= 100),
    
    -- Sales process
    discovery_completed BOOLEAN DEFAULT false,
    demo_completed BOOLEAN DEFAULT false,
    proposal_sent BOOLEAN DEFAULT false,
    contract_sent BOOLEAN DEFAULT false,
    
    -- Loss tracking
    loss_reason TEXT,
    loss_reason_detail TEXT,
    competitor_won TEXT,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create SPIN contents table
CREATE TABLE public.spin_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    
    -- SPIN methodology fields
    situation TEXT, -- Current situation analysis
    problem TEXT,   -- Problems identified
    implication TEXT, -- Implications of problems
    need_payoff TEXT, -- Need-payoff questions and responses
    
    -- Additional SPIN tracking
    situation_score INTEGER DEFAULT 0 CHECK (situation_score >= 0 AND situation_score <= 10),
    problem_score INTEGER DEFAULT 0 CHECK (problem_score >= 0 AND problem_score <= 10),
    implication_score INTEGER DEFAULT 0 CHECK (implication_score >= 0 AND implication_score <= 10),
    need_payoff_score INTEGER DEFAULT 0 CHECK (need_payoff_score >= 0 AND need_payoff_score <= 10),
    
    -- Questions and insights
    key_questions JSONB DEFAULT '[]',
    insights_discovered JSONB DEFAULT '[]',
    pain_points JSONB DEFAULT '[]',
    value_propositions JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    
    -- Assessment details
    assessment_type TEXT DEFAULT 'standard',
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    risk_level TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN score >= 80 THEN 'Low'
            WHEN score >= 60 THEN 'Medium'
            WHEN score >= 40 THEN 'High'
            ELSE 'Critical'
        END
    ) STORED,
    
    -- Completion tracking
    completed_by UUID, -- Can be user_id or contact_id
    completed_by_type TEXT DEFAULT 'user', -- 'user' or 'contact'
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Assessment data
    results_json JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    
    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Metadata
    version TEXT DEFAULT '1.0',
    assessment_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced proposals table
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    
    -- Proposal details
    title TEXT NOT NULL,
    version_number INTEGER DEFAULT 1,
    status public.proposal_status DEFAULT 'draft',
    
    -- Document management
    pdf_url TEXT,
    document_key TEXT, -- For PropGEN integration
    template_used TEXT,
    
    -- Proposal content
    executive_summary TEXT,
    proposed_solution TEXT,
    pricing_details JSONB DEFAULT '{}',
    terms_conditions TEXT,
    
    -- Tracking
    created_by UUID NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    
    -- Client interaction
    client_feedback TEXT,
    feedback_received_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by_contact_id UUID,
    
    -- Validity
    valid_until DATE,
    is_expired BOOLEAN GENERATED ALWAYS AS (valid_until < CURRENT_DATE) STORED,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced tasks table
CREATE TABLE public.crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status public.task_status DEFAULT 'to_do',
    priority public.task_priority DEFAULT 'medium',
    
    -- Assignment
    assigned_user_id UUID NOT NULL,
    created_by UUID NOT NULL,
    
    -- Relationships
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    
    -- Task properties
    task_type TEXT DEFAULT 'general',
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Automation
    is_auto_generated BOOLEAN DEFAULT false,
    auto_rule_id UUID, -- Reference to automation rule that created this
    
    -- Completion tracking
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    
    -- Reminders
    reminder_date TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT false,
    
    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automation rules table
CREATE TABLE public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Rule configuration
    trigger_event TEXT NOT NULL, -- e.g., 'stage_change', 'no_activity', 'task_overdue'
    trigger_conditions JSONB NOT NULL DEFAULT '{}', -- JSON logic for when to trigger
    
    -- Actions configuration
    actions_json JSONB NOT NULL DEFAULT '[]', -- Array of actions to perform
    
    -- Rule settings
    is_enabled BOOLEAN DEFAULT true,
    execution_order INTEGER DEFAULT 0,
    
    -- Targeting
    applies_to_all_companies BOOLEAN DEFAULT true,
    target_company_ids UUID[], -- Specific companies if not all
    target_user_ids UUID[], -- Specific users if not all
    
    -- Execution tracking
    last_executed_at TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Management
    created_by UUID NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity log table for audit trail
CREATE TABLE public.crm_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity tracking
    entity_type TEXT NOT NULL, -- 'company', 'contact', 'opportunity', etc.
    entity_id UUID NOT NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'stage_changed', etc.
    description TEXT NOT NULL,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    field_changes TEXT[],
    
    -- User tracking
    performed_by UUID,
    performed_by_type TEXT DEFAULT 'user', -- 'user', 'system', 'automation'
    
    -- Context
    source TEXT DEFAULT 'web', -- 'web', 'api', 'automation', 'import'
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints for opportunities
ALTER TABLE public.opportunities 
ADD CONSTRAINT fk_opportunities_risk_assessment 
FOREIGN KEY (risk_assessment_id) REFERENCES public.risk_assessments(id) ON DELETE SET NULL;

ALTER TABLE public.opportunities 
ADD CONSTRAINT fk_opportunities_proposal 
FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_companies_type ON public.companies(type);
CREATE INDEX idx_companies_assigned_rep ON public.companies(assigned_rep_id);
CREATE INDEX idx_companies_name_trgm ON public.companies USING gin (name gin_trgm_ops);

CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_is_primary ON public.contacts(is_primary_contact);
CREATE INDEX idx_contacts_name ON public.contacts(first_name, last_name);

CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX idx_opportunities_assigned_rep ON public.opportunities(assigned_rep_id);
CREATE INDEX idx_opportunities_close_date ON public.opportunities(forecast_close_date);
CREATE INDEX idx_opportunities_value ON public.opportunities(deal_value);

CREATE INDEX idx_spin_contents_opportunity_id ON public.spin_contents(opportunity_id);

CREATE INDEX idx_risk_assessments_company_id ON public.risk_assessments(company_id);
CREATE INDEX idx_risk_assessments_opportunity_id ON public.risk_assessments(opportunity_id);
CREATE INDEX idx_risk_assessments_score ON public.risk_assessments(score);

CREATE INDEX idx_proposals_company_id ON public.proposals(company_id);
CREATE INDEX idx_proposals_opportunity_id ON public.proposals(opportunity_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);

CREATE INDEX idx_crm_tasks_assigned_user ON public.crm_tasks(assigned_user_id);
CREATE INDEX idx_crm_tasks_company_id ON public.crm_tasks(company_id);
CREATE INDEX idx_crm_tasks_opportunity_id ON public.crm_tasks(opportunity_id);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX idx_crm_tasks_due_date ON public.crm_tasks(due_date);

CREATE INDEX idx_automation_rules_enabled ON public.automation_rules(is_enabled);
CREATE INDEX idx_automation_rules_trigger ON public.automation_rules(trigger_event);

CREATE INDEX idx_crm_activity_log_entity ON public.crm_activity_log(entity_type, entity_id);
CREATE INDEX idx_crm_activity_log_created_at ON public.crm_activity_log(created_at);
CREATE INDEX idx_crm_activity_log_performed_by ON public.crm_activity_log(performed_by);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spin_contents_updated_at
    BEFORE UPDATE ON public.spin_contents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
    BEFORE UPDATE ON public.crm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
    BEFORE UPDATE ON public.automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_crm_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip if this is an activity log insert to prevent recursion
    IF TG_TABLE_NAME = 'crm_activity_log' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    INSERT INTO public.crm_activity_log (
        entity_type,
        entity_id,
        activity_type,
        description,
        old_values,
        new_values,
        performed_by,
        performed_by_type
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'created'
            WHEN 'UPDATE' THEN 'updated'
            WHEN 'DELETE' THEN 'deleted'
        END,
        CASE TG_OP
            WHEN 'INSERT' THEN TG_TABLE_NAME || ' created'
            WHEN 'UPDATE' THEN TG_TABLE_NAME || ' updated'
            WHEN 'DELETE' THEN TG_TABLE_NAME || ' deleted'
        END,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        auth.uid(),
        'user'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity logging triggers
CREATE TRIGGER log_companies_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION log_crm_activity();

CREATE TRIGGER log_contacts_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION log_crm_activity();

CREATE TRIGGER log_opportunities_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION log_crm_activity();

CREATE TRIGGER log_proposals_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION log_crm_activity();

CREATE TRIGGER log_crm_tasks_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.crm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_crm_activity();

-- Create function to ensure primary contact uniqueness
CREATE OR REPLACE FUNCTION ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this contact as primary, unset others for the same company
    IF NEW.is_primary_contact = true THEN
        UPDATE public.contacts 
        SET is_primary_contact = false 
        WHERE company_id = NEW.company_id 
        AND id != NEW.id 
        AND is_primary_contact = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_primary_contact_uniqueness
    BEFORE INSERT OR UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_contact();

-- Create function to update opportunity stage timestamps
CREATE OR REPLACE FUNCTION update_opportunity_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stage timestamp when stage changes
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        NEW.stage_updated_at = now();
        
        -- Update last activity date
        NEW.last_activity_date = now();
        
        -- Update company last activity date
        UPDATE public.companies 
        SET last_activity_date = now() 
        WHERE id = NEW.company_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opportunity_stage_timestamp_trigger
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_stage_timestamp();

-- Enable realtime for all CRM tables
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.opportunities REPLICA IDENTITY FULL;
ALTER TABLE public.spin_contents REPLICA IDENTITY FULL;
ALTER TABLE public.risk_assessments REPLICA IDENTITY FULL;
ALTER TABLE public.proposals REPLICA IDENTITY FULL;
ALTER TABLE public.crm_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.automation_rules REPLICA IDENTITY FULL;
ALTER TABLE public.crm_activity_log REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_contents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_activity_log;