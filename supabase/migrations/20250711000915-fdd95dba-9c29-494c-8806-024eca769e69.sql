-- Create time entries table for punch in/out records
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  punch_in_time TIMESTAMP WITH TIME ZONE,
  punch_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  regular_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  total_hours DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'edited')),
  notes TEXT,
  location_id UUID,
  job_code TEXT,
  is_holiday BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE
);

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
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timecard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Employees can view their own time entries" 
ON public.time_entries FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Company admins can manage time entries" 
ON public.time_entries FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Employees can insert their own time entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their pending time entries" 
ON public.time_entries FOR UPDATE 
USING (employee_id = auth.uid() AND status = 'pending');

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
CREATE INDEX idx_time_entries_employee_date ON public.time_entries(employee_id, entry_date);
CREATE INDEX idx_time_entries_company_date ON public.time_entries(company_id, entry_date);
CREATE INDEX idx_pto_requests_employee ON public.pto_requests(employee_id);
CREATE INDEX idx_pto_balances_employee ON public.pto_balances(employee_id, year);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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