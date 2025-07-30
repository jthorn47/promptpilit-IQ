-- Update the existing structure to match Location → Division → Department hierarchy

-- First, check if the locations table needs to be updated with new columns
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS default_bank_account_id UUID,
ADD COLUMN IF NOT EXISTS code TEXT;

-- Create indexes if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_locations_company_id_new') THEN
        CREATE INDEX idx_locations_company_id_new ON public.locations(company_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_locations_active_new') THEN  
        CREATE INDEX idx_locations_active_new ON public.locations(company_id, is_active);
    END IF;
END $$;

-- Update divisions to reference locations (if column doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'divisions' AND column_name = 'location_id') THEN
        ALTER TABLE public.divisions ADD COLUMN location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE;
        CREATE INDEX idx_divisions_location_id ON public.divisions(location_id);
    END IF;
END $$;

-- Recreate the employee org assignments table with proper structure
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
CREATE TRIGGER update_employee_org_assignments_updated_at
    BEFORE UPDATE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging trigger
CREATE TRIGGER log_employee_org_assignments_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.employee_org_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();