-- Create time_policies table to store company time and overtime policies
CREATE TABLE IF NOT EXISTS public.time_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  policy_name TEXT NOT NULL DEFAULT 'Default Policy',
  state TEXT NOT NULL,
  daily_overtime_threshold NUMERIC(4,2) NOT NULL DEFAULT 8.0,
  daily_doubletime_threshold NUMERIC(4,2) NOT NULL DEFAULT 12.0,
  weekly_overtime_threshold NUMERIC(4,2) NOT NULL DEFAULT 40.0,
  seven_day_rule BOOLEAN NOT NULL DEFAULT true,
  workweek_start_day TEXT NOT NULL DEFAULT 'Monday',
  custom_rules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT workweek_start_day_check CHECK (
    workweek_start_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  ),
  CONSTRAINT state_code_check CHECK (
    LENGTH(state) = 2 AND state = UPPER(state)
  )
);

-- Enable RLS
ALTER TABLE public.time_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage time policies"
ON public.time_policies
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create time_policy_audit_trail table for tracking changes
CREATE TABLE IF NOT EXISTS public.time_policy_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.time_policies(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT action_type_check CHECK (
    action_type IN ('created', 'updated', 'activated', 'deactivated', 'deleted')
  )
);

-- Enable RLS for audit trail
ALTER TABLE public.time_policy_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS for audit trail
CREATE POLICY "Company admins can view time policy audit trail"
ON public.time_policy_audit_trail
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.time_policies tp
    WHERE tp.id = time_policy_audit_trail.policy_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, tp.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create time_compliance_violations table for tracking violations
CREATE TABLE IF NOT EXISTS public.time_compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES public.time_policies(id),
  violation_type TEXT NOT NULL,
  violation_date DATE NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL,
  threshold_exceeded NUMERIC(4,2) NOT NULL,
  overtime_hours NUMERIC(4,2),
  doubletime_hours NUMERIC(4,2),
  violation_details JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT violation_type_check CHECK (
    violation_type IN ('daily_overtime', 'daily_doubletime', 'weekly_overtime', 'seven_day_violation', 'custom_rule')
  ),
  CONSTRAINT severity_check CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  )
);

-- Enable RLS for violations
ALTER TABLE public.time_compliance_violations ENABLE ROW LEVEL SECURITY;

-- RLS for violations
CREATE POLICY "Company admins can manage compliance violations"
ON public.time_compliance_violations
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create triggers for audit logging and updated_at
CREATE OR REPLACE FUNCTION public.update_time_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_policies_updated_at
  BEFORE UPDATE ON public.time_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_time_policy_updated_at();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION public.log_time_policy_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if this is an actual change
  IF TG_OP = 'UPDATE' AND OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.time_policy_audit_trail (
    policy_id,
    action_type,
    old_values,
    new_values,
    changed_fields,
    performed_by
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN 'updated'
      WHEN 'DELETE' THEN 'deleted'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW)) 
          WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
        )
      ELSE NULL
    END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_time_policy_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.time_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_time_policy_changes();

-- Insert default California policy as example
INSERT INTO public.time_policies (
  company_id,
  policy_name,
  state,
  daily_overtime_threshold,
  daily_doubletime_threshold,
  weekly_overtime_threshold,
  seven_day_rule,
  workweek_start_day,
  custom_rules
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder company_id
  'California Standard Policy',
  'CA',
  8.0,
  12.0,
  40.0,
  true,
  'Monday',
  '[]'::jsonb
) ON CONFLICT DO NOTHING;