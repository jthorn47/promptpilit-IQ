-- Add sample F45 company and test data for payroll system

-- First, let's get the current user's ID for reference
-- Note: You'll need to replace this with your actual user ID when running

-- Create a sample F45 company
INSERT INTO public.company_settings (
    company_name, 
    primary_color, 
    email_notifications, 
    max_employees,
    subscription_status
) VALUES (
    'F45 Training Downtown', 
    '#FF6B35', 
    true, 
    50,
    'active'
);

-- Get the company ID (this will be the most recent one)
-- Create company location
INSERT INTO public.company_locations (
    company_id, 
    location_name, 
    manager_name, 
    address,
    city,
    state,
    zip_code,
    is_primary, 
    is_active
) VALUES (
    (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'),
    'Downtown Studio', 
    'Studio Manager', 
    '123 Main Street',
    'Los Angeles',
    'CA',
    '90210',
    true, 
    true
);

-- Add sample payroll employees (F45 instructors)
INSERT INTO public.payroll_employees (
    company_id,
    instructor_name,
    regular_hourly_rate,
    standard_class_rate,
    saturday_class_rate,
    is_active
) VALUES 
    ((SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'), 'Sarah Johnson', 20.00, 45.00, 60.00, true),
    ((SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'), 'Mike Chen', 22.00, 45.00, 60.00, true),
    ((SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'), 'Emma Rodriguez', 21.00, 45.00, 60.00, true),
    ((SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'), 'David Wilson', 23.00, 45.00, 60.00, true),
    ((SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'), 'Ashley Kim', 20.50, 45.00, 60.00, true);

-- Create a sample payroll period (current week)
INSERT INTO public.payroll_periods (
    company_id,
    start_date,
    end_date,
    period_type,
    status
) VALUES (
    (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown'),
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    'weekly',
    'draft'
);

-- Add sample classes for the payroll period
INSERT INTO public.payroll_classes (
    payroll_period_id,
    payroll_employee_id,
    class_date,
    class_time,
    class_type,
    class_rate,
    is_split,
    split_percentage,
    actual_pay,
    is_saturday
) VALUES 
    -- Sarah Johnson classes
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '6 days', '09:00', 'F45 Strength', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '5 days', '10:00', 'F45 Cardio', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '2 days', '09:00', 'F45 Hybrid', 60.00, false, 100.00, 60.00, true),
    
    -- Mike Chen classes
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '6 days', '18:00', 'F45 Strength', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '4 days', '19:00', 'F45 Cardio', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '1 day', '10:00', 'F45 Strength', 60.00, false, 100.00, 60.00, true),
    
    -- Emma Rodriguez classes
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Emma Rodriguez'),
     CURRENT_DATE - INTERVAL '5 days', '06:00', 'F45 Cardio', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Emma Rodriguez'),
     CURRENT_DATE - INTERVAL '3 days', '07:00', 'F45 Hybrid', 45.00, false, 100.00, 45.00, false),
    
    -- David Wilson classes
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'David Wilson'),
     CURRENT_DATE - INTERVAL '4 days', '17:00', 'F45 Strength', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'David Wilson'),
     CURRENT_DATE - INTERVAL '2 days', '11:00', 'F45 Cardio', 60.00, false, 100.00, 60.00, true),
    
    -- Ashley Kim classes
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Ashley Kim'),
     CURRENT_DATE - INTERVAL '6 days', '16:00', 'F45 Hybrid', 45.00, false, 100.00, 45.00, false),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Ashley Kim'),
     CURRENT_DATE - INTERVAL '3 days', '17:00', 'F45 Strength', 45.00, false, 100.00, 45.00, false);

-- Add sample time entries for some employees (for overtime calculation testing)
INSERT INTO public.payroll_time_entries (
    payroll_period_id,
    payroll_employee_id,
    work_date,
    total_hours,
    source
) VALUES 
    -- Sarah Johnson - 42 hours (2 hours overtime)
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '6 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '5 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '4 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '3 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Sarah Johnson'),
     CURRENT_DATE - INTERVAL '2 days', 10.0, 'manual'),
    
    -- Mike Chen - 38 hours (no overtime)
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '6 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '4 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '3 days', 8.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '2 days', 7.0, 'manual'),
    
    ((SELECT id FROM public.payroll_periods WHERE company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown') ORDER BY created_at DESC LIMIT 1),
     (SELECT id FROM public.payroll_employees WHERE instructor_name = 'Mike Chen'),
     CURRENT_DATE - INTERVAL '1 day', 7.0, 'manual');