-- Create org structure tables with immutable codes and proper hierarchy

-- Locations table (top level)
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_code TEXT NOT NULL, -- Immutable org code
  is_active BOOLEAN NOT NULL DEFAULT true,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, location_code) -- Unique per company
);

-- Divisions table (optional, under locations)
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  division_name TEXT NOT NULL,
  division_code TEXT NOT NULL, -- Immutable org code
  is_active BOOLEAN NOT NULL DEFAULT true,
  manager_id UUID, -- Reference to employee
  bank_account_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(location_id, division_code) -- Unique per location
);

-- Departments table (optional, under divisions)
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  department_code TEXT NOT NULL, -- Immutable org code
  is_active BOOLEAN NOT NULL DEFAULT true,
  manager_id UUID, -- Reference to employee
  cost_center TEXT,
  gl_account TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(division_id, department_code) -- Unique per division
);

-- Employee org assignments table
CREATE TABLE public.employee_org_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id),
  division_id UUID REFERENCES public.divisions(id),
  department_id UUID REFERENCES public.departments(id),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(employee_id, effective_date) -- Only one assignment per employee per date
);

-- Add org structure config to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN require_divisions BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN require_departments BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_generate_org_codes BOOLEAN NOT NULL DEFAULT true;

-- Org structure audit log
CREATE TABLE public.org_structure_audit (
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

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_org_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_structure_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Company admins can manage locations"
ON public.locations FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for divisions
CREATE POLICY "Company admins can manage divisions"
ON public.divisions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.locations l
  WHERE l.id = divisions.location_id
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- RLS Policies for departments
CREATE POLICY "Company admins can manage departments"
ON public.departments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.divisions d
  JOIN public.locations l ON d.location_id = l.id
  WHERE d.id = departments.division_id
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- RLS Policies for employee org assignments
CREATE POLICY "Company admins can manage employee org assignments"
ON public.employee_org_assignments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.employees e
  JOIN public.locations l ON employee_org_assignments.location_id = l.id
  WHERE e.id = employee_org_assignments.employee_id
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, l.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- RLS Policies for audit log
CREATE POLICY "Company admins can view org audit logs"
ON public.org_structure_audit FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "System can insert org audit logs"
ON public.org_structure_audit FOR INSERT
WITH CHECK (true);

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

-- Add triggers for audit logging
CREATE TRIGGER audit_locations_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER audit_divisions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

CREATE TRIGGER audit_departments_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_org_structure_changes();

-- Add triggers for updated_at columns
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE TRIGGER validate_employee_org_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.employee_org_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_org_assignment();

-- Create indexes for performance
CREATE INDEX idx_locations_company_id ON public.locations(company_id);
CREATE INDEX idx_locations_code ON public.locations(company_id, location_code);
CREATE INDEX idx_divisions_location_id ON public.divisions(location_id);
CREATE INDEX idx_divisions_code ON public.divisions(location_id, division_code);
CREATE INDEX idx_departments_division_id ON public.departments(division_id);
CREATE INDEX idx_departments_code ON public.departments(division_id, department_code);
CREATE INDEX idx_employee_org_assignments_employee ON public.employee_org_assignments(employee_id, is_current);
CREATE INDEX idx_employee_org_assignments_location ON public.employee_org_assignments(location_id);
CREATE INDEX idx_org_audit_entity ON public.org_structure_audit(entity_type, entity_id);