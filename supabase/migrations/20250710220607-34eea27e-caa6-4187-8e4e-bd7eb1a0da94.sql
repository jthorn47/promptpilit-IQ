-- Add critical database indexes for performance (without CONCURRENTLY due to transaction limitations)
-- These indexes will significantly improve query performance across the application

-- User and authentication related indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- User roles and permissions indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);

-- Assessment and training related indexes
CREATE INDEX IF NOT EXISTS idx_assessments_company_name ON public.assessments(company_name);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON public.assessments(risk_level);

-- Company settings indexes
CREATE INDEX IF NOT EXISTS idx_company_settings_company_name ON public.company_settings(company_name);
CREATE INDEX IF NOT EXISTS idx_company_settings_subscription_status ON public.company_settings(subscription_status);
CREATE INDEX IF NOT EXISTS idx_company_settings_created_at ON public.company_settings(created_at DESC);