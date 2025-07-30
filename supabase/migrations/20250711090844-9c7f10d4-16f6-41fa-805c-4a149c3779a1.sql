-- Create core staffing tables first

-- Staffing Candidates (external candidates for staffing placements)
CREATE TABLE public.staffing_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_level TEXT DEFAULT 'entry', -- entry, mid, senior, expert
    availability TEXT DEFAULT 'full-time', -- full-time, part-time, contract, temporary
    status TEXT DEFAULT 'active', -- active, placed, inactive
    resume_url TEXT,
    notes TEXT,
    source TEXT DEFAULT 'website', -- website, referral, recruiter, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staffing Positions (job orders from staffing clients)
CREATE TABLE public.staffing_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.staffing_clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    location TEXT,
    pay_rate DECIMAL(10,2),
    pay_type TEXT DEFAULT 'hourly', -- hourly, salary, contract
    status TEXT DEFAULT 'open', -- open, filled, closed
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    duration TEXT, -- for contract positions
    start_date DATE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staffing Placements (when candidate is placed with client)
CREATE TABLE public.staffing_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.staffing_candidates(id) ON DELETE CASCADE,
    position_id UUID REFERENCES public.staffing_positions(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.staffing_clients(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    pay_rate DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, terminated
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staffing_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Staffing Candidates
CREATE POLICY "Staffing users can manage candidates" ON public.staffing_candidates
    FOR ALL USING (
        has_staffing_role(auth.uid(), 'admin'::staffing_role) OR 
        has_staffing_role(auth.uid(), 'recruiter'::staffing_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for Staffing Positions  
CREATE POLICY "Staffing users can manage positions" ON public.staffing_positions
    FOR ALL USING (
        has_staffing_role(auth.uid(), 'admin'::staffing_role) OR 
        has_staffing_role(auth.uid(), 'recruiter'::staffing_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for Staffing Placements
CREATE POLICY "Staffing users can manage placements" ON public.staffing_placements
    FOR ALL USING (
        has_staffing_role(auth.uid(), 'admin'::staffing_role) OR 
        has_staffing_role(auth.uid(), 'recruiter'::staffing_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- Triggers
CREATE TRIGGER update_staffing_candidates_updated_at
    BEFORE UPDATE ON public.staffing_candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staffing_positions_updated_at
    BEFORE UPDATE ON public.staffing_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staffing_placements_updated_at
    BEFORE UPDATE ON public.staffing_placements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();