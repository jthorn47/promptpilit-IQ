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