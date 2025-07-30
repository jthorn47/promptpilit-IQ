
-- Phase 3: Job Orders & ATS Tables

-- Job orders from clients
CREATE TABLE public.job_orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.staffing_clients(id),
    title text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    employment_type text NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
    pay_rate_min numeric(10,2),
    pay_rate_max numeric(10,2),
    pay_type text NOT NULL CHECK (pay_type IN ('hourly', 'salary', 'daily')),
    positions_available integer NOT NULL DEFAULT 1,
    positions_filled integer NOT NULL DEFAULT 0,
    required_skills text[],
    preferred_skills text[],
    experience_required text,
    education_required text,
    certifications_required text[],
    shift_schedule text,
    start_date date,
    end_date date,
    urgency_level text NOT NULL DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'on_hold', 'filled', 'cancelled')),
    created_by uuid NOT NULL, -- recruiter who created the order
    assigned_to uuid[], -- recruiters assigned to fill this position
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Job applications from candidates
CREATE TABLE public.job_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_order_id uuid NOT NULL REFERENCES public.job_orders(id),
    candidate_first_name text NOT NULL,
    candidate_last_name text NOT NULL,
    candidate_email text NOT NULL,
    candidate_phone text,
    resume_url text,
    cover_letter text,
    application_source text, -- 'direct', 'referral', 'job_board', 'recruiter'
    referrer_name text,
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
    screening_notes text,
    interview_feedback text,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    availability_start date,
    salary_expectation numeric(10,2),
    willing_to_relocate boolean DEFAULT false,
    submitted_by uuid, -- recruiter who submitted the application
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Interview scheduling
CREATE TABLE public.interviews (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.job_applications(id),
    interview_type text NOT NULL CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical')),
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 60,
    interviewer_name text,
    interviewer_email text,
    location text, -- for in-person interviews
    meeting_link text, -- for video interviews
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    feedback text,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    next_steps text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Placements/hires tracking
CREATE TABLE public.placements (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_order_id uuid NOT NULL REFERENCES public.job_orders(id),
    application_id uuid NOT NULL REFERENCES public.job_applications(id),
    employee_id uuid REFERENCES public.employees(id), -- created after hire
    start_date date NOT NULL,
    end_date date,
    hourly_rate numeric(10,2),
    salary numeric(12,2),
    markup_percentage numeric(5,2),
    bill_rate numeric(10,2),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'temp_inactive')),
    termination_reason text,
    performance_notes text,
    placed_by uuid NOT NULL, -- recruiter who made the placement
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_orders
CREATE POLICY "Admins can manage all job orders"
ON public.job_orders
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters can manage job orders in their territory"
ON public.job_orders
FOR ALL
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'recruiter') AND
    (created_by = auth.uid() OR auth.uid() = ANY(assigned_to))
);

CREATE POLICY "POPs can view job orders for their approved clients"
ON public.job_orders
FOR SELECT
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'pop') AND
    EXISTS (
        SELECT 1 FROM public.staffing_clients sc
        WHERE sc.id = job_orders.client_id
        AND sc.submitted_by = auth.uid()
        AND sc.approval_status = 'approved'
    )
);

-- RLS Policies for job_applications
CREATE POLICY "Admins can manage all applications"
ON public.job_applications
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters can manage applications for their jobs"
ON public.job_applications
FOR ALL
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'recruiter') AND
    EXISTS (
        SELECT 1 FROM public.job_orders jo
        WHERE jo.id = job_applications.job_order_id
        AND (jo.created_by = auth.uid() OR auth.uid() = ANY(jo.assigned_to))
    )
);

-- RLS Policies for interviews
CREATE POLICY "Admins can manage all interviews"
ON public.interviews
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters can manage interviews for their applications"
ON public.interviews
FOR ALL
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'recruiter') AND
    (created_by = auth.uid() OR
     EXISTS (
         SELECT 1 FROM public.job_applications ja
         JOIN public.job_orders jo ON ja.job_order_id = jo.id
         WHERE ja.id = interviews.application_id
         AND (jo.created_by = auth.uid() OR auth.uid() = ANY(jo.assigned_to))
     ))
);

-- RLS Policies for placements
CREATE POLICY "Admins can manage all placements"
ON public.placements
FOR ALL
TO authenticated
USING (has_staffing_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters can manage their placements"
ON public.placements
FOR ALL
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'recruiter') AND
    placed_by = auth.uid()
);

CREATE POLICY "POPs can view placements for their clients"
ON public.placements
FOR SELECT
TO authenticated
USING (
    has_staffing_role(auth.uid(), 'pop') AND
    EXISTS (
        SELECT 1 FROM public.job_orders jo
        JOIN public.staffing_clients sc ON jo.client_id = sc.id
        WHERE jo.id = placements.job_order_id
        AND sc.submitted_by = auth.uid()
    )
);

-- Triggers for updated_at
CREATE TRIGGER update_job_orders_updated_at
    BEFORE UPDATE ON public.job_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON public.interviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

CREATE TRIGGER update_placements_updated_at
    BEFORE UPDATE ON public.placements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_staffing();

-- Indexes for performance
CREATE INDEX idx_job_orders_client_id ON public.job_orders(client_id);
CREATE INDEX idx_job_orders_status ON public.job_orders(status);
CREATE INDEX idx_job_orders_created_by ON public.job_orders(created_by);
CREATE INDEX idx_job_orders_assigned_to ON public.job_orders USING gin(assigned_to);

CREATE INDEX idx_job_applications_job_order_id ON public.job_applications(job_order_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_email ON public.job_applications(candidate_email);

CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON public.interviews(status);

CREATE INDEX idx_placements_job_order_id ON public.placements(job_order_id);
CREATE INDEX idx_placements_application_id ON public.placements(application_id);
CREATE INDEX idx_placements_status ON public.placements(status);
CREATE INDEX idx_placements_placed_by ON public.placements(placed_by);
