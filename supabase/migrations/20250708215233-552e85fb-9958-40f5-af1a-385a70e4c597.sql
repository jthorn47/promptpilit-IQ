-- Update the Core WPV Training module with the Scrum video
UPDATE training_modules 
SET 
  vimeo_video_id = '1021394426',
  vimeo_embed_url = 'https://player.vimeo.com/video/1021394426',
  updated_at = now()
WHERE title = 'Core WPV Training';

-- Verify the update
SELECT id, title, vimeo_video_id, vimeo_embed_url FROM training_modules WHERE title = 'Core WPV Training';