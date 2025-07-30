-- Create enhanced client onboarding system

-- Create client onboarding profiles table with all universal fields
CREATE TABLE IF NOT EXISTS public.client_onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Universal Fields
  company_name TEXT NOT NULL,
  dba_name TEXT,
  fein TEXT,
  entity_type TEXT, -- LLC, S-Corp, etc.
  main_business_address JSONB, -- {street, city, state, zip}
  industry_type TEXT,
  number_of_employees INTEGER,
  states_of_operation TEXT[], -- multi-select array
  primary_contact JSONB, -- {name, email, phone}
  assigned_account_manager UUID,
  client_status TEXT DEFAULT 'pending',
  service_start_date DATE,
  notes TEXT,
  service_types TEXT[] NOT NULL, -- PEO, ASO, Payroll, HRO, LMS
  
  -- Service-specific data stored as JSONB
  peo_data JSONB DEFAULT '{}',
  aso_data JSONB DEFAULT '{}',
  payroll_data JSONB DEFAULT '{}',
  hro_data JSONB DEFAULT '{}',
  lms_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create file uploads table for client documents
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  onboarding_profile_id UUID REFERENCES public.client_onboarding_profiles(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL, -- service_agreement, employee_census, handbook, etc.
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  service_type TEXT, -- which service this document belongs to
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID
);

-- Create audit trail for client onboarding changes
CREATE TABLE IF NOT EXISTS public.client_onboarding_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_profile_id UUID REFERENCES public.client_onboarding_profiles(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL, -- created, updated, document_uploaded, etc.
  field_changed TEXT,
  old_value JSONB,
  new_value JSONB,
  change_summary TEXT,
  
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  performed_by UUID,
  ip_address INET,
  user_agent TEXT
);

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents', 
  'client-documents', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.client_onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_onboarding_profiles
CREATE POLICY "Company admins can manage their onboarding profiles"
ON public.client_onboarding_profiles
FOR ALL
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

-- RLS Policies for client_documents
CREATE POLICY "Company admins can manage client documents"
ON public.client_documents
FOR ALL
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

-- RLS Policies for audit trail
CREATE POLICY "Company admins can view audit trail"
ON public.client_onboarding_audit
FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "System can insert audit records"
ON public.client_onboarding_audit
FOR INSERT
WITH CHECK (true);

-- Storage policies for client documents
CREATE POLICY "Admins can upload client documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents' AND
  (has_role(auth.uid(), 'company_admin'::app_role) OR 
   has_role(auth.uid(), 'super_admin'::app_role) OR
   has_role(auth.uid(), 'internal_staff'::app_role))
);

CREATE POLICY "Admins can view client documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-documents' AND
  (has_role(auth.uid(), 'company_admin'::app_role) OR 
   has_role(auth.uid(), 'super_admin'::app_role) OR
   has_role(auth.uid(), 'internal_staff'::app_role))
);

CREATE POLICY "Admins can update client documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'client-documents' AND
  (has_role(auth.uid(), 'company_admin'::app_role) OR 
   has_role(auth.uid(), 'super_admin'::app_role) OR
   has_role(auth.uid(), 'internal_staff'::app_role))
);

CREATE POLICY "Admins can delete client documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-documents' AND
  (has_role(auth.uid(), 'company_admin'::app_role) OR 
   has_role(auth.uid(), 'super_admin'::app_role) OR
   has_role(auth.uid(), 'internal_staff'::app_role))
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_client_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.client_onboarding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_onboarding_updated_at();

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.log_onboarding_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log updates, not inserts
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.client_onboarding_audit (
      onboarding_profile_id,
      action_type,
      old_value,
      new_value,
      change_summary,
      performed_by
    ) VALUES (
      NEW.id,
      'profile_updated',
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Client onboarding profile updated',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_onboarding_profile_changes
  AFTER UPDATE ON public.client_onboarding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_onboarding_changes();