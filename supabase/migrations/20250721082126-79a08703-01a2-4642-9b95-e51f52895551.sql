-- First, let's check if the columns exist in company_settings
DO $$
BEGIN
  -- Check if columns exist and add them if they don't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_settings' AND column_name = 'require_divisions') THEN
    ALTER TABLE public.company_settings ADD COLUMN require_divisions BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_settings' AND column_name = 'require_departments') THEN
    ALTER TABLE public.company_settings ADD COLUMN require_departments BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_settings' AND column_name = 'auto_generate_org_codes') THEN
    ALTER TABLE public.company_settings ADD COLUMN auto_generate_org_codes BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Drop and recreate the validation function to fix the reference issue
DROP FUNCTION IF EXISTS public.validate_employee_org_assignment() CASCADE;

-- Create a corrected validation function that properly handles the org structure
CREATE OR REPLACE FUNCTION public.validate_employee_org_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  require_divisions_val BOOLEAN;
  require_departments_val BOOLEAN;
  location_company_id UUID;
BEGIN
  -- Get company settings via the org_locations table instead of locations
  SELECT ol.company_id, COALESCE(cs.require_divisions, false), COALESCE(cs.require_departments, false)
  INTO location_company_id, require_divisions_val, require_departments_val
  FROM public.org_locations ol
  LEFT JOIN public.company_settings cs ON ol.company_id = cs.id
  WHERE ol.id = NEW.location_id;
  
  -- If no company found, skip validation
  IF location_company_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Validate division requirement
  IF require_divisions_val = true AND NEW.division_id IS NULL THEN
    RAISE EXCEPTION 'Division is required for this company';
  END IF;
  
  -- Validate department requirement  
  IF require_departments_val = true AND NEW.department_id IS NULL THEN
    RAISE EXCEPTION 'Department is required for this company';
  END IF;
  
  -- Validate division belongs to the correct company
  IF NEW.division_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.org_divisions od
      WHERE od.id = NEW.division_id AND od.company_id = location_company_id
    ) THEN
      RAISE EXCEPTION 'Division does not belong to the same company as the location';
    END IF;
  END IF;
  
  -- Validate department belongs to division
  IF NEW.department_id IS NOT NULL THEN
    IF NEW.division_id IS NULL THEN
      RAISE EXCEPTION 'Department requires a division';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM public.org_departments d
      WHERE d.id = NEW.department_id AND d.division_id = NEW.division_id
    ) THEN
      RAISE EXCEPTION 'Department does not belong to the specified division';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS validate_employee_org_assignment_trigger ON public.employee_org_assignments;
CREATE TRIGGER validate_employee_org_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.employee_org_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_org_assignment();