-- Phase 5: Database Schema Optimization (Revised)
-- 1. Add missing indexes for performance optimization (without CONCURRENTLY)

-- Performance indexes for frequently queried tables
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active ON user_roles(user_id) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON user_roles(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_email ON profiles(user_id, email);
CREATE INDEX IF NOT EXISTS idx_activities_created_by_date ON activities(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_company ON admin_audit_log(user_id, company_id, created_at DESC);

-- Optimize text search performance
CREATE INDEX IF NOT EXISTS idx_company_settings_name_search ON company_settings USING gin(to_tsvector('english', company_name));

-- Optimize time-based queries
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON activities(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assessments_due_date ON assessments(due_date) WHERE due_date IS NOT NULL;

-- 2. Create optimized views for common queries
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT 
    ur.user_id,
    ur.role,
    ur.company_id,
    p.name as permission_name,
    p.description as permission_description,
    p.resource,
    p.action
FROM user_roles ur
JOIN role_permissions rp ON ur.role = rp.role
JOIN permissions p ON rp.permission_id = p.id;

-- 3. Create function for optimized user context retrieval
CREATE OR REPLACE FUNCTION get_user_context(p_user_id uuid)
RETURNS TABLE(
    user_id uuid,
    email text,
    roles text[],
    company_id uuid,
    company_name text,
    permissions text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.email,
        ARRAY_AGG(DISTINCT ur.role::text) as roles,
        ur.company_id,
        cs.company_name,
        ARRAY_AGG(DISTINCT perm.name) as permissions
    FROM profiles p
    LEFT JOIN user_roles ur ON p.user_id = ur.user_id
    LEFT JOIN company_settings cs ON ur.company_id = cs.id
    LEFT JOIN role_permissions rp ON ur.role = rp.role
    LEFT JOIN permissions perm ON rp.permission_id = perm.id
    WHERE p.user_id = p_user_id
    GROUP BY p.user_id, p.email, ur.company_id, cs.company_name;
END;
$$;

-- 4. Optimize RLS policies with better indexing support
-- Add composite indexes to support RLS policy checks
CREATE INDEX IF NOT EXISTS idx_user_roles_role_user_company ON user_roles(role, user_id, company_id);

-- 5. Create optimized function for permission checking
CREATE OR REPLACE FUNCTION user_has_permission_optimized(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_permissions_view upv
        WHERE upv.user_id = p_user_id 
        AND upv.permission_name = p_permission_name
    );
$$;

-- 6. Add performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_type text NOT NULL, -- 'query_time', 'cache_hit_rate', 'error_rate'
    recorded_at timestamp with time zone DEFAULT now(),
    context jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_date 
ON performance_metrics(metric_name, recorded_at DESC);

-- 7. Add data integrity constraints
DO $$
BEGIN
    -- Add role validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_valid_role'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT check_valid_role 
        CHECK (role IN ('super_admin', 'company_admin', 'client_admin', 'manager', 'user', 'learner', 'internal_staff'));
    END IF;
    
    -- Add email format validation if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_email_format'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT check_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END
$$;