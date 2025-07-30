-- Continue adding performance indexes - Batch 2
-- CRM and analytics related indexes

-- Blog and content indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);

-- Audit logs indexes (for compliance and monitoring)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON public.activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_assessments_status_created_at ON public.assessments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_company ON public.user_roles(user_id, company_id);