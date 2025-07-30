-- Add test companies and employees for LMS reports testing

-- First, let's create some test companies (removing ON CONFLICT since there's no unique constraint)
INSERT INTO public.company_settings (company_name, primary_color, max_employees, subscription_status) 
SELECT 'Tech Solutions Inc', '#3B82F6', 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE company_name = 'Tech Solutions Inc');

INSERT INTO public.company_settings (company_name, primary_color, max_employees, subscription_status) 
SELECT 'Marketing Plus LLC', '#10B981', 25, 'active'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE company_name = 'Marketing Plus LLC');

INSERT INTO public.company_settings (company_name, primary_color, max_employees, subscription_status) 
SELECT 'Design Studio Co', '#8B5CF6', 30, 'active'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE company_name = 'Design Studio Co');

-- Get company IDs and create employees
DO $$
DECLARE
    tech_company_id UUID;
    marketing_company_id UUID;
    design_company_id UUID;
    i INTEGER;
BEGIN
    -- Get company IDs
    SELECT id INTO tech_company_id FROM company_settings WHERE company_name = 'Tech Solutions Inc' LIMIT 1;
    SELECT id INTO marketing_company_id FROM company_settings WHERE company_name = 'Marketing Plus LLC' LIMIT 1;
    SELECT id INTO design_company_id FROM company_settings WHERE company_name = 'Design Studio Co' LIMIT 1;
    
    -- Create employees for Tech Solutions Inc
    FOR i IN 1..10 LOOP
        INSERT INTO public.employees (
            email, 
            first_name, 
            last_name, 
            employee_id, 
            department, 
            position, 
            company_id,
            status
        ) 
        SELECT 
            'employee' || i || '@techsolutions.com',
            CASE i
                WHEN 1 THEN 'John'
                WHEN 2 THEN 'Sarah'
                WHEN 3 THEN 'Michael'
                WHEN 4 THEN 'Emily'
                WHEN 5 THEN 'David'
                WHEN 6 THEN 'Jessica'
                WHEN 7 THEN 'Robert'
                WHEN 8 THEN 'Amanda'
                WHEN 9 THEN 'Chris'
                WHEN 10 THEN 'Lisa'
            END,
            CASE i
                WHEN 1 THEN 'Smith'
                WHEN 2 THEN 'Johnson'
                WHEN 3 THEN 'Williams'
                WHEN 4 THEN 'Brown'
                WHEN 5 THEN 'Jones'
                WHEN 6 THEN 'Garcia'
                WHEN 7 THEN 'Miller'
                WHEN 8 THEN 'Davis'
                WHEN 9 THEN 'Rodriguez'
                WHEN 10 THEN 'Wilson'
            END,
            'TS-00' || i,
            CASE 
                WHEN i <= 3 THEN 'Engineering'
                WHEN i <= 6 THEN 'Sales'
                WHEN i <= 8 THEN 'Marketing'
                ELSE 'HR'
            END,
            CASE 
                WHEN i <= 2 THEN 'Senior Developer'
                WHEN i <= 4 THEN 'Sales Manager'
                WHEN i <= 6 THEN 'Sales Rep'
                WHEN i <= 8 THEN 'Marketing Specialist'
                ELSE 'HR Coordinator'
            END,
            tech_company_id,
            'active'
        WHERE NOT EXISTS (
            SELECT 1 FROM employees WHERE email = 'employee' || i || '@techsolutions.com'
        );
    END LOOP;
    
    -- Create employees for Marketing Plus LLC
    FOR i IN 1..10 LOOP
        INSERT INTO public.employees (
            email, 
            first_name, 
            last_name, 
            employee_id, 
            department, 
            position, 
            company_id,
            status
        ) 
        SELECT 
            'staff' || i || '@marketingplus.com',
            CASE i
                WHEN 1 THEN 'Alex'
                WHEN 2 THEN 'Maria'
                WHEN 3 THEN 'James'
                WHEN 4 THEN 'Nicole'
                WHEN 5 THEN 'Ryan'
                WHEN 6 THEN 'Ashley'
                WHEN 7 THEN 'Brandon'
                WHEN 8 THEN 'Rachel'
                WHEN 9 THEN 'Kevin'
                WHEN 10 THEN 'Stephanie'
            END,
            CASE i
                WHEN 1 THEN 'Anderson'
                WHEN 2 THEN 'Taylor'
                WHEN 3 THEN 'Thomas'
                WHEN 4 THEN 'Hernandez'
                WHEN 5 THEN 'Moore'
                WHEN 6 THEN 'Martin'
                WHEN 7 THEN 'Jackson'
                WHEN 8 THEN 'Thompson'
                WHEN 9 THEN 'White'
                WHEN 10 THEN 'Lopez'
            END,
            'MP-00' || i,
            CASE 
                WHEN i <= 4 THEN 'Marketing'
                WHEN i <= 7 THEN 'Creative'
                ELSE 'Account Management'
            END,
            CASE 
                WHEN i <= 2 THEN 'Marketing Manager'
                WHEN i <= 4 THEN 'Marketing Coordinator'
                WHEN i <= 6 THEN 'Graphic Designer'
                WHEN i <= 7 THEN 'Creative Director'
                ELSE 'Account Manager'
            END,
            marketing_company_id,
            'active'
        WHERE NOT EXISTS (
            SELECT 1 FROM employees WHERE email = 'staff' || i || '@marketingplus.com'
        );
    END LOOP;
    
    -- Create employees for Design Studio Co
    FOR i IN 1..10 LOOP
        INSERT INTO public.employees (
            email, 
            first_name, 
            last_name, 
            employee_id, 
            department, 
            position, 
            company_id,
            status
        ) 
        SELECT 
            'designer' || i || '@designstudio.com',
            CASE i
                WHEN 1 THEN 'Jordan'
                WHEN 2 THEN 'Taylor'
                WHEN 3 THEN 'Casey'
                WHEN 4 THEN 'Morgan'
                WHEN 5 THEN 'Jamie'
                WHEN 6 THEN 'Quinn'
                WHEN 7 THEN 'Blake'
                WHEN 8 THEN 'Avery'
                WHEN 9 THEN 'Riley'
                WHEN 10 THEN 'Sage'
            END,
            CASE i
                WHEN 1 THEN 'Clark'
                WHEN 2 THEN 'Lewis'
                WHEN 3 THEN 'Lee'
                WHEN 4 THEN 'Walker'
                WHEN 5 THEN 'Hall'
                WHEN 6 THEN 'Allen'
                WHEN 7 THEN 'Young'
                WHEN 8 THEN 'King'
                WHEN 9 THEN 'Wright'
                WHEN 10 THEN 'Scott'
            END,
            'DS-00' || i,
            CASE 
                WHEN i <= 6 THEN 'Design'
                WHEN i <= 8 THEN 'Development'
                ELSE 'Operations'
            END,
            CASE 
                WHEN i <= 2 THEN 'Senior Designer'
                WHEN i <= 4 THEN 'UI/UX Designer'
                WHEN i <= 6 THEN 'Junior Designer'
                WHEN i <= 8 THEN 'Frontend Developer'
                ELSE 'Project Manager'
            END,
            design_company_id,
            'active'
        WHERE NOT EXISTS (
            SELECT 1 FROM employees WHERE email = 'designer' || i || '@designstudio.com'
        );
    END LOOP;
    
END $$;