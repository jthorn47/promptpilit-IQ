-- Add remaining components for org structure tables (skip existing policies)

-- Add triggers for updated_at columns (if not exists)
CREATE OR REPLACE FUNCTION public.update_org_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all org tables (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_org_locations_updated_at'
    ) THEN
        CREATE TRIGGER update_org_locations_updated_at
            BEFORE UPDATE ON public.org_locations
            FOR EACH ROW
            EXECUTE FUNCTION public.update_org_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_org_divisions_updated_at'
    ) THEN
        CREATE TRIGGER update_org_divisions_updated_at
            BEFORE UPDATE ON public.org_divisions
            FOR EACH ROW
            EXECUTE FUNCTION public.update_org_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_org_departments_updated_at'
    ) THEN
        CREATE TRIGGER update_org_departments_updated_at
            BEFORE UPDATE ON public.org_departments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_org_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_employee_org_assignments_updated_at'
    ) THEN
        CREATE TRIGGER update_employee_org_assignments_updated_at
            BEFORE UPDATE ON public.employee_org_assignments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_org_updated_at_column();
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_locations_company_id ON public.org_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_location_id ON public.org_divisions(location_id);
CREATE INDEX IF NOT EXISTS idx_org_divisions_company_id ON public.org_divisions(company_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_division_id ON public.org_departments(division_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_employee_id ON public.employee_org_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_effective_date ON public.employee_org_assignments(effective_date);