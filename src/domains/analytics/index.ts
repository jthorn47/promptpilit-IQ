// Analytics Domain - Main Entry Point
export * from './hooks';
export * from './types';
export { default as AnalyticsRouter } from './router';

// Re-export components with prefix to avoid conflicts
export { 
  AnalyticsDashboard as AnalyticsDashboardComponent,
  AnalyticsReports as AnalyticsReportsComponent,
  AnalyticsMetrics as AnalyticsMetricsComponent,
  AnalyticsAlerts as AnalyticsAlertsComponent,
  KPIManager as KPIManagerComponent
} from './components';