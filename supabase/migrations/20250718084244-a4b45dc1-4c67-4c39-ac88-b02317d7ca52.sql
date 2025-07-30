-- Create enhanced analytics tables for training module engagement
CREATE TABLE IF NOT EXISTS public.training_module_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL,
    company_id UUID,
    engagement_heatmap JSONB DEFAULT '{}',
    dropout_rate NUMERIC DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0,
    struggle_indicators JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Create module engagement heatmaps table
CREATE TABLE IF NOT EXISTS public.module_engagement_heatmaps (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL,
    scene_id UUID,
    time_position INTEGER NOT NULL,
    engagement_score NUMERIC DEFAULT 0,
    dropout_count INTEGER DEFAULT 0,
    rewatch_count INTEGER DEFAULT 0,
    pause_count INTEGER DEFAULT 0,
    seek_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Create FAQ knowledge base table for CoachGPT
CREATE TABLE IF NOT EXISTS public.module_faq_knowledge (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Create quiz struggle analytics table
CREATE TABLE IF NOT EXISTS public.quiz_struggle_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    assignment_id UUID NOT NULL,
    struggle_type TEXT NOT NULL, -- 'time_exceeded', 'multiple_attempts', 'incorrect_answer'
    struggle_data JSONB DEFAULT '{}',
    hint_shown BOOLEAN DEFAULT false,
    hint_content TEXT,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create dynamic hint system table
CREATE TABLE IF NOT EXISTS public.dynamic_hints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL,
    question_id UUID,
    topic TEXT NOT NULL,
    trigger_condition JSONB NOT NULL, -- conditions that trigger this hint
    hint_content TEXT NOT NULL,
    hint_type TEXT DEFAULT 'explanation', -- 'explanation', 'example', 'tip'
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Enable RLS on new tables
ALTER TABLE public.training_module_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_engagement_heatmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_faq_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_struggle_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_hints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_module_analytics
CREATE POLICY "Company users can view their analytics" ON public.training_module_analytics
FOR SELECT USING (
    company_id = get_user_company_id(auth.uid()) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage analytics" ON public.training_module_analytics
FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for module_engagement_heatmaps
CREATE POLICY "Users can view engagement heatmaps" ON public.module_engagement_heatmaps
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = module_engagement_heatmaps.module_id 
        AND (tm.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

CREATE POLICY "System can manage engagement heatmaps" ON public.module_engagement_heatmaps
FOR ALL USING (true);

-- RLS Policies for module_faq_knowledge
CREATE POLICY "Users can view module FAQ knowledge" ON public.module_faq_knowledge
FOR SELECT USING (is_active = true);

CREATE POLICY "Company admins can manage FAQ knowledge" ON public.module_faq_knowledge
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = module_faq_knowledge.module_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, tm.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- RLS Policies for quiz_struggle_analytics
CREATE POLICY "Users can view their own struggle analytics" ON public.quiz_struggle_analytics
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = quiz_struggle_analytics.employee_id 
        AND (e.user_id = auth.uid() OR has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id))
    ) OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert struggle analytics" ON public.quiz_struggle_analytics
FOR INSERT WITH CHECK (true);

-- RLS Policies for dynamic_hints
CREATE POLICY "Users can view active hints" ON public.dynamic_hints
FOR SELECT USING (is_active = true);

CREATE POLICY "Company admins can manage hints" ON public.dynamic_hints
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = dynamic_hints.module_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, tm.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create indexes for performance
CREATE INDEX idx_training_module_analytics_module_id ON public.training_module_analytics(module_id);
CREATE INDEX idx_module_engagement_heatmaps_module_scene ON public.module_engagement_heatmaps(module_id, scene_id);
CREATE INDEX idx_module_faq_knowledge_module_topic ON public.module_faq_knowledge(module_id, topic);
CREATE INDEX idx_quiz_struggle_analytics_question_employee ON public.quiz_struggle_analytics(question_id, employee_id);
CREATE INDEX idx_dynamic_hints_module_topic ON public.dynamic_hints(module_id, topic);

-- Create function to update analytics
CREATE OR REPLACE FUNCTION public.update_training_analytics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_training_module_analytics_updated_at
    BEFORE UPDATE ON public.training_module_analytics
    FOR EACH ROW EXECUTE FUNCTION public.update_training_analytics();

CREATE TRIGGER update_module_faq_knowledge_updated_at
    BEFORE UPDATE ON public.module_faq_knowledge
    FOR EACH ROW EXECUTE FUNCTION public.update_training_analytics();

CREATE TRIGGER update_dynamic_hints_updated_at
    BEFORE UPDATE ON public.dynamic_hints
    FOR EACH ROW EXECUTE FUNCTION public.update_training_analytics();