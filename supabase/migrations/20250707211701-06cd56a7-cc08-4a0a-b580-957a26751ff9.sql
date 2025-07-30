-- Create training_scenes table
CREATE TABLE IF NOT EXISTS public.training_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scene_type TEXT NOT NULL CHECK (scene_type IN ('scorm', 'video', 'html', 'quiz', 'document')),
  content_url TEXT,
  scorm_package_url TEXT,
  html_content TEXT,
  scene_order INTEGER NOT NULL DEFAULT 1,
  estimated_duration INTEGER NOT NULL DEFAULT 5,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_completion_scene BOOLEAN NOT NULL DEFAULT false,
  auto_advance BOOLEAN NOT NULL DEFAULT false,
  completion_criteria JSONB DEFAULT '{"type": "time_based", "required_percentage": 100}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_scenes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_scenes
CREATE POLICY "Company admins can manage their training scenes" 
ON public.training_scenes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm 
    WHERE tm.id = training_scenes.training_module_id 
    AND (
      has_role(auth.uid(), 'company_admin'::app_role) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.training_modules tm 
    WHERE tm.id = training_scenes.training_module_id 
    AND (
      has_role(auth.uid(), 'company_admin'::app_role) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create policy for learners to view scenes
CREATE POLICY "Learners can view assigned training scenes" 
ON public.training_scenes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.training_assignments ta
    JOIN public.training_modules tm ON ta.training_module_id = tm.id
    WHERE tm.id = training_scenes.training_module_id
    AND ta.employee_id IN (
      SELECT e.id FROM public.employees e WHERE e.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
  OR has_role(auth.uid(), 'company_admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_training_scenes_updated_at
  BEFORE UPDATE ON public.training_scenes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_training_scenes_module_id ON public.training_scenes(training_module_id);
CREATE INDEX idx_training_scenes_order ON public.training_scenes(training_module_id, scene_order);