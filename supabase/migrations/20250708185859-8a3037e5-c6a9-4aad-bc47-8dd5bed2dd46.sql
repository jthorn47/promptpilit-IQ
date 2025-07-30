-- Add public_title field to training_modules table
ALTER TABLE public.training_modules 
ADD COLUMN public_title TEXT;

-- Update the existing Workplace Violence Training module
UPDATE public.training_modules 
SET 
  title = 'Core WPV Training',
  public_title = 'SB 553 Workplace Violence Training',
  description = 'Core workplace violence prevention training module. This training covers California SB 553 requirements for workplace violence prevention.',
  updated_at = now()
WHERE id = 'fb33e984-b169-4b56-a442-09b4ac021f94';