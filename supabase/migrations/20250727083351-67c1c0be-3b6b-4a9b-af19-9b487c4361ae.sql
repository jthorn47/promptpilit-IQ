-- Fix the remaining functions that don't have search_path set

-- 1. Update create_policy_version
CREATE OR REPLACE FUNCTION public.create_policy_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert version history when policy is updated
  INSERT INTO public.hroiq_policy_versions (
    policy_id, version, title, body, created_by, change_summary
  ) VALUES (
    NEW.id, NEW.version, NEW.title, NEW.body, NEW.last_updated_by,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Policy created'
      ELSE 'Policy updated'
    END
  );
  
  RETURN NEW;
END;
$$;

-- 2. Update generate_auto_tasks
CREATE OR REPLACE FUNCTION public.generate_auto_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deal_record RECORD;
  company_record RECORD;
  task_id UUID;
BEGIN
  -- Generate follow-up tasks for deals with no activity in 5+ days
  FOR deal_record IN 
    SELECT d.*, cs.company_name, d.contact_name, d.contact_email, d.assigned_to
    FROM deals d
    JOIN company_settings cs ON d.company_id = cs.id
    WHERE d.status = 'open'
    AND (d.last_activity_date IS NULL OR d.last_activity_date < NOW() - INTERVAL '5 days')
    AND NOT EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.deal_id = d.id 
      AND t.is_auto_generated = true 
      AND t.trigger_reason = 'No activity in 5+ days'
      AND t.created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO public.tasks (
      title, description, type, priority, status, assigned_to, created_by,
      deal_id, company_id, contact_name, contact_email, due_date,
      is_auto_generated, trigger_reason, sarah_generated, auto_generation_metadata
    ) VALUES (
      'Follow-up: ' || deal_record.title,
      'This deal has had no activity for 5+ days. Reach out to maintain momentum and check on status.',
      'follow_up',
      'medium',
      'pending',
      deal_record.assigned_to,
      deal_record.assigned_to,
      deal_record.id,
      deal_record.company_id,
      deal_record.contact_name,
      deal_record.contact_email,
      NOW() + INTERVAL '1 day',
      true,
      'No activity in 5+ days',
      true,
      jsonb_build_object(
        'days_since_activity', EXTRACT(days FROM NOW() - COALESCE(deal_record.last_activity_date, deal_record.created_at)),
        'deal_value', deal_record.value,
        'auto_generated_at', NOW()
      )
    );
  END LOOP;

  -- Generate risk assessment tasks for high-risk deals
  FOR deal_record IN 
    SELECT d.*, cs.company_name, d.contact_name, d.contact_email, d.assigned_to
    FROM deals d
    JOIN company_settings cs ON d.company_id = cs.id
    WHERE d.status = 'open'
    AND COALESCE(d.probability, 50) < 30
    AND NOT EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.deal_id = d.id 
      AND t.is_auto_generated = true 
      AND t.trigger_reason = 'High risk score detected'
      AND t.created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO public.tasks (
      title, description, type, priority, status, assigned_to, created_by,
      deal_id, company_id, contact_name, contact_email, due_date,
      is_auto_generated, trigger_reason, sarah_generated, auto_generation_metadata,
      risk_score
    ) VALUES (
      'Risk Assessment: ' || deal_record.title,
      'Deal probability is below 30%. Consider scheduling consultation or adjusting strategy.',
      'assessment',
      'high',
      'pending',
      deal_record.assigned_to,
      deal_record.assigned_to,
      deal_record.id,
      deal_record.company_id,
      deal_record.contact_name,
      deal_record.contact_email,
      NOW() + INTERVAL '1 day',
      true,
      'High risk score detected',
      true,
      jsonb_build_object(
        'probability', deal_record.probability,
        'deal_value', deal_record.value,
        'auto_generated_at', NOW()
      ),
      100 - COALESCE(deal_record.probability, 50)
    );
  END LOOP;
END;
$$;