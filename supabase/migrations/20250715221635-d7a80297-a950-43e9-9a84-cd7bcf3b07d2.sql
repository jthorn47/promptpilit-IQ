-- Create sales lifecycle stage enum
CREATE TYPE public.sales_lifecycle_stage AS ENUM (
  'prospect',
  'contacted', 
  'engaged',
  'proposal_sent',
  'in_onboarding',
  'active_paying_client',
  'dormant_churned'
);

-- Add sales tracking columns to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN sales_lifecycle_stage public.sales_lifecycle_stage DEFAULT 'prospect',
ADD COLUMN last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN proposal_sent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN onboarding_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN sales_rep_assigned TEXT,
ADD COLUMN lead_source TEXT,
ADD COLUMN lost_reason TEXT,
ADD COLUMN stage_transition_history JSONB DEFAULT '[]'::jsonb;

-- Update existing companies to have appropriate lifecycle stages based on current data
UPDATE public.company_settings 
SET sales_lifecycle_stage = CASE
  WHEN lifecycle_stage = 'client' THEN 'active_paying_client'::sales_lifecycle_stage
  WHEN lifecycle_stage = 'prospect' THEN 'prospect'::sales_lifecycle_stage
  WHEN lifecycle_stage = 'lead' THEN 'contacted'::sales_lifecycle_stage
  ELSE 'prospect'::sales_lifecycle_stage
END;

-- Create index for performance on sales lifecycle stage queries
CREATE INDEX idx_company_settings_sales_lifecycle_stage 
ON public.company_settings(sales_lifecycle_stage);

-- Create index on last_activity_date for dormant detection
CREATE INDEX idx_company_settings_last_activity_date 
ON public.company_settings(last_activity_date);

-- Add trigger to automatically update stage_transition_history when sales_lifecycle_stage changes
CREATE OR REPLACE FUNCTION public.log_lifecycle_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stage actually changed
  IF OLD.sales_lifecycle_stage IS DISTINCT FROM NEW.sales_lifecycle_stage THEN
    NEW.stage_transition_history = COALESCE(OLD.stage_transition_history, '[]'::jsonb) || 
      jsonb_build_object(
        'from_stage', OLD.sales_lifecycle_stage,
        'to_stage', NEW.sales_lifecycle_stage,
        'changed_at', now(),
        'changed_by', auth.uid()
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_lifecycle_stage_change
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lifecycle_stage_change();