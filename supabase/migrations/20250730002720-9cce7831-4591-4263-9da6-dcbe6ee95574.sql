-- Fix search path for functions and add missing fields
SET search_path TO public;

-- Add missing fields to pulse_cases if they don't exist
ALTER TABLE public.pulse_cases 
ADD COLUMN IF NOT EXISTS employee_name text,
ADD COLUMN IF NOT EXISTS client_name text;

-- Update functions to include search_path
CREATE OR REPLACE FUNCTION public.update_pulse_case_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_sla_violations()
RETURNS void AS $$
DECLARE
  case_record RECORD;
  hours_since_activity integer;
BEGIN
  -- Check all open cases
  FOR case_record IN 
    SELECT id, last_activity_at, sla_status, follow_up_sent_at, escalation_sent_at, status
    FROM public.pulse_cases 
    WHERE status IN ('open', 'in_progress') 
  LOOP
    -- Calculate hours since last activity
    hours_since_activity := EXTRACT(EPOCH FROM (now() - case_record.last_activity_at)) / 3600;
    
    -- Update SLA status based on time elapsed
    IF hours_since_activity >= 48 THEN
      -- 48+ hours: SLA violated
      UPDATE public.pulse_cases 
      SET sla_status = 'violated', sla_violation = true
      WHERE id = case_record.id AND sla_status != 'violated';
      
    ELSIF hours_since_activity >= 24 THEN
      -- 24+ hours: Warning
      UPDATE public.pulse_cases 
      SET sla_status = 'warning'
      WHERE id = case_record.id AND sla_status = 'on_track';
      
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_cases_needing_followup()
RETURNS TABLE(
  case_id uuid,
  phone_number text,
  employee_name text,
  issue_category text,
  hours_since_activity numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id as case_id,
    sc.phone_number,
    pc.employee_name,
    pc.issue_category,
    ROUND(EXTRACT(EPOCH FROM (now() - pc.last_activity_at)) / 3600, 1) as hours_since_activity
  FROM public.pulse_cases pc
  LEFT JOIN public.sms_conversations sc ON sc.case_id = pc.id
  WHERE pc.status IN ('open', 'in_progress')
    AND EXTRACT(EPOCH FROM (now() - pc.last_activity_at)) / 3600 >= 24
    AND (pc.follow_up_sent_at IS NULL OR pc.follow_up_sent_at < pc.last_activity_at)
    AND sc.phone_number IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_cases_needing_escalation()
RETURNS TABLE(
  case_id uuid,
  employee_name text,
  issue_category text,
  client_name text,
  hours_since_activity numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id as case_id,
    pc.employee_name,
    pc.issue_category,
    COALESCE(c.company_name, pc.client_name) as client_name,
    ROUND(EXTRACT(EPOCH FROM (now() - pc.last_activity_at)) / 3600, 1) as hours_since_activity
  FROM public.pulse_cases pc
  LEFT JOIN public.clients c ON c.id = pc.client_id
  WHERE pc.status IN ('open', 'in_progress')
    AND EXTRACT(EPOCH FROM (now() - pc.last_activity_at)) / 3600 >= 48
    AND (pc.escalation_sent_at IS NULL OR pc.escalation_sent_at < pc.last_activity_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;