-- Create time scores table for employee weekly performance tracking
CREATE TABLE IF NOT EXISTS public.time_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  breakdown_json jsonb NOT NULL DEFAULT '{}',
  calculation_factors jsonb NOT NULL DEFAULT '{}',
  submitted_on_time boolean DEFAULT false,
  no_missing_days boolean DEFAULT false,
  entries_match_schedule boolean DEFAULT false,
  notes_included boolean DEFAULT false,
  approved_without_changes boolean DEFAULT false,
  overtime_violations integer DEFAULT 0,
  missed_days integer DEFAULT 0,
  manager_flags integer DEFAULT 0,
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, week_start)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_time_scores_employee_week ON public.time_scores(employee_id, week_start);
CREATE INDEX IF NOT EXISTS idx_time_scores_company_id ON public.time_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_time_scores_score ON public.time_scores(total_score);
CREATE INDEX IF NOT EXISTS idx_time_scores_week_start ON public.time_scores(week_start);

-- Enable RLS
ALTER TABLE public.time_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Company users can view time scores" ON public.time_scores
  FOR SELECT
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = time_scores.employee_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can manage time scores" ON public.time_scores
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_time_scores_updated_at
  BEFORE UPDATE ON public.time_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();