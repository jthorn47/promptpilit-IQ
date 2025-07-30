-- Add SLA fields to pulse_cases table
ALTER TABLE public.pulse_cases 
ADD COLUMN IF NOT EXISTS sla_status text DEFAULT 'on_track' CHECK (sla_status IN ('on_track', 'warning', 'violated')),
ADD COLUMN IF NOT EXISTS sla_violation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS escalation_sent_at timestamp with time zone;

-- Update existing records to set last_activity_at to updated_at
UPDATE public.pulse_cases 
SET last_activity_at = updated_at 
WHERE last_activity_at IS NULL;

-- Create function to update last_activity_at on pulse_cases updates
CREATE OR REPLACE FUNCTION public.update_pulse_case_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_activity_at
DROP TRIGGER IF EXISTS update_pulse_case_activity_trigger ON public.pulse_cases;
CREATE TRIGGER update_pulse_case_activity_trigger
  BEFORE UPDATE ON public.pulse_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pulse_case_activity();

-- Create function to check and update SLA status
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get cases needing follow-up (24h+ with no follow-up sent)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get cases needing escalation (48h+ with no escalation sent)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;