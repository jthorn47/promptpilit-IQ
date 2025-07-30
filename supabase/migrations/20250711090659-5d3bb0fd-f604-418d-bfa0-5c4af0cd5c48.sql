-- Create ATS-specific tables that extend the staffing infrastructure

-- ATS Job Posting Types
CREATE TYPE public.job_visibility_type AS ENUM ('public', 'internal', 'invite_only');
CREATE TYPE public.job_board_type AS ENUM ('staffing', 'internal_hr', 'both');
CREATE TYPE public.application_stage AS ENUM ('applied', 'screening', 'phone_screen', 'interview', 'reference_check', 'background_check', 'offer', 'hired', 'rejected');

-- Job Postings (extends staffing positions for ATS use)
CREATE TABLE public.ats_job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    staffing_position_id UUID REFERENCES public.staffing_positions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    location TEXT,
    department TEXT,
    employment_type TEXT DEFAULT 'full-time',
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency TEXT DEFAULT 'USD',
    visibility job_visibility_type DEFAULT 'public',
    board_type job_board_type DEFAULT 'internal_hr',
    post_to_internal BOOLEAN DEFAULT true,
    post_to_career_page BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    hiring_manager_id UUID,
    status TEXT DEFAULT 'open',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Applications (candidate applications to job postings)
CREATE TABLE public.ats_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID REFERENCES public.ats_job_postings(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.staffing_candidates(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    application_source TEXT DEFAULT 'website',
    current_stage application_stage DEFAULT 'applied',
    score INTEGER DEFAULT 0,
    notes TEXT,
    application_data JSONB DEFAULT '{}', -- Custom form fields
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Application Activities (tracking all interactions)
CREATE TABLE public.ats_application_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.ats_applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    activity_type TEXT NOT NULL, -- 'stage_change', 'note_added', 'interview_scheduled', etc.
    description TEXT NOT NULL,
    old_stage application_stage,
    new_stage application_stage,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Interview Schedules
CREATE TABLE public.ats_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.ats_applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES auth.users(id),
    interview_type TEXT DEFAULT 'phone', -- phone, video, in_person, panel
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT, -- physical location or video link
    notes TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
    feedback JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hiring Scorecards/Evaluations
CREATE TABLE public.ats_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.ats_applications(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES auth.users(id),
    interview_id UUID REFERENCES public.ats_interviews(id) ON DELETE SET NULL,
    scores JSONB NOT NULL, -- structured scoring data
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    recommendation TEXT, -- hire, no_hire, maybe
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Career Page Settings (for embedded iframe)
CREATE TABLE public.ats_career_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE UNIQUE,
    page_title TEXT DEFAULT 'Careers',
    page_description TEXT,
    header_image_url TEXT,
    theme_config JSONB DEFAULT '{}', -- colors, fonts, etc.
    custom_css TEXT,
    contact_email TEXT,
    application_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    embed_code TEXT, -- generated iframe embed code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Application Form Templates (customizable per company)
CREATE TABLE public.ats_application_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    form_fields JSONB NOT NULL, -- field definitions
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ats_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_application_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_career_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_application_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Job Postings
CREATE POLICY "Companies can manage their job postings" ON public.ats_job_postings
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role) OR
        hiring_manager_id = auth.uid()
    );

CREATE POLICY "Public job postings are viewable by all" ON public.ats_job_postings
    FOR SELECT USING (visibility = 'public' AND status = 'open');

CREATE POLICY "Internal job postings viewable by company employees" ON public.ats_job_postings
    FOR SELECT USING (
        visibility = 'internal' AND status = 'open' AND
        company_id = get_user_company_id(auth.uid())
    );

-- RLS Policies for Applications
CREATE POLICY "Company admins can view applications" ON public.ats_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_job_postings jp 
            WHERE jp.id = ats_applications.job_posting_id 
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid()
            )
        )
    );

CREATE POLICY "Anyone can create applications" ON public.ats_applications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Activities
CREATE POLICY "Company users can view application activities" ON public.ats_application_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_application_activities.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid()
            )
        )
    );

-- RLS Policies for Interviews
CREATE POLICY "Company users can manage interviews" ON public.ats_interviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_interviews.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid() OR
                interviewer_id = auth.uid()
            )
        )
    );

-- RLS Policies for Evaluations
CREATE POLICY "Company users can manage evaluations" ON public.ats_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ats_applications a
            JOIN public.ats_job_postings jp ON a.job_posting_id = jp.id
            WHERE a.id = ats_evaluations.application_id
            AND (
                has_company_role(auth.uid(), 'company_admin'::app_role, jp.company_id) OR 
                has_role(auth.uid(), 'super_admin'::app_role) OR
                jp.hiring_manager_id = auth.uid() OR
                evaluator_id = auth.uid()
            )
        )
    );

-- RLS Policies for Career Page Settings
CREATE POLICY "Companies can manage their career page" ON public.ats_career_page_settings
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for Application Forms
CREATE POLICY "Companies can manage their application forms" ON public.ats_application_forms
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- Triggers for updated_at timestamps
CREATE TRIGGER update_ats_job_postings_updated_at
    BEFORE UPDATE ON public.ats_job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_applications_updated_at
    BEFORE UPDATE ON public.ats_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_interviews_updated_at
    BEFORE UPDATE ON public.ats_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_evaluations_updated_at
    BEFORE UPDATE ON public.ats_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_career_page_settings_updated_at
    BEFORE UPDATE ON public.ats_career_page_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_application_forms_updated_at
    BEFORE UPDATE ON public.ats_application_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity when application stage changes
CREATE OR REPLACE FUNCTION log_application_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if stage actually changed
    IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
        INSERT INTO public.ats_application_activities (
            application_id,
            user_id,
            activity_type,
            description,
            old_stage,
            new_stage
        ) VALUES (
            NEW.id,
            auth.uid(),
            'stage_change',
            'Application stage changed from ' || COALESCE(OLD.current_stage::text, 'none') || ' to ' || NEW.current_stage::text,
            OLD.current_stage,
            NEW.current_stage
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ats_application_stage_change_trigger
    AFTER UPDATE ON public.ats_applications
    FOR EACH ROW EXECUTE FUNCTION log_application_stage_change();

-- Function to generate career page embed code
CREATE OR REPLACE FUNCTION generate_career_page_embed_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.embed_code := '<iframe src="https://your-domain.com/careers/' || NEW.company_id || '" width="100%" height="600" frameborder="0" style="border: none;"></iframe>';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_embed_code_trigger
    BEFORE INSERT OR UPDATE ON public.ats_career_page_settings
    FOR EACH ROW EXECUTE FUNCTION generate_career_page_embed_code();