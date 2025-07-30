-- Add Vimeo integration fields to training_modules
ALTER TABLE public.training_modules 
ADD COLUMN vimeo_video_id text,
ADD COLUMN vimeo_embed_url text,
ADD COLUMN video_duration_seconds integer,
ADD COLUMN completion_threshold_percentage integer DEFAULT 80;

-- Update training_completions to track video progress
ALTER TABLE public.training_completions
ADD COLUMN video_progress_data jsonb DEFAULT '{}',
ADD COLUMN last_video_position_seconds integer DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.training_modules.vimeo_video_id IS 'Vimeo video ID for the training content';
COMMENT ON COLUMN public.training_modules.vimeo_embed_url IS 'Full Vimeo embed URL with privacy settings';
COMMENT ON COLUMN public.training_modules.video_duration_seconds IS 'Total video duration in seconds';
COMMENT ON COLUMN public.training_modules.completion_threshold_percentage IS 'Percentage of video that must be watched to mark as complete';
COMMENT ON COLUMN public.training_completions.video_progress_data IS 'JSON object storing detailed video viewing progress';
COMMENT ON COLUMN public.training_completions.last_video_position_seconds IS 'Last known video playback position in seconds';