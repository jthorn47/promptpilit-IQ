-- CRM Gamification Schema Extensions

-- CRM Leaderboard tracking table
CREATE TABLE IF NOT EXISTS public.crm_leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_settings(id) ON DELETE CASCADE,
  score_type text NOT NULL CHECK (score_type IN ('pipeline_value', 'spin_completion', 'tasks_completed', 'proposals_sent', 'proposals_signed', 'opportunities_created', 'activity_score')),
  score_value numeric NOT NULL DEFAULT 0,
  time_period text NOT NULL CHECK (time_period IN ('week', 'month', 'all_time')),
  period_start date NOT NULL,
  period_end date,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Historical season tracking
CREATE TABLE IF NOT EXISTS public.crm_season_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name text NOT NULL,
  season_period text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_settings(id) ON DELETE CASCADE,
  category text NOT NULL,
  score_value numeric NOT NULL,
  rank integer NOT NULL CHECK (rank > 0),
  medal text CHECK (medal IN ('gold', 'silver', 'bronze')),
  created_at timestamptz DEFAULT now()
);

-- CRM Gamification settings
CREATE TABLE IF NOT EXISTS public.crm_gamification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  leaderboard_enabled boolean DEFAULT true,
  achievements_enabled boolean DEFAULT true,
  public_leaderboard boolean DEFAULT true,
  scoring_weights jsonb DEFAULT '{
    "spin_completion": 100,
    "proposal_sent": 150,
    "proposal_signed": 500,
    "opportunity_created": 50,
    "task_completed": 25,
    "deal_closed": 1000,
    "ai_usage": 10
  }',
  achievement_thresholds jsonb DEFAULT '{
    "spin_master": 10,
    "closer_threshold": 50000,
    "task_slayer": 20,
    "fast_starter": 5,
    "pitch_pro": 5,
    "ai_believer": 10,
    "followup_freak": 3,
    "pipeline_builder": 100000
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_leaderboard_scores_user_period 
  ON public.crm_leaderboard_scores(user_id, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_crm_leaderboard_scores_company_period 
  ON public.crm_leaderboard_scores(company_id, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_crm_season_winners_season 
  ON public.crm_season_winners(season_period, category, rank);

-- RLS Policies
ALTER TABLE public.crm_leaderboard_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_season_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_gamification_settings ENABLE ROW LEVEL SECURITY;

-- Leaderboard scores policies
CREATE POLICY "Users can view leaderboard scores for their company" 
  ON public.crm_leaderboard_scores 
  FOR SELECT 
  USING (
    company_id IS NULL OR 
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    user_id = auth.uid()
  );

CREATE POLICY "System can manage leaderboard scores" 
  ON public.crm_leaderboard_scores 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Season winners policies
CREATE POLICY "Users can view season winners for their company" 
  ON public.crm_season_winners 
  FOR SELECT 
  USING (
    company_id IS NULL OR 
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage season winners" 
  ON public.crm_season_winners 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Gamification settings policies
CREATE POLICY "Company admins can manage gamification settings" 
  ON public.crm_gamification_settings 
  FOR ALL 
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Insert CRM-specific achievement definitions (using existing valid types)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.achievement_definitions WHERE name = 'SPIN Master') THEN
    INSERT INTO public.achievement_definitions (name, description, achievement_type, points, criteria, icon, badge_color) VALUES
    ('SPIN Master', 'Complete 10 SPIN assessments', 'milestone', 500, '{"type": "spin_completions", "target": 10}', 'target', '#10B981'),
    ('Closer', 'Close $50K+ in proposals', 'milestone', 1000, '{"type": "closed_value", "target": 50000}', 'trophy', '#F59E0B'),
    ('Task Slayer', 'Complete 20+ tasks in a week', 'milestone', 300, '{"type": "weekly_tasks", "target": 20}', 'zap', '#8B5CF6'),
    ('Fast Starter', 'Create 5 opportunities in one day', 'milestone', 400, '{"type": "daily_opportunities", "target": 5}', 'rocket', '#EF4444'),
    ('Pitch Pro', 'Sign 5 proposals in one week', 'milestone', 800, '{"type": "weekly_proposals", "target": 5}', 'file-text', '#3B82F6'),
    ('AI Believer', 'Use Sarah 10 times in a week', 'milestone', 200, '{"type": "weekly_ai_usage", "target": 10}', 'brain', '#EC4899'),
    ('Follow-Up Freak', 'Follow up 3+ times on one opportunity', 'milestone', 250, '{"type": "opportunity_followups", "target": 3}', 'message-circle', '#06B6D4'),
    ('Pipeline Builder', 'Build $100K+ in pipeline value', 'milestone', 1200, '{"type": "pipeline_value", "target": 100000}', 'trending-up', '#10B981'),
    ('Streak Master', '5 consecutive days of CRM activity', 'milestone', 350, '{"type": "activity_streak", "target": 5}', 'flame', '#F59E0B'),
    ('Top Rep', 'Rank #1 on monthly leaderboard', 'milestone', 1500, '{"type": "monthly_rank", "target": 1}', 'crown', '#F59E0B');
  END IF;
END $$;

-- Trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION update_crm_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_leaderboard_scores_updated_at
  BEFORE UPDATE ON public.crm_leaderboard_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_gamification_updated_at();

CREATE TRIGGER update_crm_gamification_settings_updated_at
  BEFORE UPDATE ON public.crm_gamification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_gamification_updated_at();