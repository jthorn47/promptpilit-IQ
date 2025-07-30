-- Add HALOfiling and HALOvault to halo_module enum
ALTER TYPE halo_module ADD VALUE 'HALOfiling';
ALTER TYPE halo_module ADD VALUE 'HALOvault';

-- Create enums for HALOfiling
CREATE TYPE filing_status AS ENUM ('draft', 'pending', 'submitted', 'accepted', 'rejected', 'amended');
CREATE TYPE form_type AS ENUM ('941', 'w2', 'de9', '1099', 'suta', 'futa', 'state_quarterly', 'local_tax');
CREATE TYPE filing_payment_method AS ENUM ('eftps', 'state_portal', 'check', 'ach', 'wire');
CREATE TYPE liability_type AS ENUM ('federal_income', 'social_security', 'medicare', 'futa', 'suta', 'state_income', 'local');

-- Create enums for HALOvault (using different name to avoid conflict)
CREATE TYPE vault_document_type AS ENUM ('pay_stub', 'w2', 'tax_form', 'receipt', 'audit_report', 'compliance_doc', 'payroll_register');
CREATE TYPE vault_access_level AS ENUM ('read', 'write', 'admin', 'audit');
CREATE TYPE vault_retention_status AS ENUM ('active', 'archived', 'pending_destruction', 'destroyed');

-- HALOfiling Tables

-- Tax form templates and configurations
CREATE TABLE public.halofiling_form_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type form_type NOT NULL,
    form_version TEXT NOT NULL,
    jurisdiction TEXT NOT NULL, -- 'federal', state code, or locality
    template_data JSONB NOT NULL,
    validation_rules JSONB NOT NULL DEFAULT '{}',
    effective_date DATE NOT NULL,
    expires_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Filing schedules and deadlines
CREATE TABLE public.halofiling_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    form_type form_type NOT NULL,
    jurisdiction TEXT NOT NULL,
    filing_frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'annually'
    due_date DATE NOT NULL,
    filing_year INTEGER NOT NULL,
    filing_period TEXT NOT NULL, -- 'Q1', 'Q2', etc. or month
    status filing_status NOT NULL DEFAULT 'draft',
    auto_file BOOLEAN NOT NULL DEFAULT false,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tax calculations and liabilities
CREATE TABLE public.halofiling_liabilities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES halofiling_schedules(id) ON DELETE CASCADE,
    liability_type liability_type NOT NULL,
    calculated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    adjustments DECIMAL(15,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    calculation_data JSONB NOT NULL DEFAULT '{}',
    calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form submissions and filings
CREATE TABLE public.halofiling_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES halofiling_schedules(id) ON DELETE CASCADE,
    form_type form_type NOT NULL,
    form_data JSONB NOT NULL,
    status filing_status NOT NULL DEFAULT 'draft',
    submission_id TEXT, -- External system ID
    confirmation_number TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    payment_required BOOLEAN NOT NULL DEFAULT false,
    payment_amount DECIMAL(15,2),
    payment_due_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment processing for tax liabilities
CREATE TABLE public.halofiling_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES halofiling_submissions(id) ON DELETE CASCADE,
    payment_method filing_payment_method NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    confirmation_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    external_reference TEXT,
    payment_data JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI alerts and validation results
CREATE TABLE public.halofiling_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'validation_error', 'deadline_warning', 'calculation_anomaly'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    context_data JSONB NOT NULL DEFAULT '{}',
    related_table TEXT,
    related_id UUID,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form corrections and amendments
CREATE TABLE public.halofiling_amendments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    original_submission_id UUID NOT NULL REFERENCES halofiling_submissions(id) ON DELETE CASCADE,
    amended_submission_id UUID REFERENCES halofiling_submissions(id),
    amendment_reason TEXT NOT NULL,
    changes_summary JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HALOvault Tables

-- Document metadata and storage
CREATE TABLE public.halovault_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    document_type vault_document_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    encryption_key_id TEXT NOT NULL, -- Reference to encryption key
    checksum TEXT NOT NULL, -- For integrity verification
    document_date DATE NOT NULL,
    retention_years INTEGER NOT NULL DEFAULT 7,
    retention_expires_at DATE NOT NULL,
    retention_status vault_retention_status NOT NULL DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document versions for version control
CREATE TABLE public.halovault_document_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES halovault_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    checksum TEXT NOT NULL,
    changes_summary TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document access logs for audit trail
CREATE TABLE public.halovault_access_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES halovault_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'view', 'download', 'edit', 'delete', 'share'
    ip_address INET,
    user_agent TEXT,
    access_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Role-based document permissions
CREATE TABLE public.halovault_document_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES halovault_documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT REFERENCES halo_role(role_name), -- Can be user or role-based
    access_level vault_access_level NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT check_user_or_role CHECK (
        (user_id IS NOT NULL AND role IS NULL) OR 
        (user_id IS NULL AND role IS NOT NULL)
    )
);

-- Full-text search index for documents
CREATE TABLE public.halovault_search_index (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES halovault_documents(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    search_vector tsvector,
    language TEXT NOT NULL DEFAULT 'english',
    indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document retention policies
CREATE TABLE public.halovault_retention_policies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    document_type vault_document_type NOT NULL,
    jurisdiction TEXT NOT NULL DEFAULT 'federal',
    retention_years INTEGER NOT NULL,
    auto_destroy BOOLEAN NOT NULL DEFAULT false,
    policy_description TEXT,
    effective_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, document_type, jurisdiction)
);

-- Create indexes for performance
CREATE INDEX idx_halofiling_schedules_company_due_date ON halofiling_schedules(company_id, due_date);
CREATE INDEX idx_halofiling_submissions_company_status ON halofiling_submissions(company_id, status);
CREATE INDEX idx_halofiling_alerts_company_resolved ON halofiling_alerts(company_id, is_resolved);
CREATE INDEX idx_halovault_documents_company_type ON halovault_documents(company_id, document_type);
CREATE INDEX idx_halovault_documents_retention ON halovault_documents(retention_expires_at, retention_status);
CREATE INDEX idx_halovault_access_logs_document_user ON halovault_access_logs(document_id, user_id);
CREATE INDEX idx_halovault_search_vector ON halovault_search_index USING gin(search_vector);

-- Enable Row Level Security
ALTER TABLE halofiling_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE halofiling_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE halovault_retention_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for HALOfiling

-- Form templates (admin only for management, read-only for users)
CREATE POLICY "Super admins can manage form templates" ON halofiling_form_templates
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'admin'::permission_action));

CREATE POLICY "Users can view active form templates" ON halofiling_form_templates
FOR SELECT USING (is_active = true AND has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'read'::permission_action));

-- Filing schedules (company-scoped)
CREATE POLICY "Company users can manage their filing schedules" ON halofiling_schedules
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'write'::permission_action, company_id));

-- Liabilities (company-scoped)
CREATE POLICY "Company users can manage their liabilities" ON halofiling_liabilities
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'write'::permission_action, company_id));

-- Submissions (company-scoped)
CREATE POLICY "Company users can manage their submissions" ON halofiling_submissions
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'write'::permission_action, company_id));

-- Payments (company-scoped)
CREATE POLICY "Company users can manage their payments" ON halofiling_payments
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'write'::permission_action, company_id));

-- Alerts (company-scoped)
CREATE POLICY "Company users can view their alerts" ON halofiling_alerts
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'read'::permission_action, company_id));

-- Amendments (company-scoped)
CREATE POLICY "Company users can manage their amendments" ON halofiling_amendments
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOfiling'::halo_module, 'write'::permission_action, company_id));

-- Create RLS policies for HALOvault

-- Documents (company-scoped with permission checks)
CREATE POLICY "Users can access documents based on permissions" ON halovault_documents
FOR SELECT USING (
    has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'read'::permission_action, company_id) AND
    (EXISTS (
        SELECT 1 FROM halovault_document_permissions 
        WHERE document_id = halovault_documents.id 
        AND (user_id = auth.uid() OR role IN (
            SELECT role FROM halo_user_roles 
            WHERE user_id = auth.uid() AND client_id = company_id AND is_active = true
        ))
    ) OR has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'admin'::permission_action, company_id))
);

CREATE POLICY "Users can manage documents with write permissions" ON halovault_documents
FOR INSERT WITH CHECK (
    has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'write'::permission_action, company_id)
);

CREATE POLICY "Users can update documents with write permissions" ON halovault_documents
FOR UPDATE USING (
    has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'write'::permission_action, company_id)
);

CREATE POLICY "Users can delete documents with write permissions" ON halovault_documents
FOR DELETE USING (
    has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'write'::permission_action, company_id)
);

-- Document versions (follow parent document permissions)
CREATE POLICY "Users can access document versions" ON halovault_document_versions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM halovault_documents 
        WHERE id = halovault_document_versions.document_id 
        AND has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'read'::permission_action, company_id)
    )
);

-- Access logs (company-scoped, insert for all, read for admins)
CREATE POLICY "System can insert access logs" ON halovault_access_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view access logs" ON halovault_access_logs
FOR SELECT USING (has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'admin'::permission_action, company_id));

-- Document permissions (admins can manage)
CREATE POLICY "Admins can manage document permissions" ON halovault_document_permissions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM halovault_documents 
        WHERE id = halovault_document_permissions.document_id 
        AND has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'admin'::permission_action, company_id)
    )
);

-- Search index (follows document permissions)
CREATE POLICY "Users can search documents they have access to" ON halovault_search_index
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM halovault_documents 
        WHERE id = halovault_search_index.document_id 
        AND has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'read'::permission_action, company_id)
    )
);

-- Retention policies (company admins can manage)
CREATE POLICY "Company admins can manage retention policies" ON halovault_retention_policies
FOR ALL USING (has_halo_permission(auth.uid(), 'HALOvault'::halo_module, 'admin'::permission_action, company_id));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_halofiling_form_templates_updated_at 
    BEFORE UPDATE ON halofiling_form_templates 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_schedules_updated_at 
    BEFORE UPDATE ON halofiling_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_liabilities_updated_at 
    BEFORE UPDATE ON halofiling_liabilities 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_submissions_updated_at 
    BEFORE UPDATE ON halofiling_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_payments_updated_at 
    BEFORE UPDATE ON halofiling_payments 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_alerts_updated_at 
    BEFORE UPDATE ON halofiling_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halofiling_amendments_updated_at 
    BEFORE UPDATE ON halofiling_amendments 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovault_documents_updated_at 
    BEFORE UPDATE ON halovault_documents 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovault_document_permissions_updated_at 
    BEFORE UPDATE ON halovault_document_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

CREATE TRIGGER update_halovault_retention_policies_updated_at 
    BEFORE UPDATE ON halovault_retention_policies 
    FOR EACH ROW EXECUTE FUNCTION update_halo_updated_at();

-- Create trigger to automatically update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector(NEW.language::regconfig, NEW.content_text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halovault_search_vector
    BEFORE INSERT OR UPDATE ON halovault_search_index
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();