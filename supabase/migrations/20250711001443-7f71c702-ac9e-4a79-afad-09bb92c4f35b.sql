-- Create timecard periods table
CREATE TABLE public.timecard_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_name TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'processing', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PTO requests table
CREATE TABLE public.pto_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick', 'personal', 'holiday', 'bereavement')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested DECIMAL(5,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PTO balances table
CREATE TABLE public.pto_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  pto_type TEXT NOT NULL,
  available_hours DECIMAL(6,2) DEFAULT 0,
  used_hours DECIMAL(6,2) DEFAULT 0,
  accrued_hours DECIMAL(6,2) DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, pto_type, year)
);

-- Enable Row Level Security
ALTER TABLE public.timecard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timecard_periods
CREATE POLICY "Company users can view timecard periods" 
ON public.timecard_periods FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
       has_company_role(auth.uid(), 'learner'::app_role, company_id) OR 
       has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage timecard periods" 
ON public.timecard_periods FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for pto_requests
CREATE POLICY "Employees can view their own PTO requests" 
ON public.pto_requests FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Company admins can view all PTO requests" 
ON public.pto_requests FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Employees can insert their own PTO requests" 
ON public.pto_requests FOR INSERT 
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Company admins can manage PTO requests" 
ON public.pto_requests FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for pto_balances
CREATE POLICY "Employees can view their own PTO balances" 
ON public.pto_balances FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Company admins can view all PTO balances" 
ON public.pto_balances FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage PTO balances" 
ON public.pto_balances FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_timecard_periods_company ON public.timecard_periods(company_id);
CREATE INDEX idx_pto_requests_employee ON public.pto_requests(employee_id);
CREATE INDEX idx_pto_balances_employee ON public.pto_balances(employee_id, year);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_timecard_periods_updated_at
  BEFORE UPDATE ON public.timecard_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pto_requests_updated_at
  BEFORE UPDATE ON public.pto_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pto_balances_updated_at
  BEFORE UPDATE ON public.pto_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();