
-- Create client job titles table
CREATE TABLE public.client_job_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  effective_date DATE NOT NULL,
  wc_code_id UUID NOT NULL REFERENCES public.workers_comp_codes(id),
  job_description_id UUID REFERENCES public.global_job_descriptions(id),
  custom_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_client_job_titles_client_id ON public.client_job_titles(client_id);
CREATE INDEX idx_client_job_titles_wc_code_id ON public.client_job_titles(wc_code_id);
CREATE INDEX idx_client_job_titles_active ON public.client_job_titles(is_active);

-- Enable RLS
ALTER TABLE public.client_job_titles ENABLE ROW LEVEL SECURITY;

-- RLS policies for client job titles
CREATE POLICY "Client admins can manage their job titles"
ON public.client_job_titles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = client_job_titles.client_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id)
    )
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_client_job_titles_updated_at
  BEFORE UPDATE ON public.client_job_titles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log for WC code changes
CREATE TABLE public.client_job_title_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_title_id UUID NOT NULL REFERENCES public.client_job_titles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'wc_code_changed', 'title_updated', etc.
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audit log
ALTER TABLE public.client_job_title_audit ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit log
CREATE POLICY "Client admins can view their job title audit logs"
ON public.client_job_title_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_job_titles cjt
    JOIN public.clients c ON c.id = cjt.client_id
    WHERE cjt.id = client_job_title_audit.job_title_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id)
    )
  )
);

-- Function to log job title changes
CREATE OR REPLACE FUNCTION public.log_client_job_title_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log WC code changes (requires super admin)
  IF OLD.wc_code_id IS DISTINCT FROM NEW.wc_code_id THEN
    INSERT INTO public.client_job_title_audit (
      job_title_id, action_type, old_values, new_values, changed_by
    ) VALUES (
      NEW.id,
      'wc_code_changed',
      jsonb_build_object('wc_code_id', OLD.wc_code_id),
      jsonb_build_object('wc_code_id', NEW.wc_code_id),
      auth.uid()
    );
  END IF;
  
  -- Log other significant changes
  IF OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO public.client_job_title_audit (
      job_title_id, action_type, old_values, new_values, changed_by
    ) VALUES (
      NEW.id,
      'title_updated',
      jsonb_build_object('title', OLD.title),
      jsonb_build_object('title', NEW.title),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
CREATE TRIGGER client_job_title_audit_trigger
  AFTER UPDATE ON public.client_job_titles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_client_job_title_changes();
