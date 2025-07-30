-- Create HRO IQ Policies table
CREATE TABLE public.hroiq_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  last_updated_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',
  acceptance_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique title per company per version
  UNIQUE(company_id, title, version)
);

-- Create policy assignments tracking table
CREATE TABLE public.hroiq_policy_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.hroiq_policies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  acceptance_status TEXT NOT NULL DEFAULT 'pending' CHECK (acceptance_status IN ('pending', 'accepted', 'declined')),
  acceptance_signature TEXT,
  notes TEXT,
  
  -- Ensure unique assignment per policy per employee
  UNIQUE(policy_id, employee_id)
);

-- Create policy version history table
CREATE TABLE public.hroiq_policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.hroiq_policies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_summary TEXT
);

-- Enable Row Level Security
ALTER TABLE public.hroiq_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_policy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hroiq_policy_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hroiq_policies
CREATE POLICY "Company admins can manage their policies"
ON public.hroiq_policies
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for hroiq_policy_assignments  
CREATE POLICY "Company admins can manage policy assignments"
ON public.hroiq_policy_assignments
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Employees can view their assignments"
ON public.hroiq_policy_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = hroiq_policy_assignments.employee_id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update their acceptance status"
ON public.hroiq_policy_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = hroiq_policy_assignments.employee_id 
    AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = hroiq_policy_assignments.employee_id 
    AND e.user_id = auth.uid()
  )
);

-- RLS Policies for hroiq_policy_versions
CREATE POLICY "Company admins can view policy versions"
ON public.hroiq_policy_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hroiq_policies p 
    WHERE p.id = hroiq_policy_versions.policy_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, p.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "System can insert policy versions"
ON public.hroiq_policy_versions
FOR INSERT
WITH CHECK (true);

-- Create function to handle policy version creation
CREATE OR REPLACE FUNCTION public.create_policy_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert version history when policy is updated
  INSERT INTO public.hroiq_policy_versions (
    policy_id, version, title, body, created_by, change_summary
  ) VALUES (
    NEW.id, NEW.version, NEW.title, NEW.body, NEW.last_updated_by,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Policy created'
      ELSE 'Policy updated'
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for policy version tracking
CREATE TRIGGER create_policy_version_trigger
AFTER INSERT OR UPDATE ON public.hroiq_policies
FOR EACH ROW
EXECUTE FUNCTION public.create_policy_version();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_hroiq_policies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_hroiq_policies_updated_at_trigger
BEFORE UPDATE ON public.hroiq_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_hroiq_policies_updated_at();

-- Create indexes for performance
CREATE INDEX idx_hroiq_policies_company_id ON public.hroiq_policies(company_id);
CREATE INDEX idx_hroiq_policies_status ON public.hroiq_policies(status);
CREATE INDEX idx_hroiq_policy_assignments_policy_id ON public.hroiq_policy_assignments(policy_id);
CREATE INDEX idx_hroiq_policy_assignments_employee_id ON public.hroiq_policy_assignments(employee_id);
CREATE INDEX idx_hroiq_policy_assignments_company_id ON public.hroiq_policy_assignments(company_id);
CREATE INDEX idx_hroiq_policy_versions_policy_id ON public.hroiq_policy_versions(policy_id);