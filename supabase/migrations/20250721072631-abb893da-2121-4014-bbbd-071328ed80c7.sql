-- Create proper org structure tables for Location > Division > Department hierarchy

-- First, check if the tables already exist and create them if they don't
-- Locations table (top level - each company can have multiple locations)
CREATE TABLE IF NOT EXISTS public.org_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT DEFAULT 'US',
    timezone TEXT,
    default_bank_account_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, name),
    UNIQUE(company_id, code) WHERE code IS NOT NULL
);

-- Divisions table (belong to locations)
CREATE TABLE IF NOT EXISTS public.org_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.org_locations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    default_bank_account_id UUID,
    payroll_schedule_id UUID,
    invoice_template_id UUID,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, name),
    UNIQUE(company_id, code) WHERE code IS NOT NULL
);

-- Departments table (belong to divisions)
CREATE TABLE IF NOT EXISTS public.org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID NOT NULL REFERENCES public.org_divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(division_id, name),
    UNIQUE(division_id, code) WHERE code IS NOT NULL
);

-- Employee org assignments table (replaces the simple text fields)
CREATE TABLE IF NOT EXISTS public.employee_org_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.org_locations(id),
    division_id UUID REFERENCES public.org_divisions(id),
    department_id UUID REFERENCES public.org_departments(id),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(employee_id, effective_date) -- One assignment per employee per effective date
);

-- Enable RLS on all tables
ALTER TABLE public.org_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_org_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_locations
CREATE POLICY "Company admins can manage locations"
    ON public.org_locations
    FOR ALL
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for org_divisions
CREATE POLICY "Company admins can manage divisions"
    ON public.org_divisions
    FOR ALL
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for org_departments
CREATE POLICY "Company admins can manage departments"
    ON public.org_departments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.org_divisions od 
            WHERE od.id = org_departments.division_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_divisions od 
            WHERE od.id = org_departments.division_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- RLS Policies for employee_org_assignments
CREATE POLICY "Company admins can manage employee assignments"
    ON public.employee_org_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_org_assignments.employee_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_org_assignments.employee_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_org_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all org tables
CREATE TRIGGER update_org_locations_updated_at
    BEFORE UPDATE ON public.org_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_org_divisions_updated_at
    BEFORE UPDATE ON public.org_divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_org_departments_updated_at
    BEFORE UPDATE ON public.org_departments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

CREATE TRIGGER update_employee_org_assignments_updated_at
    BEFORE UPDATE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_org_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_locations_company_id ON public.org_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_location_id ON public.org_divisions(location_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_company_id ON public.org_divisions(company_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_division_id ON public.org_departments(division_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_employee_id ON public.employee_org_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_effective_date ON public.employee_org_assignments(effective_date);