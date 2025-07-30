-- Create the proper Location → Division → Department hierarchy

-- First, create the locations table
CREATE TABLE public.locations (
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
    UNIQUE(company_id, code) -- Only enforce uniqueness if code is not null
);

-- Create index for performance
CREATE INDEX idx_locations_company_id ON public.locations(company_id);
CREATE INDEX idx_locations_active ON public.locations(company_id, is_active);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Company admins can manage their locations"
ON public.locations
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Now update the divisions table to reference locations
ALTER TABLE public.divisions 
ADD COLUMN location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX idx_divisions_location_id ON public.divisions(location_id);

-- Update departments to remove old structure references if they exist
-- The departments table should reference divisions, which now reference locations

-- Create the employee org assignments table with the proper hierarchy
DROP TABLE IF EXISTS public.employee_org_assignments;

CREATE TABLE public.employee_org_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(employee_id) -- Each employee can only have one active assignment
);

-- Create indexes for performance
CREATE INDEX idx_employee_org_assignments_employee ON public.employee_org_assignments(employee_id);
CREATE INDEX idx_employee_org_assignments_location ON public.employee_org_assignments(location_id);
CREATE INDEX idx_employee_org_assignments_division ON public.employee_org_assignments(division_id);
CREATE INDEX idx_employee_org_assignments_department ON public.employee_org_assignments(department_id);

-- Enable RLS
ALTER TABLE public.employee_org_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for employee org assignments
CREATE POLICY "Company users can view their employee assignments"
ON public.employee_org_assignments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.locations l ON l.id = employee_org_assignments.location_id
        WHERE e.id = employee_org_assignments.employee_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) 
            OR has_role(auth.uid(), 'super_admin'::app_role)
            OR e.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Company admins can manage employee assignments"
ON public.employee_org_assignments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.locations l
        WHERE l.id = employee_org_assignments.location_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) 
            OR has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.locations l
        WHERE l.id = employee_org_assignments.location_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) 
            OR has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_org_assignments_updated_at
    BEFORE UPDATE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging trigger
CREATE TRIGGER log_locations_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER log_employee_org_assignments_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();