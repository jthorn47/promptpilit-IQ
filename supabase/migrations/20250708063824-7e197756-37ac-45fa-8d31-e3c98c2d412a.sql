-- Add assessment reminders and notifications support

-- Extend assessments table with assignment tracking
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS completion_metadata JSONB DEFAULT '{}';

-- Add constraint for status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessments_status_check') THEN
        ALTER TABLE public.assessments ADD CONSTRAINT assessments_status_check 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue'));
    END IF;
END $$;

-- Create assessment notifications table
CREATE TABLE IF NOT EXISTS public.assessment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('assignment', 'reminder', 'completion', 'overdue')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment notifications
CREATE POLICY "Users can view their assessment notifications" 
ON public.assessment_notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert assessment notifications" 
ON public.assessment_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their assessment notifications" 
ON public.assessment_notifications FOR UPDATE 
USING (user_id = auth.uid());

-- Add assessment-specific achievements (with proper conflict handling)
DO $$
BEGIN
  -- Check if the achievements don't already exist before inserting
  IF NOT EXISTS (SELECT 1 FROM public.achievement_definitions WHERE name = 'Risk Assessment Pro') THEN
    INSERT INTO public.achievement_definitions (name, description, icon, points, achievement_type, criteria) 
    VALUES ('Risk Assessment Pro', 'Complete your first risk assessment', 'shield-check', 50, 'milestone', '{"assessments_required": 1}');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievement_definitions WHERE name = 'Safety Expert') THEN
    INSERT INTO public.achievement_definitions (name, description, icon, points, achievement_type, criteria) 
    VALUES ('Safety Expert', 'Complete 5 risk assessments', 'award', 100, 'milestone', '{"assessments_required": 5}');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievement_definitions WHERE name = 'Quick Assessor') THEN
    INSERT INTO public.achievement_definitions (name, description, icon, points, achievement_type, criteria) 
    VALUES ('Quick Assessor', 'Complete an assessment within 15 minutes', 'clock', 30, 'speed', '{"max_minutes": 15}');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.achievement_definitions WHERE name = 'Perfect Scorer') THEN
    INSERT INTO public.achievement_definitions (name, description, icon, points, achievement_type, criteria) 
    VALUES ('Perfect Scorer', 'Complete an assessment with maximum attention to detail', 'star', 40, 'perfect_score', '{"completion_percentage": 100}');
  END IF;
END $$;