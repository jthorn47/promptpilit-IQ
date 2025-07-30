-- Add intro scroll timing configuration to client SBW9237 modules
ALTER TABLE public.client_sbw9237_modules 
ADD COLUMN intro_scroll_timing_config JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.client_sbw9237_modules.intro_scroll_timing_config 
IS 'Configuration for intro scene scroll timing synchronization with audio. Format: {segments: [{id, text, startTime, label}], audioDuration, lastUpdated}';