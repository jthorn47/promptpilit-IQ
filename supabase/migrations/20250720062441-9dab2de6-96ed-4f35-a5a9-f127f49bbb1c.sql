
-- Create enum for FLSA classification
CREATE TYPE public.flsa_classification AS ENUM ('exempt', 'non_exempt');

-- Create global_job_titles table
CREATE TABLE public.global_job_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_name TEXT NOT NULL,
  description TEXT,
  wc_code_id UUID REFERENCES public.workers_comp_codes(id),
  category_tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_job_descriptions table
CREATE TABLE public.global_job_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_title_id UUID NOT NULL REFERENCES public.global_job_titles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  duties JSONB NOT NULL DEFAULT '[]',
  supervisory BOOLEAN NOT NULL DEFAULT false,
  supervisory_details TEXT,
  skills_qualifications TEXT NOT NULL,
  flsa_classification flsa_classification NOT NULL,
  physical_requirements TEXT,
  work_environment TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_job_descriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for global_job_titles (super_admin only)
CREATE POLICY "Super admins can manage global job titles"
ON public.global_job_titles
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for global_job_descriptions (super_admin only)
CREATE POLICY "Super admins can manage global job descriptions"
ON public.global_job_descriptions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_global_job_titles_updated_at
  BEFORE UPDATE ON public.global_job_titles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_job_descriptions_updated_at
  BEFORE UPDATE ON public.global_job_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_global_job_titles_title_name ON public.global_job_titles(title_name);
CREATE INDEX idx_global_job_titles_category_tags ON public.global_job_titles USING GIN(category_tags);
CREATE INDEX idx_global_job_descriptions_job_title_id ON public.global_job_descriptions(job_title_id);
