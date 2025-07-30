-- Create some sample training modules
INSERT INTO public.training_modules (
    title, 
    description, 
    estimated_duration, 
    is_required, 
    credit_value, 
    status,
    completion_method
) 
SELECT 'Workplace Violence Prevention', 'Comprehensive training on identifying and preventing workplace violence incidents', 45, true, 2, 'published', 'scene_based'
WHERE NOT EXISTS (SELECT 1 FROM training_modules WHERE title = 'Workplace Violence Prevention');

INSERT INTO public.training_modules (
    title, 
    description, 
    estimated_duration, 
    is_required, 
    credit_value, 
    status,
    completion_method
) 
SELECT 'Harassment Prevention Training', 'Essential training on preventing workplace harassment and creating inclusive environments', 60, true, 3, 'published', 'scene_based'
WHERE NOT EXISTS (SELECT 1 FROM training_modules WHERE title = 'Harassment Prevention Training');

INSERT INTO public.training_modules (
    title, 
    description, 
    estimated_duration, 
    is_required, 
    credit_value, 
    status,
    completion_method
) 
SELECT 'Emergency Response Procedures', 'Critical training on how to respond during workplace emergencies', 30, false, 1, 'published', 'scene_based'
WHERE NOT EXISTS (SELECT 1 FROM training_modules WHERE title = 'Emergency Response Procedures');

INSERT INTO public.training_modules (
    title, 
    description, 
    estimated_duration, 
    is_required, 
    credit_value, 
    status,
    completion_method
) 
SELECT 'Data Security Awareness', 'Training on protecting company and customer data from security threats', 40, true, 2, 'published', 'scene_based'
WHERE NOT EXISTS (SELECT 1 FROM training_modules WHERE title = 'Data Security Awareness');

-- Create training assignments and some completions for realistic data
DO $$
DECLARE
    module_rec RECORD;
    employee_rec RECORD;
    assignment_id UUID;
    completion_status TEXT;
    score INTEGER;
    completion_date TIMESTAMP WITH TIME ZONE;
    completion_record_id UUID;
BEGIN
    -- Loop through each training module
    FOR module_rec IN SELECT id, title FROM training_modules WHERE status = 'published' LOOP
        -- Loop through each employee
        FOR employee_rec IN SELECT id, email FROM employees WHERE status = 'active' LOOP
            -- Check if assignment already exists
            IF NOT EXISTS (
                SELECT 1 FROM training_assignments 
                WHERE employee_id = employee_rec.id AND training_module_id = module_rec.id
            ) THEN
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
                    ) RETURNING id INTO completion_record_id;
                    
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
                            completion_record_id,
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
            END IF;
        END LOOP;
    END LOOP;
END $$;