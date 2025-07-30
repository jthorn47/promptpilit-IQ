-- Add client_type field to activities table for reporting segmentation
ALTER TABLE public.activities ADD COLUMN client_type text;

-- Add index for better performance on client_type filtering
CREATE INDEX idx_activities_client_type ON public.activities(client_type);

-- Add index for better performance on activity type filtering
CREATE INDEX idx_activities_type ON public.activities(type);

-- Add comment to document the client_type field purpose
COMMENT ON COLUMN public.activities.client_type IS 'Inherited from parent company for reporting segmentation (easeworks, easelearn, both)';