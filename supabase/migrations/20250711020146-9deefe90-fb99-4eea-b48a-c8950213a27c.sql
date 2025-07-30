-- Create relationship between clients and company_settings for payroll
-- Add company_settings_id to clients table to link with payroll system

ALTER TABLE public.clients 
ADD COLUMN company_settings_id UUID REFERENCES public.company_settings(id);

-- Create a function to ensure all clients have payroll employees
CREATE OR REPLACE FUNCTION ensure_clients_have_payroll()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    client_rec RECORD;
    company_settings_id UUID;
    employee_count INTEGER;
BEGIN
    -- Loop through all clients that don't have company_settings linked
    FOR client_rec IN 
        SELECT id, company_name 
        FROM public.clients 
        WHERE company_settings_id IS NULL
        ORDER BY date_won DESC
    LOOP
        -- Create or find matching company_settings record
        SELECT id INTO company_settings_id 
        FROM public.company_settings 
        WHERE company_name ILIKE client_rec.company_name 
        LIMIT 1;
        
        -- If no matching company_settings, create one
        IF company_settings_id IS NULL THEN
            INSERT INTO public.company_settings (company_name, primary_color, subscription_status)
            VALUES (client_rec.company_name, '#655DC6', 'active')
            RETURNING id INTO company_settings_id;
        END IF;
        
        -- Link client to company_settings
        UPDATE public.clients 
        SET company_settings_id = company_settings_id 
        WHERE id = client_rec.id;
        
        -- Check if company has payroll employees
        SELECT COUNT(*) INTO employee_count 
        FROM public.payroll_employees 
        WHERE company_id = company_settings_id;
        
        -- If no employees, create some sample employees for the client
        IF employee_count = 0 THEN
            -- Create 3-8 employees per client
            FOR i IN 1..(3 + floor(random() * 6)::INTEGER) LOOP
                INSERT INTO public.payroll_employees (
                    company_id,
                    instructor_name,
                    regular_hourly_rate,
                    standard_class_rate,
                    saturday_class_rate,
                    is_active
                ) VALUES (
                    company_settings_id,
                    CASE floor(random() * 15)::INTEGER
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
                        ELSE 'Joshua Harris'
                    END,
                    18.00 + (random() * 32)::DECIMAL(10,2), -- $18-50/hour
                    45.00 + (random() * 25)::DECIMAL(10,2), -- $45-70 class rate
                    60.00 + (random() * 30)::DECIMAL(10,2), -- $60-90 Saturday rate
                    true
                );
            END LOOP;
            
            RAISE NOTICE 'Created payroll employees for client: %', client_rec.company_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All clients now have payroll employees!';
END;
$$;

-- Execute the function to ensure all clients have payroll
SELECT ensure_clients_have_payroll();

-- Drop the temporary function
DROP FUNCTION ensure_clients_have_payroll();