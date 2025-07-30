-- Add thumbnail to AML training module
UPDATE public.training_modules 
SET thumbnail_url = '/lovable-uploads/fa5a93fe-47c9-48a3-872b-6a6ba68891a3.png',
    updated_at = now()
WHERE id = 'ba06f21b-a9d2-4af8-a602-ed035cc9d42a';