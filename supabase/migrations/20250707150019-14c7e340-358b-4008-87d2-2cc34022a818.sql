-- Remove only obvious sample/demo data while preserving HubSpot imports
-- Keep HubSpot data but remove only clearly fake/demo records

-- Remove only employees with obvious demo/test emails (preserve HubSpot imports)
DELETE FROM employees 
WHERE email ILIKE '%@democorp.com'
OR email ILIKE '%test%'
OR email ILIKE '%sample%'
OR email ILIKE '%demo%'
OR email ILIKE '%example.com'
OR email ILIKE '%fake%'
OR first_name ILIKE '%demo%'
OR first_name ILIKE '%test%'
OR last_name ILIKE '%demo%'
OR last_name ILIKE '%test%';

-- Remove only obvious demo assessments (preserve real ones)
DELETE FROM assessments 
WHERE company_name ILIKE '%demo%'
OR company_name ILIKE '%test%'
OR company_name ILIKE '%sample%'
OR company_email ILIKE '%demo%'
OR company_email ILIKE '%test%'
OR company_email ILIKE '%sample%';

-- Clean up orphaned records after employee cleanup
DELETE FROM training_assignments WHERE employee_id NOT IN (SELECT id FROM employees);
DELETE FROM training_completions WHERE employee_id NOT IN (SELECT id FROM employees);
DELETE FROM certificates WHERE employee_id NOT IN (SELECT id FROM employees);

-- Remove audit logs only from obvious demo operations
DELETE FROM audit_logs 
WHERE details ILIKE '%demo%' 
OR details ILIKE '%sample%'
OR details ILIKE '%test%';