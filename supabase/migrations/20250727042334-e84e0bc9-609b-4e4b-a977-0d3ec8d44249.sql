-- Fix function security warnings by adding search_path
CREATE OR REPLACE FUNCTION calculate_spin_completion_score(
  situation TEXT,
  problem TEXT,
  implication TEXT,
  need_payoff TEXT
) RETURNS INTEGER 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  IF situation IS NOT NULL AND LENGTH(TRIM(situation)) > 10 THEN
    score := score + 25;
  END IF;
  
  IF problem IS NOT NULL AND LENGTH(TRIM(problem)) > 10 THEN
    score := score + 25;
  END IF;
  
  IF implication IS NOT NULL AND LENGTH(TRIM(implication)) > 10 THEN
    score := score + 25;
  END IF;
  
  IF need_payoff IS NOT NULL AND LENGTH(TRIM(need_payoff)) > 10 THEN
    score := score + 25;
  END IF;
  
  RETURN score;
END;
$$;

CREATE OR REPLACE FUNCTION update_spin_completion_score()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.spin_completion_score := calculate_spin_completion_score(
    NEW.spin_situation,
    NEW.spin_problem,
    NEW.spin_implication,
    NEW.spin_need_payoff
  );
  
  -- Update last activity date on any change
  NEW.last_activity_date := now();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_follow_up_tasks()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deal_record RECORD;
BEGIN
  -- Find deals with no activity in 5+ days and no existing follow-up
  FOR deal_record IN
    SELECT id, title, company_id, assigned_to, last_activity_date
    FROM public.deals
    WHERE status = 'open'
    AND last_activity_date < now() - INTERVAL '5 days'
    AND (next_follow_up_date IS NULL OR next_follow_up_date < now())
  LOOP
    -- Create follow-up activity
    INSERT INTO public.activities (
      type,
      status,
      subject,
      description,
      deal_id,
      company_id,
      assigned_to,
      created_by,
      priority,
      scheduled_at
    ) VALUES (
      'follow_up',
      'pending',
      'Follow up on opportunity: ' || deal_record.title,
      'Auto-generated follow-up task. No activity recorded in 5+ days.',
      deal_record.id,
      deal_record.company_id,
      deal_record.assigned_to,
      deal_record.assigned_to,
      'high',
      now() + INTERVAL '1 day'
    );
    
    -- Update next follow-up date
    UPDATE public.deals 
    SET next_follow_up_date = now() + INTERVAL '3 days'
    WHERE id = deal_record.id;
  END LOOP;
END;
$$;