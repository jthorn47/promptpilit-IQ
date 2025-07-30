-- Remove all remaining HubSpot/CRM configuration data
-- This will clean up templates, stages, and other setup data

-- Remove email templates (these were likely created for HubSpot integration)
DELETE FROM email_templates;

-- Remove email workflow steps and workflows
DELETE FROM email_workflow_steps;
DELETE FROM email_workflows;

-- Remove activity templates 
DELETE FROM activity_templates;

-- Remove deal stages (these are CRM-specific)
DELETE FROM deal_stages;

-- Remove automation workflows and executions
DELETE FROM automation_executions;
DELETE FROM automation_workflows;

-- Remove blog categories and posts (if any sample content)
DELETE FROM blog_posts;
DELETE FROM blog_categories;

-- Remove any company locations
DELETE FROM company_locations;

-- Clean up any remaining CRM-related configuration
DELETE FROM analytics_alerts;
DELETE FROM analytics_dashboards;
DELETE FROM analytics_metrics WHERE company_id IS NOT NULL;
DELETE FROM analytics_reports;

-- Remove API keys if any were created for integrations
DELETE FROM api_keys;

-- Remove compliance-related sample data if any
DELETE FROM compliance_assessments;
DELETE FROM compliance_policies;
DELETE FROM compliance_audit_trail;