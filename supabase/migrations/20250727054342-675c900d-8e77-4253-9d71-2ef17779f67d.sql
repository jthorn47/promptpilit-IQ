-- Enable Row Level Security on all CRM tables
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_spin_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activity_log ENABLE ROW LEVEL SECURITY;