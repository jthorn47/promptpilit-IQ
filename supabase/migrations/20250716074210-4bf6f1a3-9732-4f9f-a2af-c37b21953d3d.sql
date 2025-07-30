-- Create proposal approvals table to track admin approval workflow
CREATE TABLE public.proposal_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL, -- References the proposal
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  submitted_by UUID NOT NULL, -- User who submitted for approval
  approved_by UUID, -- Admin who approved (nullable until approved)
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_notes TEXT,
  proposal_data JSONB NOT NULL DEFAULT '{}', -- Snapshot of proposal data at submission
  risk_score INTEGER,
  investment_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies for proposal approvals
CREATE POLICY "Company users can view their proposal approvals" 
ON public.proposal_approvals 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  submitted_by = auth.uid()
);

CREATE POLICY "Company users can create proposal approvals" 
ON public.proposal_approvals 
FOR INSERT 
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can update proposal approvals" 
ON public.proposal_approvals 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_proposal_approvals_status ON public.proposal_approvals(status);
CREATE INDEX idx_proposal_approvals_company_id ON public.proposal_approvals(company_id);

-- Create trigger for updated_at
CREATE TRIGGER update_proposal_approvals_updated_at
  BEFORE UPDATE ON public.proposal_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();