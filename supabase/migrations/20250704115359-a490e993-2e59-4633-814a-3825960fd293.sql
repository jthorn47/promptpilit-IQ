-- Add training assignments and completions for Demo Corporation employees
DO $$
DECLARE
    demo_employees RECORD;
    training_module RECORD;
    assignment_id UUID;
    completion_id UUID;
    cert_number TEXT;
BEGIN
    -- Create training assignments for each employee and each training module
    FOR demo_employees IN 
        SELECT e.id as employee_id, e.first_name, e.last_name
        FROM employees e 
        JOIN company_settings cs ON e.company_id = cs.id 
        WHERE cs.company_name = 'Demo Corporation'
    LOOP
        FOR training_module IN 
            SELECT id as module_id, title 
            FROM training_modules 
            LIMIT 4
        LOOP
            -- Create assignment
            INSERT INTO training_assignments (
                employee_id, 
                training_module_id, 
                assigned_at, 
                due_date, 
                status,
                priority
            ) VALUES (
                demo_employees.employee_id,
                training_module.module_id,
                NOW() - INTERVAL '30 days' + (RANDOM() * INTERVAL '25 days'),
                NOW() + INTERVAL '30 days',
                CASE 
                    WHEN RANDOM() < 0.7 THEN 'completed'
                    WHEN RANDOM() < 0.9 THEN 'in_progress' 
                    ELSE 'assigned'
                END,
                CASE 
                    WHEN RANDOM() < 0.3 THEN 'high'
                    WHEN RANDOM() < 0.7 THEN 'normal'
                    ELSE 'low'
                END
            ) RETURNING id INTO assignment_id;
            
            -- Create completion record if assigned status is completed or in_progress
            IF (SELECT status FROM training_assignments WHERE id = assignment_id) IN ('completed', 'in_progress') THEN
                INSERT INTO training_completions (
                    assignment_id,
                    training_module_id,
                    employee_id,
                    started_at,
                    completed_at,
                    progress_percentage,
                    quiz_score,
                    quiz_passed,
                    status
                ) VALUES (
                    assignment_id,
                    training_module.module_id,
                    demo_employees.employee_id,
                    NOW() - INTERVAL '20 days' + (RANDOM() * INTERVAL '15 days'),
                    CASE 
                        WHEN (SELECT status FROM training_assignments WHERE id = assignment_id) = 'completed' 
                        THEN NOW() - INTERVAL '5 days' + (RANDOM() * INTERVAL '10 days')
                        ELSE NULL 
                    END,
                    CASE 
                        WHEN (SELECT status FROM training_assignments WHERE id = assignment_id) = 'completed' THEN 100
                        ELSE (60 + (RANDOM() * 35))::INTEGER 
                    END,
                    (70 + (RANDOM() * 30))::INTEGER,
                    CASE 
                        WHEN (SELECT status FROM training_assignments WHERE id = assignment_id) = 'completed' THEN TRUE
                        ELSE (RANDOM() < 0.8) 
                    END,
                    (SELECT status FROM training_assignments WHERE id = assignment_id)
                ) RETURNING id INTO completion_id;
                
                -- Create certificate for completed trainings
                IF (SELECT status FROM training_assignments WHERE id = assignment_id) = 'completed' THEN
                    cert_number := 'CERT-DC-' || LPAD((RANDOM() * 99999)::INTEGER::TEXT, 5, '0');
                    
                    INSERT INTO certificates (
                        employee_id,
                        training_module_id,
                        completion_id,
                        certificate_number,
                        issued_at,
                        expires_at,
                        verification_token,
                        status,
                        certificate_data
                    ) VALUES (
                        demo_employees.employee_id,
                        training_module.module_id,
                        completion_id,
                        cert_number,
                        NOW() - INTERVAL '5 days' + (RANDOM() * INTERVAL '10 days'),
                        NOW() + INTERVAL '1 year',
                        SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 32),
                        'active',
                        JSON_BUILD_OBJECT(
                            'employee_name', demo_employees.first_name || ' ' || demo_employees.last_name,
                            'training_title', training_module.title,
                            'completion_date', (NOW() - INTERVAL '5 days' + (RANDOM() * INTERVAL '10 days'))::DATE,
                            'grade', 'Pass'
                        )
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END $$;