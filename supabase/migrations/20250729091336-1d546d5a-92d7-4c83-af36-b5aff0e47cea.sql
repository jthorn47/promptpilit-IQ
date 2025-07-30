-- Add new widget definitions for expanded dashboard functionality

-- CLIENTS & HR WIDGETS
INSERT INTO public.widget_definitions (
  name, description, icon, component_name, category, required_roles, default_config, is_active
) VALUES 
(
  'Active Clients',
  'Displays total number of active clients and contract tiers',
  'Building2',
  'ActiveClientsWidget',
  'clients',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"refresh_interval": 300000, "show_tiers": true}'::jsonb,
  true
),
(
  'Employee Headcount',
  'Shows total employees across clients and by department',
  'Users',
  'EmployeeHeadcountWidget',
  'hr',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"show_departments": true, "show_trends": true}'::jsonb,
  true
),
(
  'New Hire Tracker',
  'List of employees hired in the last 30 days with onboarding status',
  'UserPlus',
  'NewHireTrackerWidget',
  'hr',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"days_range": 30, "show_onboarding_status": true}'::jsonb,
  true
);

-- COMPLIANCE & RISK WIDGETS
INSERT INTO public.widget_definitions (
  name, description, icon, component_name, category, required_roles, default_config, is_active
) VALUES 
(
  'SB 553 Compliance',
  'Shows which clients have submitted Workplace Violence Prevention Plans',
  'Shield',
  'SB553ComplianceWidget',
  'compliance',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"show_submission_status": true, "alert_overdue": true}'::jsonb,
  true
),
(
  'Training Expirations',
  'Shows employees with compliance training due in next 30 days',
  'AlertTriangle',
  'TrainingExpirationsWidget',
  'compliance',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"days_ahead": 30, "show_critical_only": false}'::jsonb,
  true
),
(
  'Incident Reports',
  'Displays total new Pulse CMS cases filed this month with status breakdown',
  'FileWarning',
  'IncidentReportsWidget',
  'compliance',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"show_status_breakdown": true, "current_month_only": true}'::jsonb,
  true
);

-- TRAINING & LMS WIDGETS
INSERT INTO public.widget_definitions (
  name, description, icon, component_name, category, required_roles, default_config, is_active
) VALUES 
(
  'LMS Progress',
  'Training completion percentage per department or client',
  'GraduationCap',
  'LMSProgressWidget',
  'training',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"show_by_department": true, "show_progress_bars": true}'::jsonb,
  true
),
(
  'Untrained Employees',
  'Number of users who have not completed required training',
  'UserX',
  'UntrainedEmployeesWidget',
  'training',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"show_critical_training": true, "group_by_department": true}'::jsonb,
  true
),
(
  'Course Suggestions',
  'AI-generated or admin-recommended training based on user role and activity',
  'BookOpen',
  'CourseSuggestionsWidget',
  'training',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"max_suggestions": 5, "personalized": true}'::jsonb,
  true
);

-- BUSINESS INSIGHTS WIDGETS
INSERT INTO public.widget_definitions (
  name, description, icon, component_name, category, required_roles, default_config, is_active
) VALUES 
(
  'Retention Tracker',
  'Client or employee retention percentage over time (month/quarter)',
  'TrendingUp',
  'RetentionTrackerWidget',
  'analytics',
  ARRAY['super_admin', 'company_admin']::app_role[],
  '{"track_clients": true, "track_employees": true, "time_period": "quarterly"}'::jsonb,
  true
),
(
  'Top Performing Clients',
  'Rank clients by revenue, activity, or task volume',
  'Trophy',
  'TopPerformingClientsWidget',
  'analytics',
  ARRAY['super_admin', 'company_admin']::app_role[],
  '{"metric": "revenue", "top_count": 10, "show_metrics": true}'::jsonb,
  true
),
(
  'Task Overload Heatmap',
  'Visual of users or teams with high open task counts',
  'Target',
  'TaskOverloadHeatmapWidget',
  'analytics',
  ARRAY['super_admin', 'company_admin', 'admin']::app_role[],
  '{"threshold_tasks": 20, "show_team_view": true, "color_coding": true}'::jsonb,
  true
);