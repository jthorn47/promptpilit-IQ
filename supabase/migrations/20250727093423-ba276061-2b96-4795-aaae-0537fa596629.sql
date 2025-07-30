-- Add training_progress column to user_profiles for HaaLO IQ University
ALTER TABLE public.user_profiles 
ADD COLUMN training_progress JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.training_progress IS 'Stores completion status for HaaLO IQ University training sections';