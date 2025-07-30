-- Add detailed EE Administration Cost breakdown fields to investment_analysis table
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS ee_admin_breakdown jsonb DEFAULT '{}'::jsonb;

-- Add specific hard cost fields
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_payroll_software numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_hris_software numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_time_attendance_software numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_employee_handbook numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_training_platform numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_hr_consulting numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_employment_attorney numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS hard_costs_fines_settlements numeric DEFAULT 0;

-- Add soft cost fields
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS soft_costs_weekly_hr_hours numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS soft_costs_weekly_admin_hours numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS soft_costs_hourly_wage numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS soft_costs_risk_level text DEFAULT 'low';

-- Add calculated totals
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS total_hard_costs numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS total_soft_costs numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS risk_adjustment numeric DEFAULT 0;
ALTER TABLE public.investment_analysis ADD COLUMN IF NOT EXISTS calculated_ee_admin_cost numeric DEFAULT 0;

COMMENT ON COLUMN public.investment_analysis.ee_admin_breakdown IS 'Complete breakdown of EE Administration Cost calculation';
COMMENT ON COLUMN public.investment_analysis.soft_costs_risk_level IS 'Risk level: low, moderate, high - affects cost multiplier';
COMMENT ON COLUMN public.investment_analysis.calculated_ee_admin_cost IS 'Total calculated EE Admin Cost (Hard + Soft + Risk Adjustment)';

-- Update the trigger to also handle the new updated_at column
CREATE OR REPLACE FUNCTION public.update_investment_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_investment_analysis_updated_at_trigger ON public.investment_analysis;
CREATE TRIGGER update_investment_analysis_updated_at_trigger
    BEFORE UPDATE ON public.investment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_investment_analysis_updated_at();