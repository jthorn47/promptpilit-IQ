-- Create immutable audit trail system for Time Track
CREATE TABLE public.time_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END',
    'PUNCH_EDIT', 'PUNCH_DELETE', 'MISSED_PUNCH_CORRECTION',
    'TIMECARD_APPROVAL', 'TIMECARD_REJECTION', 'TIMECARD_LOCK',
    'PAYROLL_EXPORT', 'SCHEDULE_OVERRIDE', 'ADMIN_CORRECTION'
  )),
  performed_by_user_id UUID NOT NULL,
  performed_by_role TEXT NOT NULL CHECK (performed_by_role IN (
    'employee', 'supervisor', 'admin', 'super_admin', 'system'
  )),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_value JSONB,
  new_value JSONB,
  source TEXT NOT NULL CHECK (source IN (
    'kiosk', 'mobile_app', 'web_portal', 'admin_panel', 'api', 'system'
  )),
  device_id TEXT,
  ip_address INET,
  notes TEXT,
  company_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_time_audit_logs_employee_id ON public.time_audit_logs(employee_id);
CREATE INDEX idx_time_audit_logs_timestamp ON public.time_audit_logs(timestamp);
CREATE INDEX idx_time_audit_logs_action_type ON public.time_audit_logs(action_type);
CREATE INDEX idx_time_audit_logs_company_id ON public.time_audit_logs(company_id);
CREATE INDEX idx_time_audit_logs_performed_by ON public.time_audit_logs(performed_by_user_id);

-- Enable RLS
ALTER TABLE public.time_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies - read-only for company users, insert for system
CREATE POLICY "Company admins can view audit logs" 
ON public.time_audit_logs 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert audit logs" 
ON public.time_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES - IMMUTABLE

-- Function to log time tracking actions
CREATE OR REPLACE FUNCTION public.log_time_tracking_action(
  p_employee_id UUID,
  p_action_type TEXT,
  p_performed_by_user_id UUID,
  p_performed_by_role TEXT,
  p_previous_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_source TEXT DEFAULT 'web_portal',
  p_device_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
  resolved_company_id UUID;
BEGIN
  -- Get company_id if not provided
  IF p_company_id IS NULL THEN
    SELECT company_id INTO resolved_company_id
    FROM employees
    WHERE id = p_employee_id;
  ELSE
    resolved_company_id := p_company_id;
  END IF;
  
  INSERT INTO public.time_audit_logs (
    employee_id,
    action_type,
    performed_by_user_id,
    performed_by_role,
    previous_value,
    new_value,
    source,
    device_id,
    ip_address,
    notes,
    company_id
  ) VALUES (
    p_employee_id,
    p_action_type,
    p_performed_by_user_id,
    p_performed_by_role,
    p_previous_value,
    p_new_value,
    p_source,
    p_device_id,
    p_notes,
    resolved_company_id
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION public.auto_log_time_tracking_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type_val TEXT;
  performed_by UUID;
  user_role TEXT;
  company_id_val UUID;
BEGIN
  -- Determine action type
  action_type_val := CASE TG_OP
    WHEN 'INSERT' THEN 
      CASE 
        WHEN TG_TABLE_NAME = 'employee_punches' THEN 
          CASE NEW.punch_type
            WHEN 'clock_in' THEN 'CLOCK_IN'
            WHEN 'clock_out' THEN 'CLOCK_OUT'
            WHEN 'break_start' THEN 'BREAK_START'
            WHEN 'break_end' THEN 'BREAK_END'
            ELSE 'PUNCH_EDIT'
          END
        ELSE 'TIMECARD_APPROVAL'
      END
    WHEN 'UPDATE' THEN 'PUNCH_EDIT'
    WHEN 'DELETE' THEN 'PUNCH_DELETE'
  END;
  
  -- Get current user
  performed_by := auth.uid();
  
  -- Get user role (simplified)
  SELECT CASE 
    WHEN has_role(performed_by, 'super_admin'::app_role) THEN 'super_admin'
    WHEN has_role(performed_by, 'company_admin'::app_role) THEN 'admin'
    ELSE 'employee'
  END INTO user_role;
  
  -- Get company_id
  IF TG_TABLE_NAME = 'employee_punches' THEN
    SELECT e.company_id INTO company_id_val
    FROM employees e
    WHERE e.id = COALESCE(NEW.employee_id, OLD.employee_id);
  END IF;
  
  -- Log the action
  PERFORM public.log_time_tracking_action(
    COALESCE(NEW.employee_id, OLD.employee_id),
    action_type_val,
    performed_by,
    user_role,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'web_portal',
    NULL,
    NULL,
    NULL,
    company_id_val
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;