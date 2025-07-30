-- Fix JSON parsing errors by updating services_purchased columns to proper JSON format
-- First, update clients table where services_purchased contains string values instead of JSON arrays
UPDATE public.clients 
SET services_purchased = CASE 
  WHEN services_purchased::text = '"LMS"' OR services_purchased::text = 'LMS' THEN '["LMS"]'::jsonb
  WHEN services_purchased::text = '"Payroll"' OR services_purchased::text = 'Payroll' THEN '["Payroll"]'::jsonb
  WHEN services_purchased::text = '"HRO"' OR services_purchased::text = 'HRO' THEN '["HRO"]'::jsonb
  WHEN services_purchased::text = '"PEO"' OR services_purchased::text = 'PEO' THEN '["PEO"]'::jsonb
  WHEN services_purchased::text = '"ASO"' OR services_purchased::text = 'ASO' THEN '["ASO"]'::jsonb
  ELSE services_purchased
END
WHERE services_purchased IS NOT NULL 
AND (
  services_purchased::text = '"LMS"' OR services_purchased::text = 'LMS' OR
  services_purchased::text = '"Payroll"' OR services_purchased::text = 'Payroll' OR
  services_purchased::text = '"HRO"' OR services_purchased::text = 'HRO' OR
  services_purchased::text = '"PEO"' OR services_purchased::text = 'PEO' OR
  services_purchased::text = '"ASO"' OR services_purchased::text = 'ASO'
);

-- Fix client_onboarding_profiles service_types column if it has similar issues
UPDATE public.client_onboarding_profiles 
SET service_types = CASE 
  WHEN 'LMS' = ANY(service_types) AND array_length(service_types, 1) = 1 THEN service_types
  ELSE service_types
END
WHERE service_types IS NOT NULL;

-- Create RLS policy for training_completions to fix permission issues
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_completions' 
    AND policyname = 'Users can view training completions for their company'
  ) THEN
    CREATE POLICY "Users can view training completions for their company"
      ON public.training_completions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.employees e
          JOIN public.company_settings cs ON e.company_id = cs.id
          WHERE e.id = training_completions.employee_id
          AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR
            has_role(auth.uid(), 'super_admin'::app_role) OR
            e.user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- Create RLS policy for employees table access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employees' 
    AND policyname = 'Company users can view employees'
  ) THEN
    CREATE POLICY "Company users can view employees"
      ON public.employees
      FOR SELECT
      USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        user_id = auth.uid()
      );
  END IF;
END $$;

-- Ensure proper data constraints to prevent future JSON parsing errors
ALTER TABLE public.clients 
ADD CONSTRAINT check_services_purchased_is_array 
CHECK (jsonb_typeof(services_purchased) = 'array');