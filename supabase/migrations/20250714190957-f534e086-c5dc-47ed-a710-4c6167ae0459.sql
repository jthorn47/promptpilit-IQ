-- Update the client_sbw9237_modules table to use the correct audio file names
UPDATE public.client_sbw9237_modules 
SET intro_audio_url = 'https://xfamotequcavggiqndfj.supabase.co/storage/v1/object/public/training-audio/96c1ca74-9a84-4040-880f-249a464dd18d/intro-audio-1752518022477.mp3',
    updated_at = now()
WHERE client_id = '96c1ca74-9a84-4040-880f-249a464dd18d';