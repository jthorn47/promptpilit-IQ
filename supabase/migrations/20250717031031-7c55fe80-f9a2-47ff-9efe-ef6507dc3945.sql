-- Create billable rates for user roles
INSERT INTO public.user_billable_rates (user_id, hourly_rate, role_type, created_at)
SELECT 
  ur.user_id,
  CASE 
    WHEN ur.role = 'super_admin' THEN 150.00
    WHEN ur.role = 'company_admin' THEN 125.00
    WHEN ur.role = 'admin' THEN 95.00
    WHEN ur.role = 'learner' THEN 75.00
    ELSE 85.00
  END as hourly_rate,
  ur.role as role_type,
  now() as created_at
FROM public.user_roles ur
LEFT JOIN public.user_billable_rates ubr ON ur.user_id = ubr.user_id
WHERE ubr.user_id IS NULL; -- Only insert if no rate exists

-- Update case assignment to use proper user context
UPDATE public.cases 
SET assigned_to = created_by 
WHERE assigned_to IS NULL AND created_by IS NOT NULL;