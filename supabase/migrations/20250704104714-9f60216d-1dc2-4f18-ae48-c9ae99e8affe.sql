-- Create scene_questions table for scene-specific assessments
CREATE TABLE public.scene_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.training_scenes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('true_false', 'multiple_choice')),
    question_order INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create scene_question_options table for multiple choice answers
CREATE TABLE public.scene_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.scene_questions(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_order INTEGER NOT NULL DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scene_question_responses table for tracking learner answers
CREATE TABLE public.scene_question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.scene_questions(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    selected_option_id UUID REFERENCES public.scene_question_options(id) ON DELETE SET NULL,
    true_false_answer BOOLEAN,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (question_id, employee_id)
);

-- Create indexes for better performance
CREATE INDEX idx_scene_questions_scene_id ON public.scene_questions(scene_id);
CREATE INDEX idx_scene_questions_order ON public.scene_questions(scene_id, question_order);
CREATE INDEX idx_question_options_question_id ON public.scene_question_options(question_id);
CREATE INDEX idx_question_responses_employee ON public.scene_question_responses(employee_id);

-- Enable RLS on all tables
ALTER TABLE public.scene_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_question_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for scene_questions
CREATE POLICY "Super admins can manage all scene questions"
ON public.scene_questions
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their scene questions"
ON public.scene_questions
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    created_by = auth.uid()
);

CREATE POLICY "Learners can view published scene questions"
ON public.scene_questions
FOR SELECT
USING (
    public.has_role(auth.uid(), 'learner') OR 
    public.has_role(auth.uid(), 'company_admin') OR 
    public.has_role(auth.uid(), 'super_admin')
);

-- RLS policies for scene_question_options
CREATE POLICY "Super admins can manage all question options"
ON public.scene_question_options
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their question options"
ON public.scene_question_options
FOR ALL
USING (
    public.has_role(auth.uid(), 'company_admin') AND
    EXISTS (
        SELECT 1 FROM public.scene_questions sq 
        WHERE sq.id = scene_question_options.question_id 
        AND sq.created_by = auth.uid()
    )
);

CREATE POLICY "Learners can view question options"
ON public.scene_question_options
FOR SELECT
USING (
    public.has_role(auth.uid(), 'learner') OR 
    public.has_role(auth.uid(), 'company_admin') OR 
    public.has_role(auth.uid(), 'super_admin')
);

-- RLS policies for scene_question_responses
CREATE POLICY "Super admins can view all question responses"
ON public.scene_question_responses
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their question responses"
ON public.scene_question_responses
FOR SELECT
USING (public.has_role(auth.uid(), 'company_admin'));

CREATE POLICY "Learners can manage their own responses"
ON public.scene_question_responses
FOR ALL
USING (public.has_role(auth.uid(), 'learner'));

-- Add triggers for updated_at
CREATE TRIGGER update_scene_questions_updated_at
    BEFORE UPDATE ON public.scene_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();