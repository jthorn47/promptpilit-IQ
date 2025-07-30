-- Add critical database indexes for performance
-- These indexes will significantly improve query performance across the application

-- User and authentication related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- User roles and permissions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);

-- Assessment and training related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_company_name ON public.assessments(company_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_risk_level ON public.assessments(risk_level);

-- Company settings indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_settings_company_name ON public.company_settings(company_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_settings_subscription_status ON public.company_settings(subscription_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_settings_created_at ON public.company_settings(created_at DESC);

-- CRM indexes for leads and deals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_value ON public.deals(value DESC);

-- Blog and content indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);

-- Audit logs indexes (for compliance and monitoring)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);

-- Activities and analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_assigned_to ON public.activities(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_status ON public.activities(status);

-- Search index for full-text search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_index_content ON public.search_index USING gin(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_index_entity_type ON public.search_index(entity_type);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_status_created_at ON public.assessments(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_company ON public.user_roles(user_id, company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC) WHERE status = 'published';

-- Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_completed ON public.assessments(created_at DESC) WHERE status = 'completed';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_users ON public.profiles(created_at DESC) WHERE user_id IS NOT NULL;

-- Analytics metrics indexes for dashboard performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_metrics_date_company ON public.analytics_metrics(date_recorded DESC, company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_metrics_category_type ON public.analytics_metrics(category, metric_type);

COMMENT ON INDEX idx_profiles_user_id IS 'Performance index for user profile lookups';
COMMENT ON INDEX idx_assessments_status_created_at IS 'Composite index for assessment filtering and sorting';
COMMENT ON INDEX idx_search_index_content IS 'Full-text search index for application search functionality';