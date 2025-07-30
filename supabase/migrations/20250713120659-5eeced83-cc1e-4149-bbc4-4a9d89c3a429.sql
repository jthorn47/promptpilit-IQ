-- Delete the specific company that's causing navigation issues
DELETE FROM public.company_settings 
WHERE id = '2f17048c-4f50-4a77-a551-2a5d5334ddd2';