-- Create comprehensive sample payroll data for all companies
-- Fixed to use correct period_type values and status values

-- Create function to generate sample payroll data
CREATE OR REPLACE FUNCTION generate_sample_payroll_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    company_rec RECORD;
    employee_rec RECORD;
    emp_count INTEGER;
    pay_schedule TEXT;
    period_start DATE;
    period_end DATE;
    pay_date DATE;
    current_period DATE := '2025-01-01'::DATE;
    end_date DATE := '2025-07-11'::DATE;
    payroll_period_id UUID;
    gross_pay DECIMAL(10,2);
    overtime_hours DECIMAL(5,2);
    regular_hours DECIMAL(5,2);
    overtime_pay DECIMAL(10,2);
    total_taxes DECIMAL(10,2);
    net_pay DECIMAL(10,2);
    federal_tax DECIMAL(10,2);
    state_tax DECIMAL(10,2);
    social_security DECIMAL(10,2);
    medicare DECIMAL(10,2);
    pre_tax_deductions DECIMAL(10,2);
    i INTEGER;
    period_counter INTEGER;
BEGIN
    -- Loop through each unique company
    FOR company_rec IN 
        SELECT DISTINCT id, company_name 
        FROM company_settings 
        WHERE id IS NOT NULL
        ORDER BY company_name
        LIMIT 10 -- Limit to 10 companies to avoid timeout
    LOOP
        RAISE NOTICE 'Processing company: %', company_rec.company_name;
        
        -- Random employee count between 10-25
        emp_count := 10 + floor(random() * 16)::INTEGER;
        
        -- Random payroll schedule - use correct values
        CASE floor(random() * 3)::INTEGER
            WHEN 0 THEN pay_schedule := 'weekly';
            WHEN 1 THEN pay_schedule := 'bi-weekly';
            ELSE pay_schedule := 'monthly';
        END CASE;
        
        -- Create employees for this company
        FOR i IN 1..emp_count LOOP
            INSERT INTO payroll_employees (
                company_id,
                instructor_name,
                email,
                phone,
                hire_date,
                regular_hourly_rate,
                overtime_hourly_rate,
                pay_frequency,
                pay_type,
                is_active
            ) VALUES (
                company_rec.id,
                CASE floor(random() * 20)::INTEGER
                    WHEN 0 THEN 'John Smith'
                    WHEN 1 THEN 'Sarah Johnson' 
                    WHEN 2 THEN 'Michael Brown'
                    WHEN 3 THEN 'Emily Davis'
                    WHEN 4 THEN 'David Wilson'
                    WHEN 5 THEN 'Jessica Garcia'
                    WHEN 6 THEN 'Christopher Martinez'
                    WHEN 7 THEN 'Ashley Rodriguez'
                    WHEN 8 THEN 'Matthew Lopez'
                    WHEN 9 THEN 'Amanda Anderson'
                    WHEN 10 THEN 'James Taylor'
                    WHEN 11 THEN 'Nicole Thomas'
                    WHEN 12 THEN 'Daniel Jackson'
                    WHEN 13 THEN 'Stephanie White'
                    WHEN 14 THEN 'Joshua Harris'
                    WHEN 15 THEN 'Lauren Martin'
                    WHEN 16 THEN 'Ryan Thompson'
                    WHEN 17 THEN 'Melissa Clark'
                    WHEN 18 THEN 'Andrew Lewis'
                    ELSE 'Rachel Walker'
                END,
                'emp' || i || '@' || replace(lower(substr(company_rec.company_name, 1, 10)), ' ', '') || '.com',
                '(661) ' || LPAD(floor(random() * 999)::TEXT, 3, '0') || '-' || LPAD(floor(random() * 9999)::TEXT, 4, '0'),
                '2024-01-01'::DATE + (floor(random() * 365) || ' days')::INTERVAL,
                15.00 + (random() * 35)::DECIMAL(10,2), -- $15-50/hour
                CASE WHEN random() > 0.5 THEN (15.00 + (random() * 35)) * 1.5 ELSE NULL END,
                pay_schedule,
                CASE WHEN random() > 0.7 THEN 'salary' ELSE 'hourly' END,
                true
            );
        END LOOP;
        
        -- Generate payroll periods and calculations
        current_period := '2025-01-01'::DATE;
        period_counter := 0;
        
        WHILE current_period <= end_date AND period_counter < 10 LOOP -- Limit periods
            -- Calculate period dates based on schedule
            CASE pay_schedule
                WHEN 'weekly' THEN
                    period_start := current_period;
                    period_end := current_period + INTERVAL '6 days';
                    pay_date := current_period + INTERVAL '7 days';
                    current_period := current_period + INTERVAL '7 days';
                WHEN 'bi-weekly' THEN
                    period_start := current_period;
                    period_end := current_period + INTERVAL '13 days';
                    pay_date := current_period + INTERVAL '14 days';
                    current_period := current_period + INTERVAL '14 days';
                WHEN 'monthly' THEN
                    period_start := date_trunc('month', current_period);
                    period_end := (date_trunc('month', current_period) + INTERVAL '1 month' - INTERVAL '1 day');
                    pay_date := date_trunc('month', current_period) + INTERVAL '1 month';
                    current_period := date_trunc('month', current_period) + INTERVAL '1 month';
            END CASE;
            
            -- Skip if period_end is beyond our end date
            IF period_end > end_date THEN
                EXIT;
            END IF;
            
            -- Create payroll period
            INSERT INTO payroll_periods (
                company_id,
                start_date,
                end_date,
                period_start,
                period_end,
                pay_date,
                period_type,
                status,
                total_gross_pay,
                total_net_pay,
                total_taxes,
                total_deductions,
                employee_count
            ) VALUES (
                company_rec.id,
                period_start,
                period_end,
                period_start,
                period_end,
                pay_date,
                pay_schedule,
                CASE WHEN pay_date <= CURRENT_DATE THEN 'paid' ELSE 'draft' END,
                0, 0, 0, 0, emp_count
            ) RETURNING id INTO payroll_period_id;
            
            -- Create payroll calculations for each employee (limit to 8 per period)
            FOR employee_rec IN 
                SELECT id, regular_hourly_rate, pay_type, instructor_name
                FROM payroll_employees 
                WHERE company_id = company_rec.id 
                LIMIT 8
            LOOP
                -- Generate random hours and pay
                regular_hours := 35 + (random() * 10)::DECIMAL(5,2); -- 35-45 hours
                overtime_hours := CASE WHEN random() > 0.9 THEN (random() * 5)::DECIMAL(5,2) ELSE 0 END;
                
                IF employee_rec.pay_type = 'salary' THEN
                    gross_pay := (employee_rec.regular_hourly_rate * 40 * 52 / 
                        CASE pay_schedule 
                            WHEN 'weekly' THEN 52 
                            WHEN 'bi-weekly' THEN 26 
                            ELSE 12 
                        END)::DECIMAL(10,2);
                    overtime_pay := 0;
                ELSE
                    gross_pay := (employee_rec.regular_hourly_rate * regular_hours)::DECIMAL(10,2);
                    overtime_pay := (employee_rec.regular_hourly_rate * 1.5 * overtime_hours)::DECIMAL(10,2);
                    gross_pay := gross_pay + overtime_pay;
                END IF;
                
                -- Calculate taxes and deductions (simplified)
                federal_tax := (gross_pay * 0.12)::DECIMAL(10,2);
                state_tax := (gross_pay * 0.08)::DECIMAL(10,2);
                social_security := (gross_pay * 0.062)::DECIMAL(10,2);
                medicare := (gross_pay * 0.0145)::DECIMAL(10,2);
                pre_tax_deductions := (gross_pay * (random() * 0.05))::DECIMAL(10,2);
                
                total_taxes := federal_tax + state_tax + social_security + medicare;
                net_pay := gross_pay - total_taxes - pre_tax_deductions;
                
                -- Insert payroll calculation
                INSERT INTO payroll_calculations (
                    payroll_period_id,
                    payroll_employee_id,
                    total_classes,
                    total_class_pay,
                    total_regular_hours,
                    total_overtime_hours,
                    blended_rate,
                    overtime_pay,
                    regular_pay,
                    gross_pay,
                    calculation_details
                ) VALUES (
                    payroll_period_id,
                    employee_rec.id,
                    floor(random() * 20)::INTEGER,
                    (random() * 500)::DECIMAL(10,2),
                    regular_hours,
                    overtime_hours,
                    employee_rec.regular_hourly_rate,
                    overtime_pay,
                    gross_pay - overtime_pay,
                    gross_pay,
                    jsonb_build_object(
                        'federal_tax', federal_tax,
                        'state_tax', state_tax,
                        'social_security', social_security,
                        'medicare', medicare,
                        'pre_tax_deductions', pre_tax_deductions,
                        'net_pay', net_pay,
                        'calculation_date', CURRENT_TIMESTAMP,
                        'pay_schedule', pay_schedule
                    )
                );
            END LOOP;
            
            -- Update payroll period totals
            UPDATE payroll_periods 
            SET 
                total_gross_pay = (
                    SELECT COALESCE(SUM(gross_pay), 0) 
                    FROM payroll_calculations 
                    WHERE payroll_period_id = payroll_periods.id
                ),
                total_net_pay = (
                    SELECT COALESCE(SUM((calculation_details->>'net_pay')::DECIMAL), 0) 
                    FROM payroll_calculations 
                    WHERE payroll_period_id = payroll_periods.id
                ),
                employee_count = (
                    SELECT COUNT(*) 
                    FROM payroll_calculations 
                    WHERE payroll_period_id = payroll_periods.id
                )
            WHERE id = payroll_period_id;
            
            period_counter := period_counter + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Sample payroll data generation completed for 10 companies!';
END;
$$;

-- Execute the data generation
SELECT generate_sample_payroll_data();

-- Drop the temporary function
DROP FUNCTION generate_sample_payroll_data();