
-- Phase 2: Partner & Client Management Tables

-- Partner applications table for POP onboarding
CREATE TABLE public.partner_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_name text NOT NULL,
    company_name text NOT NULL,
    email text NOT NULL,
    phone text,
    territory_id uuid REFERENCES public.territories(id),
    experience_years integer,
    previous_staffing_experience text,
    w9_document_url text,
    bank_info_document_url text,
    license_document_url text,
    digital_signature_data jsonb,
    application_status text NOT NULL DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected')),
    rejection_reason text,
    submitted_at timestamp with time zone NOT NULL DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add territory locking to prevent duplicate assignments
ALTER TABLE public.territories 
ADD COLUMN is_locked boolean NOT NULL DEFAULT false,
ADD COLUMN assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN locked_at timestamp with time zone;

-- Clients table for client management
CREATE TABLE public.staffing_clients (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    legal_name text NOT NULL,
    dba_name text,
    industry text NOT NULL,
    employee_count integer NOT NULL,
    ex_mod_rate numeric(5,2),
    credit_application_url text,
    address text,
    city text,
    state text,
    zip_code text,
    primary_contact_name text,
    primary_contact_email text,
    primary_contact_phone text,
    submitted_by uuid NOT NULL, -- POP who submitted
    approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    markup_percentage numeric(5,2),
    workers_comp_code text,
    workers_comp_rate numeric(5,2),
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_reason text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Client approval workflow tracking
CREATE TABLE public.client_approval_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.staffing_clients(id) ON DELETE CASCADE,
    action text NOT NULL, -- 'submitted', 'approved', 'rejected', 'updated'
    performed_by uuid NOT NULL,
    notes text,
    old_status text,
    new_status text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_applications
CREATE POLICY "Admins can manage all partner applications"
ON public.partner_applications
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own application"
ON public.partner_applications
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can submit partner applications"
ON public.partner_applications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for staffing_clients
CREATE POLICY "Admins can manage all clients"
ON public.staffing_clients
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "POPs can manage their own clients"
ON public.staffing_clients
FOR ALL
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'pop') AND 
    submitted_by = auth.uid()
);

CREATE POLICY "Recruiters can view approved clients in their territory"
ON public.staffing_clients
FOR SELECT
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'recruiter') AND
    approval_status = 'approved'
);

-- RLS Policies for client_approval_history
CREATE POLICY "Admins can manage approval history"
ON public.client_approval_history
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "POPs can view history for their clients"
ON public.client_approval_history
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.staffing_clients sc
        WHERE sc.id = client_approval_history.client_id
        AND sc.submitted_by = auth.uid()
    )
);

-- Triggers for updated_at
CREATE TRIGGER update_partner_applications_updated_at
    BEFORE UPDATE ON public.partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_staffing_clients_updated_at
    BEFORE UPDATE ON public.staffing_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

-- Indexes for performance
CREATE INDEX idx_partner_applications_status ON public.partner_applications(application_status);
CREATE INDEX idx_partner_applications_territory ON public.partner_applications(territory_id);
CREATE INDEX idx_staffing_clients_status ON public.staffing_clients(approval_status);
CREATE INDEX idx_staffing_clients_submitted_by ON public.staffing_clients(submitted_by);
CREATE INDEX idx_client_approval_history_client_id ON public.client_approval_history(client_id);

-- Storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('staffing-documents', 'staffing-documents', false);

-- Storage policies for document uploads
CREATE POLICY "POPs can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'staffing-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "POPs can view their own documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'staffing-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR has_staffing_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can view all staffing documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'staffing-documents' AND
    has_staffing_role(auth.uid(), 'admin')
);
