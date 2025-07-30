-- Enable Row Level Security on tables missing RLS
ALTER TABLE public.leads_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules_catalog ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads_archive table
-- Allow authenticated Easeworks sales reps to manage leads archive
CREATE POLICY "Easeworks sales reps can manage leads archive" 
ON public.leads_archive 
FOR ALL 
TO authenticated
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for training_modules_catalog table  
-- Allow super admins to manage training modules catalog
CREATE POLICY "Super admins can manage training modules catalog"
ON public.training_modules_catalog
FOR ALL
TO authenticated  
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow authenticated users to view published training modules from catalog
CREATE POLICY "Users can view published training modules"
ON public.training_modules_catalog
FOR SELECT
TO authenticated
USING (true);