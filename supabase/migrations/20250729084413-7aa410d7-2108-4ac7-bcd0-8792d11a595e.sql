-- Create widget definitions table (if not exists)
CREATE TABLE IF NOT EXISTS public.widget_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    component_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    required_roles app_role[] DEFAULT ARRAY[]::app_role[],
    default_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on widget_definitions (if not enabled)
SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'widget_definitions'
    AND rowsecurity = true
) THEN 'ALTER TABLE public.widget_definitions ENABLE ROW LEVEL SECURITY;'
ELSE 'SELECT 1;' -- no-op if already enabled
END;

-- Create user_widget_preferences table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_widget_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    widget_id UUID REFERENCES public.widget_definitions(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    custom_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, widget_id)
);

-- Enable RLS on user_widget_preferences (if not enabled)
SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_widget_preferences'
    AND rowsecurity = true
) THEN 'ALTER TABLE public.user_widget_preferences ENABLE ROW LEVEL SECURITY;'
ELSE 'SELECT 1;' -- no-op if already enabled
END;

-- Create policies only if they don't exist

-- Widget definitions policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'widget_definitions' 
        AND policyname = 'Everyone can view active widgets'
    ) THEN
        CREATE POLICY "Everyone can view active widgets"
        ON public.widget_definitions
        FOR SELECT
        TO authenticated
        USING (is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'widget_definitions' 
        AND policyname = 'Admins can manage widgets'
    ) THEN
        CREATE POLICY "Admins can manage widgets"
        ON public.widget_definitions
        FOR ALL
        TO authenticated
        USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'company_admin'));
    END IF;

    -- User widget preferences policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_widget_preferences' 
        AND policyname = 'Users can manage their own widget preferences'
    ) THEN
        CREATE POLICY "Users can manage their own widget preferences"
        ON public.user_widget_preferences
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Insert default widget definitions (only if none exist)
INSERT INTO public.widget_definitions (name, description, icon, component_name, category, required_roles) 
SELECT * FROM (VALUES
    ('Analytics Dashboard', 'View performance metrics and business insights', 'BarChart3', 'AnalyticsWidget', 'business', ARRAY['super_admin', 'company_admin', 'admin']::app_role[]),
    ('Team Overview', 'Manage your team members and their roles', 'Users', 'TeamWidget', 'management', ARRAY['super_admin', 'company_admin', 'admin', 'manager']::app_role[]),
    ('Task Manager', 'Track and manage tasks and projects', 'Clock', 'TaskWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee', 'manager']::app_role[]),
    ('Financial Reports', 'Track revenue, expenses, and financial performance', 'DollarSign', 'FinanceWidget', 'business', ARRAY['super_admin', 'company_admin']::app_role[]),
    ('Campaign Management', 'Create and manage marketing campaigns', 'Zap', 'CampaignWidget', 'marketing', ARRAY['super_admin', 'company_admin', 'admin']::app_role[]),
    ('Calendar & Meetings', 'Schedule and manage meetings and appointments', 'Calendar', 'CalendarWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee', 'manager']::app_role[]),
    ('Quick Notes', 'Create and manage quick notes and reminders', 'FileText', 'NotesWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee', 'manager']::app_role[]),
    ('System Status', 'Monitor system health and performance', 'Activity', 'StatusWidget', 'system', ARRAY['super_admin', 'company_admin']::app_role[])
) AS v(name, description, icon, component_name, category, required_roles)
WHERE NOT EXISTS (
    SELECT 1 FROM public.widget_definitions LIMIT 1
);

-- Create trigger for updating updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Check if trigger doesn't exist before creating
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_widget_definitions_updated_at'
        ) THEN
            CREATE TRIGGER update_widget_definitions_updated_at
                BEFORE UPDATE ON public.widget_definitions
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at_column();
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_user_widget_preferences_updated_at'
        ) THEN
            CREATE TRIGGER update_user_widget_preferences_updated_at
                BEFORE UPDATE ON public.user_widget_preferences
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
END $$;