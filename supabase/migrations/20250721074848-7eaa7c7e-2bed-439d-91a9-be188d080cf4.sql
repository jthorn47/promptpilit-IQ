-- Fix the validation function syntax error

-- Validation function for org assignment rules (corrected)
CREATE OR REPLACE FUNCTION public.validate_employee_org_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  require_divisions_val BOOLEAN;
  require_departments_val BOOLEAN;
  location_company_id UUID;
BEGIN
  -- Get company settings
  SELECT l.company_id, cs.require_divisions, cs.require_departments
  INTO location_company_id, require_divisions_val, require_departments_val
  FROM public.locations l
  JOIN public.company_settings cs ON l.company_id = cs.id
  WHERE l.id = NEW.location_id;
  
  -- Validate division requirement
  IF require_divisions_val = true AND NEW.division_id IS NULL THEN
    RAISE EXCEPTION 'Division is required for this company';
  END IF;
  
  -- Validate department requirement  
  IF require_departments_val = true AND NEW.department_id IS NULL THEN
    RAISE EXCEPTION 'Department is required for this company';
  END IF;
  
  -- Validate division belongs to location
  IF NEW.division_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.divisions d
      WHERE d.id = NEW.division_id AND d.location_id = NEW.location_id
    ) THEN
      RAISE EXCEPTION 'Division does not belong to the specified location';
    END IF;
  END IF;
  
  -- Validate department belongs to division
  IF NEW.department_id IS NOT NULL THEN
    IF NEW.division_id IS NULL THEN
      RAISE EXCEPTION 'Department requires a division';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM public.departments d
      WHERE d.id = NEW.department_id AND d.division_id = NEW.division_id
    ) THEN
      RAISE EXCEPTION 'Department does not belong to the specified division';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_employee_org_assignment_trigger ON public.employee_org_assignments;
CREATE TRIGGER validate_employee_org_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.employee_org_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_org_assignment();