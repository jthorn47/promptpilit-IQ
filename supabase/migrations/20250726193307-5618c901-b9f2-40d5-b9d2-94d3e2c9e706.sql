-- Create client_location_time_rules table for location-specific time compliance rules
CREATE TABLE IF NOT EXISTS public.client_location_time_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  daily_ot_threshold INTEGER NOT NULL DEFAULT 8,
  daily_dt_threshold INTEGER NOT NULL DEFAULT 12,
  weekly_ot_threshold INTEGER NOT NULL DEFAULT 40,
  seven_day_rule BOOLEAN NOT NULL DEFAULT false,
  workweek_start_day TEXT NOT NULL DEFAULT 'Monday',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_location_daily_ot_threshold CHECK (daily_ot_threshold > 0 AND daily_ot_threshold <= 24),
  CONSTRAINT valid_location_daily_dt_threshold CHECK (daily_dt_threshold > 0 AND daily_dt_threshold <= 24),
  CONSTRAINT valid_location_weekly_ot_threshold CHECK (weekly_ot_threshold >= 40 AND weekly_ot_threshold <= 168),
  CONSTRAINT valid_location_workweek_start_day CHECK (workweek_start_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  CONSTRAINT valid_location_state CHECK (state ~ '^[A-Z]{2}$'),
  
  -- Ensure unique location name per client
  CONSTRAINT unique_client_location_name UNIQUE (client_id, location_name)
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_client_location_time_rules_client_id ON public.client_location_time_rules(client_id);
CREATE INDEX IF NOT EXISTS idx_client_location_time_rules_location_name ON public.client_location_time_rules(client_id, location_name);

-- Enable RLS
ALTER TABLE public.client_location_time_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can view location time rules" ON public.client_location_time_rules
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can insert location time rules" ON public.client_location_time_rules
  FOR INSERT WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can update location time rules" ON public.client_location_time_rules
  FOR UPDATE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  ) WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can delete location time rules" ON public.client_location_time_rules
  FOR DELETE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create trigger for updated_at
CREATE TRIGGER update_client_location_time_rules_updated_at
  BEFORE UPDATE ON public.client_location_time_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_time_settings_updated_at();