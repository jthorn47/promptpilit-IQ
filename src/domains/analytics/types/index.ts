// Analytics Domain Types - Match Supabase schema
export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  category: string;
  date_recorded: string;
  metadata?: any;
  metric_type: string;
  time_period: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsReport {
  id: string;
  report_name: string;
  report_type: string;
  report_data: any;
  generated_at: string;
  date_range_start: string;
  date_range_end: string;
  generated_by: string;
  is_scheduled?: boolean;
  schedule_frequency?: string;
  next_generation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  dashboard_config: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  company_id?: string;
  created_by?: string;
  description?: string;
  is_default: boolean;
  sort_order: number;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  alert_type: string;
  condition_config: any;
  is_active: boolean;
  last_triggered_at?: string;
  company_id?: string;
  created_by?: string;
  description?: string;
  kpi_id?: string;
  notification_channels: string[];
  recipients: string[];
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface KPIDefinition {
  id: string;
  name: string;
  description?: string;
  calculation_method: string;
  target_value?: number;
  is_active: boolean;
  category: string;
  source_tables: string[];
  calculation_query?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  company_id?: string;
  critical_threshold?: number;
  warning_threshold?: number;
}