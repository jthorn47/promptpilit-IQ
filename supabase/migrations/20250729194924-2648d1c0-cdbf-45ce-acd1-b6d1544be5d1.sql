-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update Jeffrey's profile with his full name
UPDATE public.profiles 
SET first_name = 'Jeffrey', last_name = 'Thorn'
WHERE email = 'jeffrey@easeworks.com';

-- Update the StandardLayout to use the new name fields