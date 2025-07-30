-- Enhance deals table for advanced Opportunities functionality
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS product_line TEXT CHECK (product_line IN ('HRO', 'Staffing', 'LMS', 'Consulting', 'Other'));
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS spin_situation TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS spin_problem TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS spin_implication TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS spin_need_payoff TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS risk_assessment_id UUID REFERENCES public.assessments(id);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS proposal_id UUID;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS sarah_recommendations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS spin_completion_score INTEGER DEFAULT 0 CHECK (spin_completion_score >= 0 AND spin_completion_score <= 100);

-- Update existing deals to have a default last_activity_date
UPDATE public.deals SET last_activity_date = updated_at WHERE last_activity_date IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_risk_assessment ON public.deals(risk_assessment_id);
CREATE INDEX IF NOT EXISTS idx_deals_last_activity ON public.deals(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_deals_next_follow_up ON public.deals(next_follow_up_date);

-- Create function to calculate SPIN completion score
CREATE OR REPLACE FUNCTION calculate_spin_completion_score(
  situation TEXT,
  problem TEXT,
  implication TEXT,
  need_payoff TEXT
) RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-update SPIN completion score
CREATE OR REPLACE FUNCTION update_spin_completion_score()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deals_spin_score
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_spin_completion_score();

-- Function to generate follow-up tasks for stale opportunities
CREATE OR REPLACE FUNCTION generate_follow_up_tasks()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;