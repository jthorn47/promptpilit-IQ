-- Create job titles and job descriptions tables for HaaLO IQ module

-- Create job_titles table
CREATE TABLE public.job_titles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title_name TEXT NOT NULL,
    wc_code_id UUID REFERENCES public.workers_comp_codes(id),
    client_id UUID REFERENCES public.company_settings(id),
    start_date DATE,
    end_date DATE,
    is_global BOOLEAN NOT NULL DEFAULT false,
    category TEXT, -- Admin, Construction, Healthcare, etc.
    is_available_for_clients BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_descriptions table
CREATE TABLE public.job_descriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_title_id UUID NOT NULL REFERENCES public.job_titles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_titles
CREATE POLICY "Super admins can manage global job titles"
ON public.job_titles
FOR ALL
USING (
    has_role(auth.uid(), 'super_admin'::app_role) AND 
    (is_global = true OR client_id IS NULL)
);

CREATE POLICY "Client admins can manage their job titles"
ON public.job_titles
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can view available global job titles"
ON public.job_titles
FOR SELECT
USING (
    is_global = true AND is_available_for_clients = true
);

CREATE POLICY "Users can view their company job titles"
ON public.job_titles
FOR SELECT
USING (
    client_id IN (
        SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    )
);

-- RLS Policies for job_descriptions
CREATE POLICY "Users can manage job descriptions for accessible job titles"
ON public.job_descriptions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.job_titles jt
        WHERE jt.id = job_descriptions.job_title_id
        AND (
            (jt.is_global = true AND has_role(auth.uid(), 'super_admin'::app_role)) OR
            (jt.client_id IS NOT NULL AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jt.client_id) OR
                has_role(auth.uid(), 'super_admin'::app_role)
            ))
        )
    )
);

CREATE POLICY "Users can view job descriptions for accessible job titles"
ON public.job_descriptions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.job_titles jt
        WHERE jt.id = job_descriptions.job_title_id
        AND (
            (jt.is_global = true AND jt.is_available_for_clients = true) OR
            jt.client_id IN (
                SELECT company_id FROM user_roles WHERE user_id = auth.uid()
            )
        )
    )
);

-- Create indexes for performance
CREATE INDEX idx_job_titles_client_id ON public.job_titles(client_id);
CREATE INDEX idx_job_titles_is_global ON public.job_titles(is_global);
CREATE INDEX idx_job_titles_category ON public.job_titles(category);
CREATE INDEX idx_job_descriptions_job_title_id ON public.job_descriptions(job_title_id);

-- Create trigger for updated_at
CREATE TRIGGER update_job_titles_updated_at
    BEFORE UPDATE ON public.job_titles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at
    BEFORE UPDATE ON public.job_descriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();