-- Add completed_tours column to profiles table for tracking user tour progress
ALTER TABLE public.profiles 
ADD COLUMN completed_tours text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.completed_tours IS 'Array of tour names that the user has completed';