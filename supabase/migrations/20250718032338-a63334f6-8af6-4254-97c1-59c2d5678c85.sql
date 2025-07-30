-- Remove all legacy module references from the system
-- These are old platform modules that should be replaced with HaaLO Core Modules

-- Delete all legacy platform module entries
DELETE FROM client_module_access WHERE module_type = 'platform';

-- Delete any legacy training modules that aren't part of HaaLO Core
DELETE FROM client_module_access WHERE module_type = 'training';

-- Drop the client_module_access table entirely as it's legacy
DROP TABLE IF EXISTS client_module_access CASCADE;

-- Create new HaaLO Core Modules table for the 18 core modules
CREATE TABLE public.haalo_core_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL UNIQUE,
    module_key TEXT NOT NULL UNIQUE, -- e.g., "HaaLO.CoreAdmin"
    description TEXT,
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the 18 HaaLO Core Modules
INSERT INTO public.haalo_core_modules (module_name, module_key, description) VALUES
('Core Admin', 'HaaLO.CoreAdmin', 'Core administration functionality'),
('Companies', 'HaaLO.Companies', 'Company management'),
('Users', 'HaaLO.Users', 'User management'),
('Roles', 'HaaLO.Roles', 'Role and permissions management'),
('Registry', 'HaaLO.Registry', 'System registry'),
('Auth', 'HaaLO.Auth', 'Authentication system'),
('Org Settings', 'HaaLO.OrgSettings', 'Organization settings'),
('Directory', 'HaaLO.Directory', 'Directory services'),
('Documents', 'HaaLO.Documents', 'Document management'),
('Compliance', 'HaaLO.Compliance', 'Compliance management'),
('Training', 'HaaLO.Training', 'Training administration'),
('Tasks', 'HaaLO.Tasks', 'Task management'),
('Time', 'HaaLO.Time', 'Time tracking'),
('Leave', 'HaaLO.Leave', 'Leave management'),
('Knowledge', 'HaaLO.Knowledge', 'Knowledge base'),
('Announcements', 'HaaLO.Announcements', 'Announcement system'),
('Notifications', 'HaaLO.Notifications', 'Notification system'),
('Audit Trail', 'HaaLO.AuditTrail', 'Audit trail logging');

-- Enable RLS on the new table
ALTER TABLE public.haalo_core_modules ENABLE ROW LEVEL SECURITY;

-- Create policies for HaaLO core modules
CREATE POLICY "Super admins can manage HaaLO core modules"
ON public.haalo_core_modules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view active HaaLO core modules"
ON public.haalo_core_modules
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_haalo_core_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_haalo_core_modules_updated_at
  BEFORE UPDATE ON public.haalo_core_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_haalo_core_modules_updated_at();