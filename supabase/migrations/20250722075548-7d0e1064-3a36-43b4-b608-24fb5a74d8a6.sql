-- Create missing permissions for learner role
INSERT INTO public.permissions (name, description, resource, action) VALUES
('view_training_dashboard', 'View training dashboard with assigned training', 'training', 'read'),
('complete_training', 'Complete assigned training modules', 'training', 'complete'),
('view_own_certificates', 'View own training certificates', 'certificates', 'read_own'),
('view_help', 'Access help and support resources', 'help', 'read')
ON CONFLICT (name) DO NOTHING;

-- Clear existing learner permissions and assign only the restricted ones
DELETE FROM public.role_permissions WHERE role = 'learner';

-- Insert the specific learner permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'learner'::app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_training_dashboard',
  'complete_training', 
  'view_own_certificates',
  'view_help'
);