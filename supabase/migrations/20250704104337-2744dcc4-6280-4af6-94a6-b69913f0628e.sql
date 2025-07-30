-- Add completion tracking fields to training_scenes
ALTER TABLE public.training_scenes 
ADD COLUMN is_completion_scene BOOLEAN DEFAULT false,
ADD COLUMN auto_advance BOOLEAN DEFAULT true;

-- Add index for completion scenes
CREATE INDEX idx_training_scenes_completion ON public.training_scenes(training_module_id, is_completion_scene);

-- Update training_modules to track scene-based completion
ALTER TABLE public.training_modules 
ADD COLUMN completion_method TEXT DEFAULT 'scene_based' CHECK (completion_method IN ('scene_based', 'quiz_based', 'time_based'));

-- Create function to mark training as complete when final scene is completed
CREATE OR REPLACE FUNCTION public.check_training_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    completion_scene_id UUID;
    module_id UUID;
    assignment_id UUID;
BEGIN
    -- Get the scene's module and check if it's a completion scene
    SELECT ts.training_module_id, ts.is_completion_scene
    INTO module_id, completion_scene_id
    FROM public.training_scenes ts
    WHERE ts.id = NEW.scene_id;
    
    -- If this is a completion scene and the learner completed it
    IF completion_scene_id = true AND NEW.status = 'completed' THEN
        -- Find the training assignment for this employee and module
        SELECT ta.id INTO assignment_id
        FROM public.training_assignments ta
        JOIN public.training_modules tm ON ta.training_module_id = tm.id
        WHERE tm.id = module_id AND ta.employee_id = NEW.employee_id;
        
        -- Update or insert training completion
        INSERT INTO public.training_completions (
            assignment_id,
            training_module_id,
            employee_id,
            completed_at,
            status,
            progress_percentage
        )
        VALUES (
            assignment_id,
            module_id,
            NEW.employee_id,
            NEW.completed_at,
            'completed',
            100
        )
        ON CONFLICT (assignment_id)
        DO UPDATE SET
            completed_at = NEW.completed_at,
            status = 'completed',
            progress_percentage = 100,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic training completion
CREATE TRIGGER trigger_check_training_completion
    AFTER INSERT OR UPDATE ON public.scene_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_training_completion();