-- Add missing columns to employees table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'employee_number') THEN
        ALTER TABLE public.employees ADD COLUMN employee_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'phone') THEN
        ALTER TABLE public.employees ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'address') THEN
        ALTER TABLE public.employees ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'city') THEN
        ALTER TABLE public.employees ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'state') THEN
        ALTER TABLE public.employees ADD COLUMN state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'zip_code') THEN
        ALTER TABLE public.employees ADD COLUMN zip_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'hire_date') THEN
        ALTER TABLE public.employees ADD COLUMN hire_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'termination_date') THEN
        ALTER TABLE public.employees ADD COLUMN termination_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'job_title') THEN
        ALTER TABLE public.employees ADD COLUMN job_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'department') THEN
        ALTER TABLE public.employees ADD COLUMN department TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'salary') THEN
        ALTER TABLE public.employees ADD COLUMN salary DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'hourly_rate') THEN
        ALTER TABLE public.employees ADD COLUMN hourly_rate DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'employment_type') THEN
        ALTER TABLE public.employees ADD COLUMN employment_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'status') THEN
        ALTER TABLE public.employees ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'manager_id') THEN
        ALTER TABLE public.employees ADD COLUMN manager_id UUID REFERENCES public.employees(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE public.employees ADD COLUMN emergency_contact_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE public.employees ADD COLUMN emergency_contact_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_relationship') THEN
        ALTER TABLE public.employees ADD COLUMN emergency_contact_relationship TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'ssn_last_four') THEN
        ALTER TABLE public.employees ADD COLUMN ssn_last_four TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.employees ADD COLUMN date_of_birth DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'gender') THEN
        ALTER TABLE public.employees ADD COLUMN gender TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'marital_status') THEN
        ALTER TABLE public.employees ADD COLUMN marital_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'is_active') THEN
        ALTER TABLE public.employees ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Generate employees data for active client companies that don't have employees yet
DO $$
DECLARE
    client_record RECORD;
    target_employee_count INTEGER;
    new_employee_id UUID;
    i INTEGER;
    random_first_names TEXT[] := ARRAY['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda', 'James', 'Michelle', 'Christopher', 'Stephanie', 'Daniel', 'Nicole', 'Matthew', 'Ashley', 'Anthony', 'Kimberly', 'Mark', 'Elizabeth', 'Donald', 'Dorothy', 'Steven', 'Lisa', 'Paul', 'Nancy', 'Andrew', 'Karen', 'Joshua', 'Betty', 'Kenneth', 'Helen', 'Kevin', 'Sandra', 'Brian', 'Donna', 'George', 'Carol', 'Edward', 'Ruth', 'Ronald', 'Sharon', 'Timothy', 'Michelle', 'Jason', 'Laura', 'Jeffrey', 'Sarah', 'Ryan', 'Kimberly', 'Jacob', 'Deborah', 'Gary', 'Dorothy', 'Nicholas', 'Lisa', 'Eric', 'Nancy', 'Jonathan', 'Karen', 'Stephen', 'Betty', 'Larry', 'Helen', 'Justin', 'Sandra', 'Scott', 'Donna', 'Brandon', 'Carol', 'Benjamin', 'Ruth', 'Samuel', 'Sharon', 'Gregory', 'Michelle', 'Frank', 'Laura', 'Raymond', 'Sarah', 'Alexander', 'Kimberly', 'Patrick', 'Deborah', 'Jack', 'Dorothy', 'Dennis', 'Lisa', 'Jerry', 'Nancy', 'Tyler', 'Karen', 'Aaron', 'Betty'];
    random_last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'];
    random_departments TEXT[] := ARRAY['Human Resources', 'Information Technology', 'Sales', 'Marketing', 'Finance', 'Operations', 'Customer Service', 'Administration', 'Engineering', 'Quality Assurance', 'Research and Development', 'Legal', 'Procurement', 'Facilities', 'Training'];
    random_job_titles TEXT[] := ARRAY['Manager', 'Senior Analyst', 'Coordinator', 'Specialist', 'Associate', 'Director', 'Supervisor', 'Representative', 'Administrator', 'Technician', 'Consultant', 'Executive', 'Lead', 'Senior Manager', 'Vice President'];
    rand_salary DECIMAL(12,2);
    rand_hourly_rate DECIMAL(10,2);
    rand_first_name TEXT;
    rand_last_name TEXT;
    rand_department TEXT;
    rand_job_title TEXT;
    total_employees_added INTEGER := 0;
    existing_employees INTEGER;
BEGIN
    -- Loop through all active client companies
    FOR client_record IN 
        SELECT id, company_name, max_employees 
        FROM public.company_settings 
        WHERE subscription_status IN ('active', 'premium')
    LOOP
        -- Check if employees already exist for this company
        SELECT COUNT(*) INTO existing_employees
        FROM public.employees
        WHERE company_id = client_record.id;
        
        -- Skip if employees already exist
        IF existing_employees > 0 THEN
            RAISE NOTICE 'Skipping %, already has % employees', client_record.company_name, existing_employees;
            CONTINUE;
        END IF;
        
        -- Check if this is North Kern South Tulare (set to 253 employees)
        IF client_record.company_name = 'North Kern South Tulare' THEN
            target_employee_count := 253;
        ELSE
            -- Random employee count between 5 and 254
            target_employee_count := floor(random() * 250 + 5)::INTEGER;
        END IF;
        
        -- Update the company's max_employees to match actual employee count
        UPDATE public.company_settings 
        SET max_employees = target_employee_count
        WHERE id = client_record.id;
        
        RAISE NOTICE 'Adding % employees to %', target_employee_count, client_record.company_name;
        
        -- Add employees for this company
        FOR i IN 1..target_employee_count LOOP
            -- Generate random employee data
            rand_first_name := random_first_names[floor(random() * array_length(random_first_names, 1) + 1)];
            rand_last_name := random_last_names[floor(random() * array_length(random_last_names, 1) + 1)];
            rand_department := random_departments[floor(random() * array_length(random_departments, 1) + 1)];
            rand_job_title := random_job_titles[floor(random() * array_length(random_job_titles, 1) + 1)];
            rand_salary := (floor(random() * 80000 + 35000))::DECIMAL(12,2);
            rand_hourly_rate := (floor(random() * 40 + 15))::DECIMAL(10,2);
            
            -- Insert employee with all required columns
            INSERT INTO public.employees (
                company_id,
                employee_number,
                first_name,
                last_name,
                email,
                phone,
                hire_date,
                job_title,
                department,
                salary,
                hourly_rate,
                employment_type,
                status
            ) VALUES (
                client_record.id,
                'EMP-' || LPAD(i::TEXT, 4, '0'),
                rand_first_name,
                rand_last_name,
                LOWER(rand_first_name || '.' || rand_last_name || '@' || REPLACE(LOWER(client_record.company_name), ' ', '') || '.com'),
                '(' || (floor(random() * 900 + 100))::TEXT || ') ' || (floor(random() * 900 + 100))::TEXT || '-' || (floor(random() * 9000 + 1000))::TEXT,
                CURRENT_DATE - (floor(random() * 1825) || ' days')::INTERVAL,
                rand_job_title,
                rand_department,
                rand_salary,
                rand_hourly_rate,
                CASE 
                    WHEN random() < 0.85 THEN 'full_time'
                    WHEN random() < 0.95 THEN 'part_time'
                    ELSE 'contractor'
                END,
                CASE 
                    WHEN random() < 0.95 THEN 'active'
                    ELSE 'inactive'
                END
            ) RETURNING id INTO new_employee_id;
            
            -- Insert corresponding payroll employee record
            INSERT INTO public.payroll_employees (
                employee_id,
                company_id,
                payroll_id,
                instructor_name,
                regular_hourly_rate,
                overtime_rate,
                pay_frequency,
                federal_allowances,
                state_allowances
            ) VALUES (
                new_employee_id,
                client_record.id,
                'PAY-' || LPAD(i::TEXT, 4, '0'),
                rand_first_name || ' ' || rand_last_name,
                rand_hourly_rate,
                rand_hourly_rate * 1.5,
                CASE 
                    WHEN random() < 0.7 THEN 'bi_weekly'
                    WHEN random() < 0.9 THEN 'weekly'
                    ELSE 'monthly'
                END,
                floor(random() * 5)::INTEGER,
                floor(random() * 3)::INTEGER
            );
            
            total_employees_added := total_employees_added + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Total employees added: %', total_employees_added;
END $$;