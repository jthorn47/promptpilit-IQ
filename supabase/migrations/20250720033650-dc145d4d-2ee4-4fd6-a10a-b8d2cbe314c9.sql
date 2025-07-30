
-- Phase 1: Database Schema Fixes

-- First, let's make pay groups client-specific by adding a NOT NULL constraint
-- and updating existing records to have a proper company_id
UPDATE public.pay_groups 
SET company_id = (SELECT id FROM public.company_settings LIMIT 1)
WHERE company_id IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE public.pay_groups 
ALTER COLUMN company_id SET NOT NULL;

-- Create a more robust pay_group_employees table (if it doesn't exist or needs updates)
CREATE TABLE IF NOT EXISTS public.pay_group_employee_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL, -- References employee records (not auth.users directly)
    employee_name TEXT NOT NULL, -- Denormalized for easier querying
    employee_email TEXT, -- Optional for contact
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(employee_id, pay_group_id)
);

-- Enable RLS
ALTER TABLE public.pay_group_employee_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for pay_group_employee_assignments
CREATE POLICY "Company users can view their pay group employee assignments"
ON public.pay_group_employee_assignments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        WHERE pg.id = pay_group_employee_assignments.pay_group_id
        AND (pg.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

CREATE POLICY "Company admins can manage their pay group employee assignments"
ON public.pay_group_employee_assignments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        WHERE pg.id = pay_group_employee_assignments.pay_group_id
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create updated trigger for automatic timestamp updates
CREATE TRIGGER update_pay_group_employee_assignments_updated_at
    BEFORE UPDATE ON public.pay_group_employee_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_client_payroll_settings_updated_at();

-- Create function to get employee count for pay groups
CREATE OR REPLACE FUNCTION public.get_pay_group_employee_count_v2(p_pay_group_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.pay_group_employee_assignments
        WHERE pay_group_id = p_pay_group_id
        AND is_active = true
    );
END;
$$;

-- Create function to validate single active pay group per employee
CREATE OR REPLACE FUNCTION public.validate_single_active_pay_group()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if employee is already assigned to another active pay group
    IF NEW.is_active = true AND EXISTS (
        SELECT 1 FROM public.pay_group_employee_assignments pge
        WHERE pge.employee_id = NEW.employee_id
        AND pge.pay_group_id != NEW.pay_group_id
        AND pge.is_active = true
        AND pge.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Employee % can only be assigned to one active pay group at a time', NEW.employee_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_single_pay_group_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.pay_group_employee_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_single_active_pay_group();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pay_group_employee_assignments_pay_group ON public.pay_group_employee_assignments(pay_group_id);
CREATE INDEX IF NOT EXISTS idx_pay_group_employee_assignments_employee ON public.pay_group_employee_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_pay_group_employee_assignments_active ON public.pay_group_employee_assignments(pay_group_id, is_active);

-- Update pay_groups table to have better default pay calendar config
UPDATE public.pay_groups 
SET pay_calendar_config = jsonb_build_object(
    'cutoff_days_before_payday', 3,
    'processing_days_required', 2,
    'holiday_handling', 'before',
    'weekend_handling', 'before'
)
WHERE pay_calendar_config = '{}' OR pay_calendar_config IS NULL;

-- Create function to calculate next pay date based on frequency
CREATE OR REPLACE FUNCTION public.calculate_next_pay_date(
    p_frequency TEXT,
    p_last_pay_date DATE DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    base_date DATE;
    next_date DATE;
BEGIN
    -- Use last pay date or current friday as base
    base_date := COALESCE(p_last_pay_date, 
        CURRENT_DATE + (5 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER
    );
    
    CASE p_frequency
        WHEN 'weekly' THEN
            next_date := base_date + INTERVAL '7 days';
        WHEN 'bi_weekly' THEN
            next_date := base_date + INTERVAL '14 days';
        WHEN 'semi_monthly' THEN
            -- 15th and last day of month logic
            IF EXTRACT(DAY FROM base_date) <= 15 THEN
                next_date := (date_trunc('month', base_date) + INTERVAL '1 month - 1 day')::DATE;
            ELSE
                next_date := (date_trunc('month', base_date) + INTERVAL '1 month' + INTERVAL '14 days')::DATE;
            END IF;
        WHEN 'monthly' THEN
            next_date := (date_trunc('month', base_date) + INTERVAL '1 month' + 
                         (EXTRACT(DAY FROM base_date) - 1) * INTERVAL '1 day')::DATE;
        ELSE
            next_date := base_date + INTERVAL '14 days'; -- Default to bi-weekly
    END CASE;
    
    -- Adjust for weekends (move to Friday if falls on weekend)
    WHILE EXTRACT(DOW FROM next_date) IN (0, 6) LOOP
        next_date := next_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN next_date;
END;
$$;

-- Update existing pay groups with calculated next pay dates
UPDATE public.pay_groups 
SET next_pay_date = public.calculate_next_pay_date(pay_frequency, next_pay_date)
WHERE pay_frequency IS NOT NULL;
