-- Create client_time_settings table for TimeTrack compliance rules
CREATE TABLE IF NOT EXISTS public.client_time_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  daily_ot_threshold INTEGER NOT NULL DEFAULT 8,
  daily_dt_threshold INTEGER NOT NULL DEFAULT 12,
  weekly_ot_threshold INTEGER NOT NULL DEFAULT 40,
  seven_day_rule BOOLEAN NOT NULL DEFAULT false,
  workweek_start_day TEXT NOT NULL DEFAULT 'Monday',
  custom_rule_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_daily_ot_threshold CHECK (daily_ot_threshold > 0 AND daily_ot_threshold <= 24),
  CONSTRAINT valid_daily_dt_threshold CHECK (daily_dt_threshold > 0 AND daily_dt_threshold <= 24),
  CONSTRAINT valid_weekly_ot_threshold CHECK (weekly_ot_threshold >= 40 AND weekly_ot_threshold <= 168),
  CONSTRAINT valid_workweek_start_day CHECK (workweek_start_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  CONSTRAINT valid_state CHECK (state ~ '^[A-Z]{2}$'),
  
  -- Ensure one settings record per client
  CONSTRAINT unique_client_time_settings UNIQUE (client_id)
);

-- Create index for quick client lookups
CREATE INDEX IF NOT EXISTS idx_client_time_settings_client_id ON public.client_time_settings(client_id);

-- Enable RLS
ALTER TABLE public.client_time_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can view client time settings" ON public.client_time_settings
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can insert client time settings" ON public.client_time_settings
  FOR INSERT WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can update client time settings" ON public.client_time_settings
  FOR UPDATE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  ) WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can delete client time settings" ON public.client_time_settings
  FOR DELETE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_client_time_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_client_time_settings_updated_at
  BEFORE UPDATE ON public.client_time_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_time_settings_updated_at();

-- Auto-create default settings function
CREATE OR REPLACE FUNCTION public.create_default_client_time_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default time settings for new clients
  INSERT INTO public.client_time_settings (
    client_id,
    state,
    daily_ot_threshold,
    daily_dt_threshold,
    weekly_ot_threshold,
    seven_day_rule,
    workweek_start_day,
    custom_rule_notes
  ) VALUES (
    NEW.id,
    'CA',  -- Default to California
    8,     -- 8 hours daily OT
    12,    -- 12 hours daily DT
    40,    -- 40 hours weekly OT
    false, -- 7-day rule disabled
    'Monday',
    ''
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger to auto-generate settings for new company_settings entries
CREATE TRIGGER auto_create_client_time_settings
  AFTER INSERT ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_client_time_settings();