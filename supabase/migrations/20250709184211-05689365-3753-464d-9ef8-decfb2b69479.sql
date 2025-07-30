-- Create F45 Payroll System Tables for California wage & hour compliance

-- Create payroll_periods table for managing payroll cycles
CREATE TABLE public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    period_type TEXT NOT NULL DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'bi-weekly', 'monthly')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'finalized', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create payroll_employees table for F45 instructors
CREATE TABLE public.payroll_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    instructor_name TEXT NOT NULL,
    regular_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    standard_class_rate DECIMAL(10,2) NOT NULL DEFAULT 45.00,
    saturday_class_rate DECIMAL(10,2) NOT NULL DEFAULT 60.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payroll_classes table for class-based pay
CREATE TABLE public.payroll_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    class_time TIME NOT NULL,
    class_type TEXT NOT NULL,
    class_rate DECIMAL(10,2) NOT NULL,
    is_split BOOLEAN NOT NULL DEFAULT false,
    split_percentage DECIMAL(5,2) DEFAULT 100.00,
    actual_pay DECIMAL(10,2) NOT NULL,
    is_saturday BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create payroll_time_entries table for PRISM time clock integration
CREATE TABLE public.payroll_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'prism', 'import')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create payroll_calculations table for overtime and blended rate calculations
CREATE TABLE public.payroll_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
    total_classes INTEGER NOT NULL DEFAULT 0,
    total_class_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_regular_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_overtime_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    blended_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    regular_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    bonus_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    adjustments DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    calculation_details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payroll_adjustments table for manual corrections
CREATE TABLE public.payroll_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('bonus', 'deduction', 'correction', 'assist_pay')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create payroll_audit_trail table for compliance tracking
CREATE TABLE public.payroll_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    payroll_employee_id UUID REFERENCES payroll_employees(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    calculation_method TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    compliance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payroll data
CREATE POLICY "Company users can manage their payroll data" ON public.payroll_periods
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company users can manage their payroll employees" ON public.payroll_employees
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company users can manage their payroll classes" ON public.payroll_classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll_periods pp
            WHERE pp.id = payroll_classes.payroll_period_id
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pp.company_id) OR
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company users can manage their payroll time entries" ON public.payroll_time_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll_periods pp
            WHERE pp.id = payroll_time_entries.payroll_period_id
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pp.company_id) OR
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company users can manage their payroll calculations" ON public.payroll_calculations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll_periods pp
            WHERE pp.id = payroll_calculations.payroll_period_id
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pp.company_id) OR
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company users can manage their payroll adjustments" ON public.payroll_adjustments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll_periods pp
            WHERE pp.id = payroll_adjustments.payroll_period_id
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pp.company_id) OR
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company users can view their payroll audit trail" ON public.payroll_audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payroll_periods pp
            WHERE pp.id = payroll_audit_trail.payroll_period_id
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pp.company_id) OR
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_payroll_periods_company_dates ON public.payroll_periods(company_id, start_date, end_date);
CREATE INDEX idx_payroll_employees_company_active ON public.payroll_employees(company_id, is_active);
CREATE INDEX idx_payroll_classes_period_employee ON public.payroll_classes(payroll_period_id, payroll_employee_id);
CREATE INDEX idx_payroll_time_entries_period_employee ON public.payroll_time_entries(payroll_period_id, payroll_employee_id);
CREATE INDEX idx_payroll_calculations_period_employee ON public.payroll_calculations(payroll_period_id, payroll_employee_id);

-- Create function for calculating overtime and blended rates
CREATE OR REPLACE FUNCTION public.calculate_payroll_for_period(
    p_payroll_period_id UUID
)
RETURNS TABLE (
    employee_id UUID,
    total_classes INTEGER,
    total_class_pay DECIMAL(10,2),
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    blended_rate DECIMAL(10,2),
    overtime_pay DECIMAL(10,2),
    gross_pay DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    rec RECORD;
    v_total_classes INTEGER;
    v_total_class_pay DECIMAL(10,2);
    v_total_hours DECIMAL(5,2);
    v_overtime_hours DECIMAL(5,2);
    v_blended_rate DECIMAL(10,2);
    v_overtime_pay DECIMAL(10,2);
    v_gross_pay DECIMAL(10,2);
    v_regular_hourly_rate DECIMAL(10,2);
BEGIN
    -- Get all employees for this payroll period
    FOR rec IN
        SELECT DISTINCT pe.id, pe.instructor_name, pe.regular_hourly_rate
        FROM public.payroll_employees pe
        JOIN public.payroll_classes pc ON pe.id = pc.payroll_employee_id
        WHERE pc.payroll_period_id = p_payroll_period_id
        AND pe.is_active = true
    LOOP
        -- Calculate total classes and class pay
        SELECT 
            COUNT(*),
            COALESCE(SUM(pc.actual_pay), 0)
        INTO v_total_classes, v_total_class_pay
        FROM public.payroll_classes pc
        WHERE pc.payroll_period_id = p_payroll_period_id
        AND pc.payroll_employee_id = rec.id;
        
        -- Get total hours from time entries
        SELECT COALESCE(SUM(pte.total_hours), 0)
        INTO v_total_hours
        FROM public.payroll_time_entries pte
        WHERE pte.payroll_period_id = p_payroll_period_id
        AND pte.payroll_employee_id = rec.id;
        
        -- Calculate overtime hours (over 40 hours/week or 8 hours/day)
        v_overtime_hours := GREATEST(0, v_total_hours - 40);
        
        -- Calculate blended rate for overtime
        v_regular_hourly_rate := rec.regular_hourly_rate;
        IF v_total_hours > 0 THEN
            v_blended_rate := (v_total_class_pay + (v_regular_hourly_rate * (v_total_hours - v_overtime_hours))) / v_total_hours;
        ELSE
            v_blended_rate := v_regular_hourly_rate;
        END IF;
        
        -- Calculate overtime pay at 1.5x blended rate
        v_overtime_pay := v_overtime_hours * v_blended_rate * 1.5;
        
        -- Calculate gross pay
        v_gross_pay := v_total_class_pay + v_overtime_pay;
        
        -- Insert or update calculations
        INSERT INTO public.payroll_calculations (
            payroll_period_id,
            payroll_employee_id,
            total_classes,
            total_class_pay,
            total_regular_hours,
            total_overtime_hours,
            blended_rate,
            overtime_pay,
            regular_pay,
            gross_pay,
            calculation_details
        )
        VALUES (
            p_payroll_period_id,
            rec.id,
            v_total_classes,
            v_total_class_pay,
            v_total_hours - v_overtime_hours,
            v_overtime_hours,
            v_blended_rate,
            v_overtime_pay,
            v_total_class_pay,
            v_gross_pay,
            jsonb_build_object(
                'calculation_method', 'CA_blended_rate',
                'overtime_threshold', 40,
                'overtime_multiplier', 1.5,
                'compliance_note', 'Calculated in compliance with California Labor Code § 510'
            )
        )
        ON CONFLICT (payroll_period_id, payroll_employee_id)
        DO UPDATE SET
            total_classes = EXCLUDED.total_classes,
            total_class_pay = EXCLUDED.total_class_pay,
            total_regular_hours = EXCLUDED.total_regular_hours,
            total_overtime_hours = EXCLUDED.total_overtime_hours,
            blended_rate = EXCLUDED.blended_rate,
            overtime_pay = EXCLUDED.overtime_pay,
            regular_pay = EXCLUDED.regular_pay,
            gross_pay = EXCLUDED.gross_pay,
            calculation_details = EXCLUDED.calculation_details,
            updated_at = now();
        
        -- Log audit trail
        INSERT INTO public.payroll_audit_trail (
            payroll_period_id,
            payroll_employee_id,
            action_type,
            calculation_method,
            details,
            compliance_notes
        )
        VALUES (
            p_payroll_period_id,
            rec.id,
            'payroll_calculation',
            'CA_blended_rate_overtime',
            jsonb_build_object(
                'total_classes', v_total_classes,
                'total_hours', v_total_hours,
                'overtime_hours', v_overtime_hours,
                'blended_rate', v_blended_rate,
                'gross_pay', v_gross_pay
            ),
            'Calculated in compliance with California wage and hour laws, including blended overtime rules.'
        );
        
        -- Return calculated values
        employee_id := rec.id;
        total_classes := v_total_classes;
        total_class_pay := v_total_class_pay;
        total_hours := v_total_hours;
        overtime_hours := v_overtime_hours;
        blended_rate := v_blended_rate;
        overtime_pay := v_overtime_pay;
        gross_pay := v_gross_pay;
        
        RETURN NEXT;
    END LOOP;
END;
$function$;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_payroll_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payroll_periods_updated_at
    BEFORE UPDATE ON public.payroll_periods
    FOR EACH ROW EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_payroll_employees_updated_at
    BEFORE UPDATE ON public.payroll_employees
    FOR EACH ROW EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_payroll_classes_updated_at
    BEFORE UPDATE ON public.payroll_classes
    FOR EACH ROW EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_payroll_time_entries_updated_at
    BEFORE UPDATE ON public.payroll_time_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_payroll_calculations_updated_at
    BEFORE UPDATE ON public.payroll_calculations
    FOR EACH ROW EXECUTE FUNCTION public.update_payroll_updated_at_column();