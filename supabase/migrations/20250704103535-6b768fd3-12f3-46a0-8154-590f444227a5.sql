-- Create training_scenes table for SCORM and non-SCORM content
CREATE TABLE public.training_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scene_type TEXT NOT NULL CHECK (scene_type IN ('scorm', 'video', 'html', 'quiz', 'document')),
    content_url TEXT,
    scorm_package_url TEXT,
    html_content TEXT,
    scene_order INTEGER NOT NULL DEFAULT 1,
    estimated_duration INTEGER DEFAULT 5, -- in minutes
    is_required BOOLEAN DEFAULT true,
    completion_criteria JSONB DEFAULT '{"type": "time_based", "required_percentage": 100}',
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_training_scenes_module_id ON public.training_scenes(training_module_id);
CREATE INDEX idx_training_scenes_order ON public.training_scenes(training_module_id, scene_order);

-- Enable RLS
ALTER TABLE public.training_scenes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage all training scenes"
ON public.training_scenes
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their training scenes"
ON public.training_scenes
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    created_by = auth.uid()
);

CREATE POLICY "Learners can view published scenes"
ON public.training_scenes
FOR SELECT
USING (
    status = 'active' AND
    (public.has_role(auth.uid(), 'learner') OR public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'super_admin'))
);

-- Add trigger for updated_at
CREATE TRIGGER update_training_scenes_updated_at
    BEFORE UPDATE ON public.training_scenes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create scene completions table
CREATE TABLE public.scene_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    scorm_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (scene_id, employee_id)
);

-- Enable RLS for scene completions
ALTER TABLE public.scene_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scene completions
CREATE POLICY "Super admins can view all scene completions"
ON public.scene_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their scene completions"
ON public.scene_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'company_admin'));

CREATE POLICY "Learners can view their own scene completions"
ON public.scene_completions
FOR SELECT
USING (public.has_role(auth.uid(), 'learner'));

-- Add trigger for scene completions updated_at
CREATE TRIGGER update_scene_completions_updated_at
    BEFORE UPDATE ON public.scene_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();