-- Create proper org structure tables for Location > Division > Department hierarchy

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
    UNIQUE(company_id, name)
);

-- Create conditional unique constraint on code for locations
CREATE UNIQUE INDEX org_locations_company_code_unique 
ON public.org_locations(company_id, code) 
WHERE code IS NOT NULL;

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
    UNIQUE(company_id, name)
);

-- Create conditional unique constraint on code for divisions
CREATE UNIQUE INDEX org_divisions_company_code_unique 
ON public.org_divisions(company_id, code) 
WHERE code IS NOT NULL;

-- Departments table (belong to divisions)
CREATE TABLE IF NOT EXISTS public.org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID NOT NULL REFERENCES public.org_divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(division_id, name)
);

-- Create conditional unique constraint on code for departments
CREATE UNIQUE INDEX org_departments_division_code_unique 
ON public.org_departments(division_id, code) 
WHERE code IS NOT NULL;

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
    UNIQUE(employee_id, effective_date)
);

-- Enable RLS on all tables
ALTER TABLE public.org_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_org_assignments ENABLE ROW LEVEL SECURITY;