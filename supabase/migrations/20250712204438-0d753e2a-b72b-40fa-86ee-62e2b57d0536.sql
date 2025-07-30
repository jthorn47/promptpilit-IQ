-- Add thumbnail_url column to training_scenes table
ALTER TABLE public.training_scenes 
ADD COLUMN thumbnail_url TEXT;