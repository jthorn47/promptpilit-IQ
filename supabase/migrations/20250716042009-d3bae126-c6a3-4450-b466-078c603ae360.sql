-- Ensure activities table has company_id column and proper indexes for company-centric CRM
DO $$ 
BEGIN
  -- Add company_id column to activities if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.activities ADD COLUMN company_id UUID REFERENCES public.company_settings(id);
  END IF;
END $$;

-- Create index on company_id for better performance
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);

-- Create index on company_id and created_at for timeline queries
CREATE INDEX IF NOT EXISTS idx_activities_company_timeline ON public.activities(company_id, created_at DESC);

-- Update existing activities to link to companies where possible
-- This links activities to companies based on matching company names
UPDATE public.activities 
SET company_id = (
  SELECT cs.id 
  FROM public.company_settings cs 
  WHERE cs.company_name = activities.company_id::text
  LIMIT 1
)
WHERE company_id IS NULL 
AND EXISTS (
  SELECT 1 
  FROM public.company_settings cs 
  WHERE cs.company_name = activities.company_id::text
);

-- Add comment for documentation
COMMENT ON COLUMN public.activities.company_id IS 'Links activity to a specific company for company-centric CRM workflow';

-- Ensure activities table has proper RLS policies for company-centric access
DROP POLICY IF EXISTS "Company users can view their activities" ON public.activities;
CREATE POLICY "Company users can view their activities" 
ON public.activities FOR SELECT 
USING (
  company_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.company_settings cs 
    WHERE cs.id = activities.company_id 
    AND (
      has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
      has_crm_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

DROP POLICY IF EXISTS "Company users can create activities" ON public.activities;
CREATE POLICY "Company users can create activities" 
ON public.activities FOR INSERT 
WITH CHECK (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
  has_crm_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Company users can update their activities" ON public.activities;
CREATE POLICY "Company users can update their activities" 
ON public.activities FOR UPDATE 
USING (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
  has_crm_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Company users can delete their activities" ON public.activities;
CREATE POLICY "Company users can delete their activities" 
ON public.activities FOR DELETE 
USING (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR 
  has_crm_role(auth.uid(), 'super_admin'::app_role)
);