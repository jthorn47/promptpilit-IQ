-- Add WPV plan audio support to client_sbw9237_modules table
ALTER TABLE client_sbw9237_modules 
ADD COLUMN wpv_plan_audio_url TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN client_sbw9237_modules.wpv_plan_audio_url IS 'URL to audio file that explains the company WPV plan';