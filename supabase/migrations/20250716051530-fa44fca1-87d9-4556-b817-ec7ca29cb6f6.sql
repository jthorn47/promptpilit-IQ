-- Second migration: Update defaults and data after enum values are committed
-- Update default value for new companies to 'lead_new'
ALTER TABLE public.company_settings 
ALTER COLUMN sales_lifecycle_stage SET DEFAULT 'lead_new';

-- Create function to validate lifecycle stage transitions
CREATE OR REPLACE FUNCTION public.validate_lifecycle_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow any transition for now, but log it in the stage_transition_history
  IF OLD.sales_lifecycle_stage IS DISTINCT FROM NEW.sales_lifecycle_stage THEN
    NEW.stage_transition_history = COALESCE(OLD.stage_transition_history, '[]'::jsonb) || 
      jsonb_build_object(
        'from_stage', OLD.sales_lifecycle_stage,
        'to_stage', NEW.sales_lifecycle_stage,
        'changed_at', now(),
        'changed_by', auth.uid(),
        'transition_reason', COALESCE(NEW.notes, 'Stage updated')
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stage transition tracking
DROP TRIGGER IF EXISTS trigger_validate_lifecycle_stage_transition ON public.company_settings;
CREATE TRIGGER trigger_validate_lifecycle_stage_transition
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lifecycle_stage_transition();

-- Update existing data to use new stage values where appropriate
UPDATE public.company_settings 
SET sales_lifecycle_stage = CASE
  WHEN sales_lifecycle_stage = 'prospect' THEN 'lead_new'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'contacted' THEN 'prospect_qualified'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'engaged' THEN 'prospect_qualified'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'proposal_sent' THEN 'proposal_sent'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'active_paying_client' THEN 'client_active'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'dormant_churned' THEN 'client_inactive'::sales_lifecycle_stage
  WHEN sales_lifecycle_stage = 'in_onboarding' THEN 'client_active'::sales_lifecycle_stage
  ELSE 'lead_new'::sales_lifecycle_stage
END
WHERE sales_lifecycle_stage IN ('prospect', 'contacted', 'engaged', 'in_onboarding', 'active_paying_client', 'dormant_churned');

-- Add index for better performance on lifecycle stage queries
CREATE INDEX IF NOT EXISTS idx_company_settings_sales_lifecycle_stage_new 
ON public.company_settings(sales_lifecycle_stage) 
WHERE sales_lifecycle_stage IN ('lead_new', 'prospect_qualified', 'proposal_sent', 'client_active', 'client_inactive', 'disqualified_no_fit');