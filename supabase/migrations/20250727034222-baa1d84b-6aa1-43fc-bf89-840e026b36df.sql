-- Add required job title and workers comp code columns to payroll_employees table
ALTER TABLE public.payroll_employees 
ADD COLUMN job_title_id UUID REFERENCES public.job_titles(id),
ADD COLUMN workers_comp_code_id UUID REFERENCES public.workers_comp_codes(id);

-- Update the validate_payroll_readiness function to check for job titles and workers comp codes
CREATE OR REPLACE FUNCTION public.validate_payroll_readiness(p_company_id uuid)
RETURNS TABLE(is_ready boolean, issues text[], employee_count integer, missing_division_count integer, missing_job_title_count integer, missing_workers_comp_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    divisional_enabled BOOLEAN;
    total_employees INTEGER;
    missing_divisions INTEGER;
    missing_job_titles INTEGER;
    missing_workers_comp INTEGER;
    issues_array TEXT[] := '{}';
BEGIN
    -- Get company settings
    SELECT cs.divisional_reporting_enabled INTO divisional_enabled
    FROM public.company_settings cs
    WHERE cs.id = p_company_id;
    
    -- Count total active payroll employees
    SELECT COUNT(*) INTO total_employees
    FROM public.payroll_employees pe
    WHERE pe.company_id = p_company_id AND pe.employment_status = 'active';
    
    -- Check for missing divisions if required
    IF divisional_enabled = true THEN
        SELECT COUNT(*) INTO missing_divisions
        FROM public.payroll_employees pe
        WHERE pe.company_id = p_company_id 
        AND pe.employment_status = 'active'
        AND (pe.division IS NULL OR pe.division = '');
        
        IF missing_divisions > 0 THEN
            issues_array := array_append(issues_array, 
                missing_divisions || ' employees missing required division assignment');
        END IF;
    ELSE
        missing_divisions := 0;
    END IF;
    
    -- Check for missing job titles (CRITICAL REQUIREMENT)
    SELECT COUNT(*) INTO missing_job_titles
    FROM public.payroll_employees pe
    WHERE pe.company_id = p_company_id 
    AND pe.employment_status = 'active'
    AND pe.job_title_id IS NULL;
    
    IF missing_job_titles > 0 THEN
        issues_array := array_append(issues_array, 
            missing_job_titles || ' employees missing required job title assignment');
    END IF;
    
    -- Check for missing workers comp codes (CRITICAL REQUIREMENT)
    SELECT COUNT(*) INTO missing_workers_comp
    FROM public.payroll_employees pe
    WHERE pe.company_id = p_company_id 
    AND pe.employment_status = 'active'
    AND pe.workers_comp_code_id IS NULL;
    
    IF missing_workers_comp > 0 THEN
        issues_array := array_append(issues_array, 
            missing_workers_comp || ' employees missing required workers compensation code assignment');
    END IF;
    
    RETURN QUERY SELECT 
        (array_length(issues_array, 1) IS NULL OR array_length(issues_array, 1) = 0) as is_ready,
        issues_array as issues,
        total_employees as employee_count,
        missing_divisions as missing_division_count,
        missing_job_titles as missing_job_title_count,
        missing_workers_comp as missing_workers_comp_count;
END;
$function$;

-- Update the payroll employee validation trigger to check for job title and workers comp requirements
CREATE OR REPLACE FUNCTION public.validate_payroll_employee_requirements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Job title is ALWAYS required for active employees
    IF NEW.employment_status = 'active' AND NEW.job_title_id IS NULL THEN
        RAISE EXCEPTION 'Job title is required for all active payroll employees';
    END IF;
    
    -- Workers compensation code is ALWAYS required for active employees
    IF NEW.employment_status = 'active' AND NEW.workers_comp_code_id IS NULL THEN
        RAISE EXCEPTION 'Workers compensation code is required for all active payroll employees';
    END IF;
    
    RETURN NEW;
END;
$function$;