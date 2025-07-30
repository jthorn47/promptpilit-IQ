-- Add learner progress tracking tables
CREATE TABLE public.learner_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.training_assignments(id) ON DELETE CASCADE NOT NULL,
    current_time_seconds NUMERIC DEFAULT 0,
    duration_seconds NUMERIC DEFAULT 0,
    completion_percentage NUMERIC DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employee_id, scene_id, assignment_id)
);

-- Table for quiz session tracking
CREATE TABLE public.learner_quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.training_assignments(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score_percentage NUMERIC DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learner_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for learner_video_progress
CREATE POLICY "System can manage video progress"
ON public.learner_video_progress
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for learner_quiz_sessions  
CREATE POLICY "System can manage quiz sessions"
ON public.learner_quiz_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_learner_video_progress_updated_at
    BEFORE UPDATE ON public.learner_video_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learner_quiz_sessions_updated_at
    BEFORE UPDATE ON public.learner_quiz_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_learner_video_progress_employee ON public.learner_video_progress(employee_id);
CREATE INDEX idx_learner_video_progress_scene ON public.learner_video_progress(scene_id);
CREATE INDEX idx_learner_quiz_sessions_employee ON public.learner_quiz_sessions(employee_id);
CREATE INDEX idx_learner_quiz_sessions_scene ON public.learner_quiz_sessions(scene_id);