-- Create companies table for client management
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'prospective' CHECK (status IN ('active', 'inactive', 'prospective', 'churned')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB DEFAULT '{}',
  website_url TEXT,
  notes TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
CREATE POLICY "Company admins can view companies" 
ON public.companies 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'client_admin'::app_role)
);

CREATE POLICY "Company admins can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Company admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Company admins can delete companies" 
ON public.companies 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_halo_updated_at();

-- Create index for performance
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_companies_industry ON public.companies(industry);
CREATE INDEX idx_companies_created_at ON public.companies(created_at);