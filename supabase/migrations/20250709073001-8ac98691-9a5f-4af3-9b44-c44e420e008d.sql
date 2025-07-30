-- Add category field to training_modules table
ALTER TABLE public.training_modules 
ADD COLUMN category TEXT DEFAULT 'General';

-- Add a check constraint for valid categories
ALTER TABLE public.training_modules 
ADD CONSTRAINT training_modules_category_check 
CHECK (category IN ('HR', 'Safety', 'Compliance', 'Security', 'General', 'Leadership', 'Technical', 'Customer Service', 'Diversity & Inclusion', 'Environmental'));

-- Update existing modules with sample categories based on their titles
UPDATE public.training_modules 
SET category = CASE 
  WHEN title ILIKE '%harassment%' OR title ILIKE '%discrimination%' OR title ILIKE '%diversity%' OR title ILIKE '%inclusion%' THEN 'Diversity & Inclusion'
  WHEN title ILIKE '%safety%' OR title ILIKE '%osha%' OR title ILIKE '%fire%' OR title ILIKE '%emergency%' OR title ILIKE '%first aid%' THEN 'Safety'
  WHEN title ILIKE '%security%' OR title ILIKE '%cyber%' OR title ILIKE '%privacy%' OR title ILIKE '%gdpr%' THEN 'Security'
  WHEN title ILIKE '%leadership%' OR title ILIKE '%management%' OR title ILIKE '%performance%' THEN 'Leadership'
  WHEN title ILIKE '%customer%' OR title ILIKE '%service%' OR title ILIKE '%communication%' THEN 'Customer Service'
  WHEN title ILIKE '%environmental%' OR title ILIKE '%compliance%' THEN 'Environmental'
  WHEN title ILIKE '%hiring%' OR title ILIKE '%conduct%' OR title ILIKE '%wpv%' OR title ILIKE '%violence%' THEN 'HR'
  ELSE 'General'
END;