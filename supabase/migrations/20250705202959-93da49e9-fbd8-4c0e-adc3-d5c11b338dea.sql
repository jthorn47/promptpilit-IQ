-- Create CRM core tables for Phase 1

-- Deal stages for pipeline management
CREATE TABLE public.deal_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  probability INTEGER NOT NULL DEFAULT 0, -- percentage chance of closing
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#655DC6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stage_order)
);

-- Leads table for new prospects
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  company_size TEXT,
  source TEXT, -- where did the lead come from
  status TEXT NOT NULL DEFAULT 'new', -- new, qualified, unqualified, converted
  assigned_to UUID, -- sales rep assigned
  lead_score INTEGER DEFAULT 0,
  notes TEXT,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deals/Opportunities table for sales pipeline
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stage_id UUID NOT NULL REFERENCES public.deal_stages(id),
  probability INTEGER NOT NULL DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  lead_id UUID REFERENCES public.leads(id), -- if converted from lead
  assigned_to UUID, -- sales rep assigned
  company_id UUID REFERENCES public.company_settings(id), -- if existing company
  status TEXT NOT NULL DEFAULT 'open', -- open, won, lost
  loss_reason TEXT, -- if lost, why?
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deal activities for tracking interactions
CREATE TABLE public.deal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- call, email, meeting, demo, proposal, etc.
  subject TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default deal stages
INSERT INTO public.deal_stages (name, stage_order, probability, color) VALUES
('Lead', 1, 10, '#94A3B8'),
('Qualified', 2, 25, '#3B82F6'),
('Demo Scheduled', 3, 40, '#8B5CF6'),
('Proposal Sent', 4, 60, '#F59E0B'),
('Negotiation', 5, 80, '#EF4444'),
('Closed Won', 6, 100, '#10B981'),
('Closed Lost', 7, 0, '#6B7280');

-- Enable Row Level Security
ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_stages
CREATE POLICY "Deal stages are viewable by authenticated users" 
ON public.deal_stages FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage deal stages" 
ON public.deal_stages FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for leads
CREATE POLICY "Sales reps can view all leads" 
ON public.leads FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage leads" 
ON public.leads FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for deals
CREATE POLICY "Sales reps can view all deals" 
ON public.deals FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage deals" 
ON public.deals FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for deal_activities
CREATE POLICY "Sales reps can view deal activities" 
ON public.deal_activities FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage deal activities" 
ON public.deal_activities FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_deal_stages_updated_at
  BEFORE UPDATE ON public.deal_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_activities_updated_at
  BEFORE UPDATE ON public.deal_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();