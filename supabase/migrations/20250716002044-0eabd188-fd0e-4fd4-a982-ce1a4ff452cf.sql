-- STAGE 1: Backend Consolidation - Clean Slate Approach
-- Step 1: Create new company_contacts table with proper relationships

CREATE TABLE public.company_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE RESTRICT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX idx_company_contacts_company_id ON public.company_contacts(company_id);
CREATE INDEX idx_company_contacts_email ON public.company_contacts(email);
CREATE INDEX idx_company_contacts_status ON public.company_contacts(status);

-- Unique constraint: one primary contact per company
CREATE UNIQUE INDEX idx_company_contacts_primary ON public.company_contacts(company_id) 
WHERE is_primary = true;

-- Enable Row Level Security
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_contacts
CREATE POLICY "Company admins can manage their contacts"
ON public.company_contacts
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Internal staff can view all contacts"
ON public.company_contacts
FOR SELECT
USING (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) 
  OR has_crm_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_company_contacts_updated_at
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one primary contact per company
CREATE OR REPLACE FUNCTION public.ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a contact as primary, unset others for this company
  IF NEW.is_primary = true AND (OLD.is_primary IS NULL OR OLD.is_primary = false) THEN
    UPDATE public.company_contacts 
    SET is_primary = false, updated_at = now()
    WHERE company_id = NEW.company_id AND id != NEW.id AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_contact
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_primary_contact();