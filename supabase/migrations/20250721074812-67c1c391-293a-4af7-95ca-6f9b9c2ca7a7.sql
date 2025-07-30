-- Update existing org structure tables to match requirements

-- First, ensure locations has the required columns and constraints
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS location_code TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update locations to have proper structure (company_id should be required, department_id should be removed)
UPDATE public.locations SET company_id = (SELECT id FROM company_settings LIMIT 1) WHERE company_id IS NULL;
ALTER TABLE public.locations ALTER COLUMN company_id SET NOT NULL;

-- Add unique constraint for location codes per company
DROP INDEX IF EXISTS idx_locations_code;
CREATE UNIQUE INDEX idx_locations_code ON public.locations(company_id, location_code) WHERE location_code IS NOT NULL;

-- Ensure divisions has the required columns
ALTER TABLE public.divisions 
ADD COLUMN IF NOT EXISTS division_code TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS manager_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update divisions to use location_id instead of company_id for proper hierarchy
-- First add the constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'divisions_location_id_division_code_key') THEN
    ALTER TABLE public.divisions ADD CONSTRAINT divisions_location_id_division_code_key UNIQUE(location_id, division_code);
  END IF;
END $$;

-- Ensure departments has the required columns  
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS department_code TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS manager_id UUID,
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS gl_account TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add unique constraint for department codes per division
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'departments_division_id_department_code_key') THEN
    ALTER TABLE public.departments ADD CONSTRAINT departments_division_id_department_code_key UNIQUE(division_id, department_code);
  END IF;
END $$;

-- Update employee_org_assignments to have proper structure
ALTER TABLE public.employee_org_assignments 
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add unique constraint for employee assignments per date
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'employee_org_assignments_employee_id_effective_date_key') THEN
    ALTER TABLE public.employee_org_assignments ADD CONSTRAINT employee_org_assignments_employee_id_effective_date_key UNIQUE(employee_id, effective_date);
  END IF;
END $$;

-- Add org structure config to company_settings if not exists
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS require_divisions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_departments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_generate_org_codes BOOLEAN DEFAULT true;

-- Create org structure audit table if not exists
CREATE TABLE IF NOT EXISTS public.org_structure_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'location', 'division', 'department'
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'code_locked'
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on new table
ALTER TABLE public.org_structure_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Org audit policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'org_structure_audit' AND policyname = 'Company admins can view org audit logs') THEN
    CREATE POLICY "Company admins can view org audit logs"
    ON public.org_structure_audit FOR SELECT
    USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'org_structure_audit' AND policyname = 'System can insert org audit logs') THEN
    CREATE POLICY "System can insert org audit logs"
    ON public.org_structure_audit FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Functions for auto-generating org codes
CREATE OR REPLACE FUNCTION public.generate_location_code(p_company_id UUID, p_location_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from location name (first 3 chars, uppercase)
  base_code := UPPER(LEFT(REGEXP_REPLACE(p_location_name, '[^A-Za-z0-9]', '', 'g'), 3));
  
  -- Ensure minimum length
  IF LENGTH(base_code) < 2 THEN
    base_code := RPAD(base_code, 2, '0');
  END IF;
  
  final_code := base_code;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.locations 
    WHERE company_id = p_company_id 
    AND location_code = final_code
  ) LOOP
    final_code := base_code || LPAD(counter::TEXT, 2, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_division_code(p_location_id UUID, p_division_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from division name (first 3 chars, uppercase)
  base_code := UPPER(LEFT(REGEXP_REPLACE(p_division_name, '[^A-Za-z0-9]', '', 'g'), 3));
  
  -- Ensure minimum length
  IF LENGTH(base_code) < 2 THEN
    base_code := RPAD(base_code, 2, '0');
  END IF;
  
  final_code := base_code;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE location_id = p_location_id 
    AND division_code = final_code
  ) LOOP
    final_code := base_code || LPAD(counter::TEXT, 2, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_department_code(p_division_id UUID, p_department_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from department name (first 3 chars, uppercase)
  base_code := UPPER(LEFT(REGEXP_REPLACE(p_department_name, '[^A-Za-z0-9]', '', 'g'), 3));
  
  -- Ensure minimum length
  IF LENGTH(base_code) < 2 THEN
    base_code := RPAD(base_code, 2, '0');
  END IF;
  
  final_code := base_code;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.departments 
    WHERE division_id = p_division_id 
    AND department_code = final_code
  ) LOOP
    final_code := base_code || LPAD(counter::TEXT, 2, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Trigger functions for audit logging  
CREATE OR REPLACE FUNCTION public.log_org_structure_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  entity_type TEXT;
BEGIN
  -- Determine entity type from table name
  entity_type := CASE TG_TABLE_NAME
    WHEN 'locations' THEN 'location'
    WHEN 'divisions' THEN 'division' 
    WHEN 'departments' THEN 'department'
    ELSE TG_TABLE_NAME
  END;
  
  -- Log the change
  INSERT INTO public.org_structure_audit (
    entity_type,
    entity_id,
    action_type,
    old_values,
    new_values,
    changed_fields,
    user_id
  ) VALUES (
    entity_type,
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN 'updated'
      WHEN 'DELETE' THEN 'deleted'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW)) 
          WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
        )
      ELSE NULL
    END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers if they don't exist
DROP TRIGGER IF EXISTS audit_locations_changes ON public.locations;
CREATE TRIGGER audit_locations_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

DROP TRIGGER IF EXISTS audit_divisions_changes ON public.divisions;
CREATE TRIGGER audit_divisions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

DROP TRIGGER IF EXISTS audit_departments_changes ON public.departments;
CREATE TRIGGER audit_departments_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

-- Validation function for org assignment rules
CREATE OR REPLACE FUNCTION public.validate_employee_org_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  company_settings RECORD;
  location_company_id UUID;
BEGIN
  -- Get company settings
  SELECT l.company_id, cs.require_divisions, cs.require_departments
  INTO location_company_id, company_settings
  FROM public.locations l
  JOIN public.company_settings cs ON l.company_id = cs.id
  WHERE l.id = NEW.location_id;
  
  -- Validate division requirement
  IF company_settings.require_divisions = true AND NEW.division_id IS NULL THEN
    RAISE EXCEPTION 'Division is required for this company';
  END IF;
  
  -- Validate department requirement  
  IF company_settings.require_departments = true AND NEW.department_id IS NULL THEN
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

-- Create additional performance indexes
CREATE INDEX IF NOT EXISTS idx_divisions_location_id ON public.divisions(location_id);
CREATE INDEX IF NOT EXISTS idx_departments_division_id ON public.departments(division_id);
CREATE INDEX IF NOT EXISTS idx_employee_org_assignments_employee ON public.employee_org_assignments(employee_id, is_current);
CREATE INDEX IF NOT EXISTS idx_org_audit_entity ON public.org_structure_audit(entity_type, entity_id);