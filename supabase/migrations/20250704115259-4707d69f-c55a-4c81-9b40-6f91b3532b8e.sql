-- Add test employees for Demo Corporation
DO $$
DECLARE
    demo_company_id UUID;
BEGIN
    -- Get Demo Corporation ID
    SELECT id INTO demo_company_id FROM company_settings WHERE company_name = 'Demo Corporation';
    
    -- Add employees for Demo Corporation
    INSERT INTO employees (first_name, last_name, email, employee_id, position, department, company_id, status) VALUES
    ('John', 'Smith', 'john.smith@democorp.com', 'DC001', 'Software Engineer', 'Engineering', demo_company_id, 'active'),
    ('Sarah', 'Johnson', 'sarah.johnson@democorp.com', 'DC002', 'Product Manager', 'Product', demo_company_id, 'active'),
    ('Michael', 'Brown', 'michael.brown@democorp.com', 'DC003', 'Senior Developer', 'Engineering', demo_company_id, 'active'),
    ('Emily', 'Davis', 'emily.davis@democorp.com', 'DC004', 'UX Designer', 'Design', demo_company_id, 'active'),
    ('Robert', 'Wilson', 'robert.wilson@democorp.com', 'DC005', 'DevOps Engineer', 'Engineering', demo_company_id, 'active'),
    ('Lisa', 'Garcia', 'lisa.garcia@democorp.com', 'DC006', 'HR Manager', 'Human Resources', demo_company_id, 'active'),
    ('David', 'Martinez', 'david.martinez@democorp.com', 'DC007', 'Marketing Specialist', 'Marketing', demo_company_id, 'active'),
    ('Jennifer', 'Anderson', 'jennifer.anderson@democorp.com', 'DC008', 'Sales Manager', 'Sales', demo_company_id, 'active'),
    ('James', 'Taylor', 'james.taylor@democorp.com', 'DC009', 'Data Analyst', 'Analytics', demo_company_id, 'active'),
    ('Amanda', 'Thomas', 'amanda.thomas@democorp.com', 'DC010', 'Customer Success', 'Support', demo_company_id, 'active');
END $$;