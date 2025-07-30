
-- Create table for training module disclaimers
CREATE TABLE public.training_disclaimers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  legal_disclaimer_text TEXT,
  legal_disclaimer_enabled BOOLEAN NOT NULL DEFAULT false,
  legal_disclaimer_position TEXT NOT NULL DEFAULT 'start', -- 'start', 'end', 'both'
  acknowledgment_disclaimer_text TEXT,
  acknowledgment_disclaimer_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(training_module_id)
);

-- Create table for storing learner acknowledgments
CREATE TABLE public.training_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT false,
  legal_disclaimer_acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledgment_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledgment_disclaimer_acknowledged_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(training_module_id, learner_id)
);

-- Enable RLS on both tables
ALTER TABLE public.training_disclaimers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_disclaimers
CREATE POLICY "Company admins can manage their training disclaimers" 
ON public.training_disclaimers 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    WHERE tm.id = training_disclaimers.training_module_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    WHERE tm.id = training_disclaimers.training_module_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

CREATE POLICY "Learners can view disclaimers for accessible modules" 
ON public.training_disclaimers 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    WHERE tm.id = training_disclaimers.training_module_id
    AND tm.status = 'published'
  )
);

-- RLS policies for training_acknowledgments
CREATE POLICY "Learners can manage their own acknowledgments" 
ON public.training_acknowledgments 
FOR ALL 
TO authenticated 
USING (learner_id = auth.uid())
WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Company admins can view acknowledgments for their modules" 
ON public.training_acknowledgments 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.training_modules tm
    WHERE tm.id = training_acknowledgments.training_module_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'company_admin'::app_role)
    )
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_training_disclaimers_updated_at
  BEFORE UPDATE ON public.training_disclaimers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_acknowledgments_updated_at
  BEFORE UPDATE ON public.training_acknowledgments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default disclaimer templates
INSERT INTO public.training_disclaimers (
  training_module_id,
  legal_disclaimer_text,
  legal_disclaimer_enabled,
  acknowledgment_disclaimer_text,
  acknowledgment_disclaimer_enabled
)
SELECT 
  tm.id,
  'This training is intended for informational purposes only and should not be construed as legal advice. Please consult your attorney or HR advisor for specific legal guidance. Employers are responsible for compliance with applicable laws and regulations.',
  false,
  'By continuing, I acknowledge that I am completing this training truthfully and understand that this material is for training purposes only and does not replace professional legal counsel.',
  false
FROM public.training_modules tm
WHERE NOT EXISTS (
  SELECT 1 FROM public.training_disclaimers td 
  WHERE td.training_module_id = tm.id
);
