-- Add missing role values to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sales_rep';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';

-- Add comment for documentation
COMMENT ON TYPE app_role IS 'Application roles: super_admin, company_admin, learner, internal_staff, sales_rep, admin, moderator';