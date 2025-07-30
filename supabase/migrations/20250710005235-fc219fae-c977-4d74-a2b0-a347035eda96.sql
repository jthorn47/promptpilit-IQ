-- POP Platform Database Schema (Fixed)

-- Partner Office Program (POP) Tiers
CREATE TYPE pop_tier AS ENUM ('mention', 'growth', 'senior_pop');

-- POP Status
CREATE TYPE pop_status AS ENUM ('pending', 'active', 'suspended', 'terminated');

-- Client Status
CREATE TYPE client_status AS ENUM ('pending_approval', 'approved', 'rejected', 'suspended');

-- Job Order Status
CREATE TYPE job_order_status AS ENUM ('open', 'in_progress', 'filled', 'cancelled', 'on_hold');

-- Candidate Status
CREATE TYPE candidate_status AS ENUM ('submitted', 'screening', 'interviewed', 'hired', 'rejected');

-- Document Types
CREATE TYPE document_type AS ENUM ('w9', 'ach', 'business_license', 'credit_app', 'ex_mod', 'job_site_inspection', 'claim_report');

-- POPs (Partner Office Participants) Table
CREATE TABLE public.pops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  tier pop_tier NOT NULL DEFAULT 'mention',
  status pop_status NOT NULL DEFAULT 'pending',
  territory_state TEXT,
  territory_city TEXT,
  territory_zip_codes TEXT[],
  commission_rate DECIMAL(5,2) DEFAULT 30.00,
  senior_pop_id UUID REFERENCES public.pops(id),
  onboarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(territory_state, territory_city)
);

-- POP Documents Table
CREATE TABLE public.pop_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pop_id UUID NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Clients Table
CREATE TABLE public.pop_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pop_id UUID NOT NULL REFERENCES public.pops(id),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  industry TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  workers_comp_rate DECIMAL(5,2),
  pricing_markup DECIMAL(5,2),
  status client_status NOT NULL DEFAULT 'pending_approval',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Documents Table
CREATE TABLE public.pop_client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.pop_clients(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Job Orders Table
CREATE TABLE public.pop_job_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.pop_clients(id),
  pop_id UUID NOT NULL REFERENCES public.pops(id),
  assigned_recruiter_id UUID REFERENCES auth.users(id),
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  pay_rate DECIMAL(10,2) NOT NULL,
  markup_percentage DECIMAL(5,2) NOT NULL,
  bill_rate DECIMAL(10,2) GENERATED ALWAYS AS (pay_rate * (1 + markup_percentage / 100)) STORED,
  location TEXT NOT NULL,
  shift TEXT,
  positions_needed INTEGER NOT NULL DEFAULT 1,
  positions_filled INTEGER NOT NULL DEFAULT 0,
  requirements TEXT[],
  start_date DATE,
  end_date DATE,
  status job_order_status NOT NULL DEFAULT 'open',
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidates Table
CREATE TABLE public.pop_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_order_id UUID NOT NULL REFERENCES public.pop_job_orders(id),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  status candidate_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hired_at TIMESTAMP WITH TIME ZONE,
  hourly_rate DECIMAL(10,2),
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commission Tracking Table
CREATE TABLE public.pop_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pop_id UUID NOT NULL REFERENCES public.pops(id),
  recruiter_id UUID REFERENCES auth.users(id),
  job_order_id UUID NOT NULL REFERENCES public.pop_job_orders(id),
  candidate_id UUID REFERENCES public.pop_candidates(id),
  commission_type TEXT NOT NULL,
  gross_profit DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  invoice_collected BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  pay_period_start DATE,
  pay_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform Fees Table
CREATE TABLE public.pop_platform_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pop_id UUID NOT NULL REFERENCES public.pops(id),
  gross_profit_ytd DECIMAL(10,2) NOT NULL,
  fee_rate DECIMAL(5,2) NOT NULL,
  fee_amount DECIMAL(10,2) NOT NULL,
  invoice_amount DECIMAL(10,2) NOT NULL,
  fee_period_start DATE,
  fee_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications Table
CREATE TABLE public.pop_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pops_territory ON public.pops(territory_state, territory_city);
CREATE INDEX idx_pops_senior_pop ON public.pops(senior_pop_id);
CREATE INDEX idx_pop_clients_pop ON public.pop_clients(pop_id);
CREATE INDEX idx_pop_clients_status ON public.pop_clients(status);
CREATE INDEX idx_pop_job_orders_client ON public.pop_job_orders(client_id);
CREATE INDEX idx_pop_job_orders_pop ON public.pop_job_orders(pop_id);
CREATE INDEX idx_pop_job_orders_recruiter ON public.pop_job_orders(assigned_recruiter_id);
CREATE INDEX idx_pop_job_orders_status ON public.pop_job_orders(status);
CREATE INDEX idx_pop_candidates_job_order ON public.pop_candidates(job_order_id);
CREATE INDEX idx_pop_candidates_recruiter ON public.pop_candidates(recruiter_id);
CREATE INDEX idx_pop_candidates_status ON public.pop_candidates(status);
CREATE INDEX idx_pop_commissions_pop ON public.pop_commissions(pop_id);
CREATE INDEX idx_pop_commissions_recruiter ON public.pop_commissions(recruiter_id);
CREATE INDEX idx_pop_notifications_recipient ON public.pop_notifications(recipient_id);

-- Enable Row Level Security
ALTER TABLE public.pops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for POPs
CREATE POLICY "POPs can view their own data"
ON public.pops FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage all POPs"
ON public.pops FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Clients
CREATE POLICY "POPs can manage their clients"
ON public.pop_clients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_clients.pop_id AND p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for Job Orders
CREATE POLICY "POPs and assigned recruiters can view job orders"
ON public.pop_job_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_job_orders.pop_id AND p.user_id = auth.uid()
  ) OR 
  assigned_recruiter_id = auth.uid() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "POPs can manage their job orders"
ON public.pop_job_orders FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_job_orders.pop_id AND p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "POPs can update their job orders"
ON public.pop_job_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_job_orders.pop_id AND p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "POPs can delete their job orders"
ON public.pop_job_orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_job_orders.pop_id AND p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for Candidates
CREATE POLICY "Recruiters and POPs can view candidates"
ON public.pop_candidates FOR SELECT
USING (
  recruiter_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.pop_job_orders jo
    JOIN public.pops p ON jo.pop_id = p.id
    WHERE jo.id = pop_candidates.job_order_id AND p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Recruiters can manage their candidates"
ON public.pop_candidates FOR ALL
USING (recruiter_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Commissions
CREATE POLICY "POPs and recruiters can view their commissions"
ON public.pop_commissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pops p
    WHERE p.id = pop_commissions.pop_id AND p.user_id = auth.uid()
  ) OR 
  recruiter_id = auth.uid() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their notifications"
ON public.pop_notifications FOR SELECT
USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.pop_notifications FOR INSERT
WITH CHECK (true);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_pops_updated_at
  BEFORE UPDATE ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pop_clients_updated_at
  BEFORE UPDATE ON public.pop_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pop_job_orders_updated_at
  BEFORE UPDATE ON public.pop_job_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pop_candidates_updated_at
  BEFORE UPDATE ON public.pop_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pop_commissions_updated_at
  BEFORE UPDATE ON public.pop_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();