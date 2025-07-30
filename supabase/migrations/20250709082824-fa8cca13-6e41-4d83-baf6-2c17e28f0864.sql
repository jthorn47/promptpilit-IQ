
-- Add missing columns to training_modules table for enhanced training builder
ALTER TABLE public.training_modules 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS industry text DEFAULT '',
ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS estimated_completion_time integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scorm_compatible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scorm_version text,
ADD COLUMN IF NOT EXISTS accessibility_compliant boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{"learning_objectives": [], "prerequisites": [], "completion_criteria": {"min_score": 80, "required_scenes": []}}'::jsonb;

-- Add check constraints for valid values
ALTER TABLE public.training_modules 
ADD CONSTRAINT check_difficulty_level 
CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE public.training_modules 
ADD CONSTRAINT check_scorm_version 
CHECK (scorm_version IS NULL OR scorm_version IN ('1.2', '2004'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_modules_tags ON public.training_modules USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_training_modules_language ON public.training_modules(language);
CREATE INDEX IF NOT EXISTS idx_training_modules_industry ON public.training_modules(industry);
CREATE INDEX IF NOT EXISTS idx_training_modules_difficulty ON public.training_modules(difficulty_level);
