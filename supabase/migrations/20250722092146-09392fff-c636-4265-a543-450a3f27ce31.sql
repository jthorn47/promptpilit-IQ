-- Create case management system tables

-- Cases table
CREATE TABLE public.cases (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_number text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    type text NOT NULL DEFAULT 'general',
    status text NOT NULL DEFAULT 'open',
    priority text NOT NULL DEFAULT 'medium',
    severity text,
    category text,
    subcategory text,
    tags text[] DEFAULT '{}',
    
    -- Relationships
    related_company_id uuid REFERENCES public.company_settings(id),
    created_by uuid REFERENCES auth.users(id),
    assigned_to uuid REFERENCES auth.users(id),
    assigned_team text,
    
    -- Time tracking
    estimated_hours numeric DEFAULT 0,
    actual_hours numeric DEFAULT 0,
    billable_hours numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    total_cost numeric DEFAULT 0,
    
    -- Dates
    due_date timestamp with time zone,
    resolved_at timestamp with time zone,
    closed_at timestamp with time zone,
    first_response_at timestamp with time zone,
    last_activity_at timestamp with time zone,
    
    -- SLA tracking
    sla_breach_at timestamp with time zone,
    response_time_minutes integer,
    resolution_time_minutes integer,
    
    -- Contact information
    client_contact_name text,
    client_contact_email text,
    client_contact_phone text,
    
    -- Settings
    visibility text DEFAULT 'internal',
    is_billable boolean DEFAULT true,
    is_urgent boolean DEFAULT false,
    requires_approval boolean DEFAULT false,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    custom_fields jsonb DEFAULT '{}',
    
    -- Timestamps
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Case activities table
CREATE TABLE public.case_activities (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    created_by uuid REFERENCES auth.users(id),
    
    activity_type text NOT NULL, -- 'note', 'email', 'call', 'meeting', 'file', 'status_change', 'assignment', 'time_entry'
    content text NOT NULL,
    
    -- Time entry specific fields
    time_spent_hours numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    labor_cost numeric DEFAULT 0,
    is_billable boolean DEFAULT true,
    
    -- Email specific fields  
    email_subject text,
    email_to text,
    email_from text,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    
    -- Timestamps
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Case files table
CREATE TABLE public.case_files (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    uploaded_by uuid REFERENCES auth.users(id),
    
    file_name text NOT NULL,
    file_size integer,
    file_type text,
    file_path text,
    storage_key text,
    
    -- Metadata
    description text,
    metadata jsonb DEFAULT '{}',
    
    -- Timestamps
    uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Case templates table for common case types
CREATE TABLE public.case_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.company_settings(id),
    created_by uuid REFERENCES auth.users(id),
    
    name text NOT NULL,
    description text,
    case_type text NOT NULL,
    template_data jsonb NOT NULL DEFAULT '{}',
    
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases table
CREATE POLICY "Company users can view their cases" 
ON public.cases 
FOR SELECT 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id) OR
    created_by = auth.uid() OR
    assigned_to = auth.uid()
);

CREATE POLICY "Company users can create cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id) OR
    created_by = auth.uid()
);

CREATE POLICY "Company users can update their cases" 
ON public.cases 
FOR UPDATE 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id) OR
    created_by = auth.uid() OR
    assigned_to = auth.uid()
);

CREATE POLICY "Company users can delete their cases" 
ON public.cases 
FOR DELETE 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, related_company_id) OR
    created_by = auth.uid()
);

-- RLS Policies for case_activities table
CREATE POLICY "Users can view case activities" 
ON public.case_activities 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = case_activities.case_id 
        AND (
            has_role(auth.uid(), 'super_admin'::app_role) OR
            has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
            c.created_by = auth.uid() OR
            c.assigned_to = auth.uid()
        )
    )
);

CREATE POLICY "Users can create case activities" 
ON public.case_activities 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = case_activities.case_id 
        AND (
            has_role(auth.uid(), 'super_admin'::app_role) OR
            has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
            c.created_by = auth.uid() OR
            c.assigned_to = auth.uid()
        )
    )
);

-- RLS Policies for case_files table
CREATE POLICY "Users can view case files" 
ON public.case_files 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = case_files.case_id 
        AND (
            has_role(auth.uid(), 'super_admin'::app_role) OR
            has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
            c.created_by = auth.uid() OR
            c.assigned_to = auth.uid()
        )
    )
);

CREATE POLICY "Users can upload case files" 
ON public.case_files 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = case_files.case_id 
        AND (
            has_role(auth.uid(), 'super_admin'::app_role) OR
            has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
            c.created_by = auth.uid() OR
            c.assigned_to = auth.uid()
        )
    )
);

-- RLS Policies for case_templates table
CREATE POLICY "Company users can view templates" 
ON public.case_templates 
FOR SELECT 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    company_id IS NULL -- Global templates
);

CREATE POLICY "Company admins can manage templates" 
ON public.case_templates 
FOR ALL 
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
);

-- Indexes for better performance
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_type ON public.cases(type);
CREATE INDEX idx_cases_priority ON public.cases(priority);
CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX idx_cases_created_by ON public.cases(created_by);
CREATE INDEX idx_cases_company ON public.cases(related_company_id);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX idx_cases_updated_at ON public.cases(updated_at DESC);

CREATE INDEX idx_case_activities_case_id ON public.case_activities(case_id);
CREATE INDEX idx_case_activities_type ON public.case_activities(activity_type);
CREATE INDEX idx_case_activities_created_at ON public.case_activities(created_at DESC);

CREATE INDEX idx_case_files_case_id ON public.case_files(case_id);

-- Triggers for automatic timestamps
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_templates_updated_at
    BEFORE UPDATE ON public.case_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_number text;
    counter integer;
BEGIN
    -- Get current year
    SELECT EXTRACT(year FROM now())::text INTO new_number;
    
    -- Get next sequential number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN case_number ~ ('^' || new_number || '-[0-9]+$') 
            THEN CAST(SPLIT_PART(case_number, '-', 2) AS integer)
            ELSE 0 
        END
    ), 0) + 1
    FROM cases
    INTO counter;
    
    -- Format: YYYY-NNNNNN (e.g., 2024-000001)
    new_number := new_number || '-' || LPAD(counter::text, 6, '0');
    
    RETURN new_number;
END;
$$;

-- Trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION public.auto_generate_case_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
        NEW.case_number := generate_case_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_case_number_trigger
    BEFORE INSERT ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_case_number();

-- Function to update last_activity_at when activities are added
CREATE OR REPLACE FUNCTION public.update_case_last_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.cases 
    SET last_activity_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.case_id;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_case_last_activity_trigger
    AFTER INSERT ON public.case_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_case_last_activity();