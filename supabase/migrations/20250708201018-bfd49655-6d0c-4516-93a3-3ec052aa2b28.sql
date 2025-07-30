-- Update Core WPV Training module to published status so it's visible to all users
UPDATE public.training_modules 
SET 
  status = 'published',
  updated_at = now()
WHERE id = 'fb33e984-b169-4b56-a442-09b4ac021f94';