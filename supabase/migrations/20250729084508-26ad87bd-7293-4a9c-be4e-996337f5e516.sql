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

-- Enable RLS on widget_definitions
ALTER TABLE public.widget_definitions ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS on user_widget_preferences
ALTER TABLE public.user_widget_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for widget_definitions
CREATE POLICY "Everyone can view active widgets"
ON public.widget_definitions
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage widgets"
ON public.widget_definitions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'company_admin'));

-- RLS Policies for user_widget_preferences
CREATE POLICY "Users can manage their own widget preferences"
ON public.user_widget_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Insert default widget definitions
INSERT INTO public.widget_definitions (name, description, icon, component_name, category, required_roles) VALUES
('Analytics Dashboard', 'View performance metrics and business insights', 'BarChart3', 'AnalyticsWidget', 'business', ARRAY['super_admin', 'company_admin', 'admin']::app_role[]),
('Team Overview', 'Manage your team members and their roles', 'Users', 'TeamWidget', 'management', ARRAY['super_admin', 'company_admin', 'admin']::app_role[]),
('Task Manager', 'Track and manage tasks and projects', 'Clock', 'TaskWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee']::app_role[]),
('Financial Reports', 'Track revenue, expenses, and financial performance', 'DollarSign', 'FinanceWidget', 'business', ARRAY['super_admin', 'company_admin']::app_role[]),
('Campaign Management', 'Create and manage marketing campaigns', 'Zap', 'CampaignWidget', 'marketing', ARRAY['super_admin', 'company_admin', 'admin']::app_role[]),
('Calendar & Meetings', 'Schedule and manage meetings and appointments', 'Calendar', 'CalendarWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee']::app_role[]),
('Quick Notes', 'Create and manage quick notes and reminders', 'FileText', 'NotesWidget', 'productivity', ARRAY['super_admin', 'company_admin', 'admin', 'employee']::app_role[]),
('System Status', 'Monitor system health and performance', 'Activity', 'StatusWidget', 'system', ARRAY['super_admin', 'company_admin']::app_role[]);