
-- Create client_pay_configurations table for multiple pay cycles
CREATE TABLE public.client_pay_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('weekly', 'bi_weekly', 'semi_monthly', 'monthly')),
    pay_group_ids UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enhance pay_groups table with new fields
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS pay_frequency TEXT CHECK (pay_frequency IN ('weekly', 'bi_weekly', 'semi_monthly', 'monthly'));
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS next_pay_date DATE;
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS pay_calendar_config JSONB DEFAULT '{}';
ALTER TABLE public.pay_groups ADD COLUMN IF NOT EXISTS default_cost_center TEXT;

-- Create pay_group_employees junction table
CREATE TABLE public.pay_group_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(employee_id, pay_group_id)
);

-- Enable RLS on new tables
ALTER TABLE public.client_pay_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_group_employees ENABLE ROW LEVEL SECURITY;

-- Create policies for client_pay_configurations
CREATE POLICY "Super admins can manage all client pay configurations"
ON public.client_pay_configurations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their client pay configurations"
ON public.client_pay_configurations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_pay_configurations.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

-- Create policies for pay_group_employees
CREATE POLICY "Company users can view their pay group employees"
ON public.pay_group_employees FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        WHERE pg.id = pay_group_employees.pay_group_id
        AND (pg.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

CREATE POLICY "Company admins can manage their pay group employees"
ON public.pay_group_employees FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        WHERE pg.id = pay_group_employees.pay_group_id
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pg.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create indexes for better performance
CREATE INDEX idx_client_pay_configurations_client_id ON public.client_pay_configurations(client_id);
CREATE INDEX idx_client_pay_configurations_active ON public.client_pay_configurations(client_id, is_active);
CREATE INDEX idx_pay_groups_frequency ON public.pay_groups(pay_frequency);
CREATE INDEX idx_pay_group_employees_group_id ON public.pay_group_employees(pay_group_id);
CREATE INDEX idx_pay_group_employees_employee_id ON public.pay_group_employees(employee_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_pay_configurations_updated_at
    BEFORE UPDATE ON public.client_pay_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_client_payroll_settings_updated_at();

-- Function to get employee count for pay groups
CREATE OR REPLACE FUNCTION public.get_pay_group_employee_count(p_pay_group_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.pay_group_employees
        WHERE pay_group_id = p_pay_group_id
        AND is_active = true
    );
END;
$$;

-- Function to validate employee assignment (one active pay group per employee)
CREATE OR REPLACE FUNCTION public.validate_employee_pay_group_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if employee is already assigned to another active pay group
    IF NEW.is_active = true AND EXISTS (
        SELECT 1 FROM public.pay_group_employees pge
        WHERE pge.employee_id = NEW.employee_id
        AND pge.pay_group_id != NEW.pay_group_id
        AND pge.is_active = true
    ) THEN
        RAISE EXCEPTION 'Employee can only be assigned to one active pay group at a time';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_pay_group_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.pay_group_employees
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_employee_pay_group_assignment();

-- Migrate existing data from client_payroll_settings to new structure
INSERT INTO public.client_pay_configurations (client_id, pay_frequency, pay_group_ids, created_by)
SELECT 
    client_id,
    COALESCE(pay_frequency, 'bi_weekly'),
    CASE 
        WHEN pay_group_id IS NOT NULL THEN ARRAY[pay_group_id]
        ELSE '{}'::UUID[]
    END,
    created_by
FROM public.client_payroll_settings
WHERE client_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update existing pay groups with default frequency if not set
UPDATE public.pay_groups 
SET pay_frequency = 'bi_weekly' 
WHERE pay_frequency IS NULL;
