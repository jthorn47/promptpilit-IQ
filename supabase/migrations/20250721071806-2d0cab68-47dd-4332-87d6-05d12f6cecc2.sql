-- Add business rules for employee organization and payroll requirements

-- First, add division field to employees table
ALTER TABLE public.employees 
ADD COLUMN division text;

-- Add divisional reporting setting to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN divisional_reporting_enabled boolean NOT NULL DEFAULT false;

-- Make location required for all employees (update existing NULL values first)
UPDATE public.employees 
SET location = 'Not Specified' 
WHERE location IS NULL;

-- Now make location NOT NULL
ALTER TABLE public.employees 
ALTER COLUMN location SET NOT NULL;

-- Create a validation function for payroll requirements
CREATE OR REPLACE FUNCTION public.validate_payroll_employee_requirements()
RETURNS TRIGGER AS $$
DECLARE
    divisional_enabled BOOLEAN;
BEGIN
    -- Get company's divisional reporting setting
    SELECT cs.divisional_reporting_enabled INTO divisional_enabled
    FROM public.company_settings cs
    WHERE cs.id = NEW.company_id;
    
    -- If divisional reporting is enabled, division is required
    IF divisional_enabled = true AND (NEW.division IS NULL OR NEW.division = '') THEN
        RAISE EXCEPTION 'Division is required when divisional reporting is enabled for this company';
    END IF;
    
    -- Location is always required (now enforced by NOT NULL constraint)
    -- Department is always optional
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate on INSERT and UPDATE
CREATE TRIGGER validate_employee_payroll_requirements
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_payroll_employee_requirements();

-- Create a function to validate before payroll processing
CREATE OR REPLACE FUNCTION public.validate_payroll_readiness(p_company_id uuid)
RETURNS TABLE(
    is_ready boolean,
    issues text[],
    employee_count integer,
    missing_division_count integer
) AS $$
DECLARE
    divisional_enabled BOOLEAN;
    total_employees INTEGER;
    missing_divisions INTEGER;
    issues_array TEXT[] := '{}';
BEGIN
    -- Get company settings
    SELECT cs.divisional_reporting_enabled INTO divisional_enabled
    FROM public.company_settings cs
    WHERE cs.id = p_company_id;
    
    -- Count total active employees
    SELECT COUNT(*) INTO total_employees
    FROM public.employees e
    WHERE e.company_id = p_company_id AND e.status = 'active';
    
    -- Check for missing divisions if required
    IF divisional_enabled = true THEN
        SELECT COUNT(*) INTO missing_divisions
        FROM public.employees e
        WHERE e.company_id = p_company_id 
        AND e.status = 'active'
        AND (e.division IS NULL OR e.division = '');
        
        IF missing_divisions > 0 THEN
            issues_array := array_append(issues_array, 
                missing_divisions || ' employees missing required division assignment');
        END IF;
    ELSE
        missing_divisions := 0;
    END IF;
    
    -- Check for missing locations (should be rare due to NOT NULL constraint)
    DECLARE missing_locations INTEGER;
    BEGIN
        SELECT COUNT(*) INTO missing_locations
        FROM public.employees e
        WHERE e.company_id = p_company_id 
        AND e.status = 'active'
        AND (e.location IS NULL OR e.location = '');
        
        IF missing_locations > 0 THEN
            issues_array := array_append(issues_array, 
                missing_locations || ' employees missing required location');
        END IF;
    END;
    
    RETURN QUERY SELECT 
        (array_length(issues_array, 1) IS NULL OR array_length(issues_array, 1) = 0) as is_ready,
        issues_array as issues,
        total_employees as employee_count,
        missing_divisions as missing_division_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for the new validation function
GRANT EXECUTE ON FUNCTION public.validate_payroll_readiness(uuid) TO authenticated;