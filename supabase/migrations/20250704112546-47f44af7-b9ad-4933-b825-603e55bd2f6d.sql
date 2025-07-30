-- Add test companies and employees for LMS reports testing

-- First, let's create some test companies
INSERT INTO public.company_settings (company_name, primary_color, max_employees, subscription_status) VALUES
('Tech Solutions Inc', '#3B82F6', 50, 'active'),
('Marketing Plus LLC', '#10B981', 25, 'active'),
('Design Studio Co', '#8B5CF6', 30, 'active')
ON CONFLICT (company_name) DO NOTHING;

-- Get company IDs for reference
DO $$
DECLARE
    tech_company_id UUID;
    marketing_company_id UUID;
    design_company_id UUID;
    i INTEGER;
    employee_data RECORD;
BEGIN
    -- Get company IDs
    SELECT id INTO tech_company_id FROM company_settings WHERE company_name = 'Tech Solutions Inc';
    SELECT id INTO marketing_company_id FROM company_settings WHERE company_name = 'Marketing Plus LLC';
    SELECT id INTO design_company_id FROM company_settings WHERE company_name = 'Design Studio Co';
    
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
        ) VALUES (
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
        ) ON CONFLICT (email) DO NOTHING;
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
        ) VALUES (
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
        ) ON CONFLICT (email) DO NOTHING;
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
        ) VALUES (
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
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;
    
END $$;

-- Create some sample training modules
INSERT INTO public.training_modules (
    title, 
    description, 
    estimated_duration, 
    is_required, 
    credit_value, 
    status,
    completion_method
) VALUES
(
    'Workplace Violence Prevention', 
    'Comprehensive training on identifying and preventing workplace violence incidents', 
    45, 
    true, 
    2, 
    'published',
    'scene_based'
),
(
    'Harassment Prevention Training', 
    'Essential training on preventing workplace harassment and creating inclusive environments', 
    60, 
    true, 
    3, 
    'published',
    'scene_based'
),
(
    'Emergency Response Procedures', 
    'Critical training on how to respond during workplace emergencies', 
    30, 
    false, 
    1, 
    'published',
    'scene_based'
),
(
    'Data Security Awareness', 
    'Training on protecting company and customer data from security threats', 
    40, 
    true, 
    2, 
    'published',
    'scene_based'
)
ON CONFLICT (title) DO NOTHING;

-- Create training assignments and some completions for realistic data
DO $$
DECLARE
    module_rec RECORD;
    employee_rec RECORD;
    assignment_id UUID;
    completion_status TEXT;
    score INTEGER;
    completion_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Loop through each training module
    FOR module_rec IN SELECT id, title FROM training_modules WHERE status = 'published' LOOP
        -- Loop through each employee
        FOR employee_rec IN SELECT id, email FROM employees WHERE status = 'active' LOOP
            -- Create assignment
            INSERT INTO training_assignments (
                employee_id, 
                training_module_id, 
                assigned_at,
                due_date,
                status,
                priority
            ) VALUES (
                employee_rec.id,
                module_rec.id,
                now() - INTERVAL '30 days',
                now() + INTERVAL '30 days',
                'assigned',
                'normal'
            ) 
            RETURNING id INTO assignment_id;
            
            -- Randomly assign completion status (70% completion rate)
            IF random() < 0.7 THEN
                completion_status := 'completed';
                score := 75 + (random() * 25)::INTEGER; -- Scores between 75-100
                completion_date := now() - (random() * INTERVAL '25 days');
                
                -- Create completion record
                INSERT INTO training_completions (
                    assignment_id,
                    employee_id,
                    training_module_id,
                    started_at,
                    completed_at,
                    video_watched_seconds,
                    video_total_seconds,
                    quiz_attempts,
                    quiz_score,
                    quiz_passed,
                    progress_percentage,
                    status
                ) VALUES (
                    assignment_id,
                    employee_rec.id,
                    module_rec.id,
                    completion_date - INTERVAL '1 hour',
                    completion_date,
                    2700, -- 45 minutes
                    2700,
                    1,
                    score,
                    score >= 80,
                    100,
                    'completed'
                );
                
                -- Create certificate if passed
                IF score >= 80 THEN
                    INSERT INTO certificates (
                        certificate_number,
                        employee_id,
                        training_module_id,
                        completion_id,
                        certificate_data,
                        issued_at,
                        expires_at,
                        verification_token,
                        status
                    ) VALUES (
                        'CERT-' || TO_CHAR(completion_date, 'YYYYMMDD') || '-' || LEFT(employee_rec.id::TEXT, 8),
                        employee_rec.id,
                        module_rec.id,
                        (SELECT id FROM training_completions WHERE assignment_id = assignment_id),
                        jsonb_build_object(
                            'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = employee_rec.id),
                            'module_title', module_rec.title,
                            'completion_date', completion_date,
                            'score', score
                        ),
                        completion_date,
                        completion_date + INTERVAL '1 year',
                        encode(gen_random_bytes(16), 'hex'),
                        'active'
                    );
                END IF;
                
            ELSE
                -- 30% are in progress or not started
                IF random() < 0.5 THEN
                    completion_status := 'in_progress';
                    score := 0;
                    
                    INSERT INTO training_completions (
                        assignment_id,
                        employee_id,
                        training_module_id,
                        started_at,
                        video_watched_seconds,
                        video_total_seconds,
                        quiz_attempts,
                        quiz_score,
                        quiz_passed,
                        progress_percentage,
                        status
                    ) VALUES (
                        assignment_id,
                        employee_rec.id,
                        module_rec.id,
                        now() - (random() * INTERVAL '10 days'),
                        1350, -- Half completed
                        2700,
                        0,
                        0,
                        false,
                        50,
                        'in_progress'
                    );
                END IF;
            END IF;
            
        END LOOP;
    END LOOP;
END $$;