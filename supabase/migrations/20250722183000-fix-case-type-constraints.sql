
-- Create enum types for case-related fields
CREATE TYPE case_type AS ENUM (
  'hr', 'payroll', 'benefits', 'compliance', 'safety', 
  'onboarding', 'general_support', 'technical', 'billing'
);

CREATE TYPE case_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'waiting', 'closed');
CREATE TYPE case_source AS ENUM ('email', 'manual', 'phone', 'internal', 'web_form');
CREATE TYPE case_visibility AS ENUM ('internal', 'client_viewable');

-- Create migration_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  affected_tables TEXT[] NOT NULL,
  rows_affected JSONB NOT NULL,
  notes TEXT
);

-- Create cases table if it doesn't exist or alter it if it does
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cases') THEN
    -- Create cases table with proper constraints
    CREATE TABLE public.cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('hr', 'payroll', 'benefits', 'compliance', 'safety', 'onboarding', 'general_support', 'technical', 'billing')),
      priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
      status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'waiting', 'closed')) DEFAULT 'open',
      assigned_to UUID REFERENCES auth.users(id),
      assigned_team TEXT,
      related_company_id UUID,
      related_contact_email TEXT,
      source TEXT NOT NULL CHECK (source IN ('email', 'manual', 'phone', 'internal', 'web_form')) DEFAULT 'manual',
      description TEXT NOT NULL,
      internal_notes TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      visibility TEXT NOT NULL CHECK (visibility IN ('internal', 'client_viewable')) DEFAULT 'internal',
      client_viewable BOOLEAN NOT NULL DEFAULT false,
      external_reference TEXT,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      closed_at TIMESTAMP WITH TIME ZONE,
      estimated_hours NUMERIC,
      actual_hours NUMERIC NOT NULL DEFAULT 0
    );

    -- Add indexes
    CREATE INDEX idx_cases_status ON public.cases(status);
    CREATE INDEX idx_cases_type ON public.cases(type);
    CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
    CREATE INDEX idx_cases_related_company_id ON public.cases(related_company_id);
    CREATE INDEX idx_cases_created_at ON public.cases(created_at);
    CREATE INDEX idx_cases_client_viewable ON public.cases(client_viewable);
  ELSE
    -- Table exists, validate and update constraints on columns
    -- Add any missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'actual_hours') THEN
      ALTER TABLE public.cases ADD COLUMN actual_hours NUMERIC NOT NULL DEFAULT 0;
    END IF;

    -- Ensure proper constraints on existing columns
    ALTER TABLE public.cases 
      ALTER COLUMN title SET NOT NULL,
      ALTER COLUMN description SET NOT NULL;
    
    -- Add check constraints for enum fields
    -- Type constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_type_check') THEN
      ALTER TABLE public.cases ADD CONSTRAINT cases_type_check 
        CHECK (type IN ('hr', 'payroll', 'benefits', 'compliance', 'safety', 'onboarding', 'general_support', 'technical', 'billing'));
    END IF;

    -- Priority constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_priority_check') THEN
      ALTER TABLE public.cases ADD CONSTRAINT cases_priority_check 
        CHECK (priority IN ('high', 'medium', 'low'));
    END IF;

    -- Status constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_status_check') THEN
      ALTER TABLE public.cases ADD CONSTRAINT cases_status_check 
        CHECK (status IN ('open', 'in_progress', 'waiting', 'closed'));
    END IF;

    -- Source constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_source_check') THEN
      ALTER TABLE public.cases ADD CONSTRAINT cases_source_check 
        CHECK (source IN ('email', 'manual', 'phone', 'internal', 'web_form'));
    END IF;

    -- Visibility constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_visibility_check') THEN
      ALTER TABLE public.cases ADD CONSTRAINT cases_visibility_check 
        CHECK (visibility IN ('internal', 'client_viewable'));
    END IF;
  END IF;
END$$;

-- Create case_activities table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'case_activities') THEN
    CREATE TABLE public.case_activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'email', 'file', 'status_change', 'assignment_change')),
      content TEXT,
      metadata JSONB NOT NULL DEFAULT '{}',
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_case_activities_case_id ON public.case_activities(case_id);
    CREATE INDEX idx_case_activities_created_at ON public.case_activities(created_at);
  END IF;
END$$;

-- Create case_files table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'case_files') THEN
    CREATE TABLE public.case_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      uploaded_by UUID REFERENCES auth.users(id),
      uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_case_files_case_id ON public.case_files(case_id);
  END IF;
END$$;

-- Create time_entries table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_entries') THEN
    CREATE TABLE public.time_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id),
      duration_minutes INTEGER NOT NULL,
      billable_rate NUMERIC NOT NULL DEFAULT 0,
      is_billable BOOLEAN NOT NULL DEFAULT false,
      notes TEXT,
      entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_time_entries_case_id ON public.time_entries(case_id);
    CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
    CREATE INDEX idx_time_entries_entry_date ON public.time_entries(entry_date);
  END IF;
END$$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Cases policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'cases' AND policyname = 'authenticated_users_can_view_cases') THEN
    CREATE POLICY authenticated_users_can_view_cases ON public.cases
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'cases' AND policyname = 'users_can_create_cases') THEN
    CREATE POLICY users_can_create_cases ON public.cases
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'cases' AND policyname = 'users_can_update_their_cases') THEN
    CREATE POLICY users_can_update_their_cases ON public.cases
      FOR UPDATE
      USING (created_by = auth.uid() OR assigned_to = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'cases' AND policyname = 'users_can_delete_their_cases') THEN
    CREATE POLICY users_can_delete_their_cases ON public.cases
      FOR DELETE
      USING (created_by = auth.uid());
  END IF;
END$$;

-- Update trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'trigger_update_cases_updated_at') THEN
    CREATE TRIGGER trigger_update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION update_cases_updated_at();
  END IF;
END$$;

-- Create test data if cases table is empty
INSERT INTO public.cases (
  title, type, priority, status, description, 
  source, visibility, client_viewable, tags
)
SELECT 
  'Test Case ' || i, 
  CASE (i % 4)
    WHEN 0 THEN 'hr'
    WHEN 1 THEN 'payroll'
    WHEN 2 THEN 'benefits'
    WHEN 3 THEN 'compliance'
  END,
  CASE (i % 3)
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    WHEN 2 THEN 'low'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'in_progress'
    WHEN 2 THEN 'waiting'
    WHEN 3 THEN 'closed'
  END,
  'This is a test case description ' || i,
  'manual',
  'internal',
  false,
  ARRAY['Test', 'Sample']
FROM generate_series(1, 10) i
WHERE NOT EXISTS (SELECT 1 FROM public.cases LIMIT 1);

-- Log migration
INSERT INTO public.migration_logs (
  migration_name,
  affected_tables,
  rows_affected,
  notes
)
VALUES (
  'fix-case-type-constraints',
  ARRAY['cases', 'case_activities', 'case_files', 'time_entries', 'migration_logs'],
  jsonb_build_object(
    'cases', (SELECT COUNT(*) FROM public.cases),
    'case_activities', (SELECT COUNT(*) FROM public.case_activities),
    'case_files', (SELECT COUNT(*) FROM public.case_files),
    'time_entries', (SELECT COUNT(*) FROM public.time_entries)
  ),
  'Fixed case management system tables and added proper constraints for case types'
);
