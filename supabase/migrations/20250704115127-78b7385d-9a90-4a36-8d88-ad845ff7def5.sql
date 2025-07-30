-- Add a sample company for testing
INSERT INTO company_settings (
    company_name,
    primary_color,
    certificate_template,
    email_notifications,
    max_employees,
    subscription_status
) VALUES (
    'Demo Corporation',
    '#655DC6',
    'default',
    true,
    100,
    'active'
);