-- Make training-files bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'training-files';