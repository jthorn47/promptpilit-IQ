-- Create training scene questions table
CREATE TABLE public.training_scene_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'scenario')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  time_limit INTEGER,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question bank table for reusable questions
CREATE TABLE public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'scenario')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  time_limit INTEGER,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training scene settings table
CREATE TABLE public.training_scene_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL,
  setting_type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scene_id, setting_type)
);

-- Enable RLS
ALTER TABLE public.training_scene_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_scene_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_scene_questions
CREATE POLICY "Company admins can manage scene questions" 
ON public.training_scene_questions 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for question_bank
CREATE POLICY "Company users can view their question bank" 
ON public.question_bank 
FOR SELECT 
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role) OR is_public = true);

CREATE POLICY "Company admins can manage their question bank" 
ON public.question_bank 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for training_scene_settings
CREATE POLICY "Company admins can manage scene settings" 
ON public.training_scene_settings 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update triggers for timestamps
CREATE TRIGGER update_training_scene_questions_updated_at
  BEFORE UPDATE ON public.training_scene_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_bank_updated_at
  BEFORE UPDATE ON public.question_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_scene_settings_updated_at
  BEFORE UPDATE ON public.training_scene_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();