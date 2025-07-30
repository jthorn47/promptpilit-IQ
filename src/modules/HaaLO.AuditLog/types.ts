export type AuditActionType = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'permission_change'
  | 'system_action'
  | 'file_upload'
  | 'file_download'
  | 'data_export'
  | 'report_generated'
  | 'email_sent'
  | 'password_change'
  | 'user_created'
  | 'user_deactivated';

export type AuditResourceType = 
  | 'user'
  | 'employee'
  | 'payroll_run'
  | 'timesheet'
  | 'benefit_enrollment'
  | 'company_settings'
  | 'tax_form'
  | 'report'
  | 'notification'
  | 'system'
  | 'api_key'
  | 'integration';

export type AuditLogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  companyId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  details: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  sourceModule: string;
  route?: string;
  level: AuditLogLevel;
  success: boolean;
  errorMessage?: string;
  duration?: number; // milliseconds
  affectedRecords?: number;
}

export interface AuditLogQuery {
  companyId?: string;
  userId?: string;
  action?: AuditActionType;
  resourceType?: AuditResourceType;
  dateFrom?: Date;
  dateTo?: Date;
  level?: AuditLogLevel;
  sourceModule?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'action' | 'user';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogStats {
  totalEvents: number;
  uniqueUsers: number;
  errorRate: number;
  topActions: Array<{ action: AuditActionType; count: number }>;
  topResources: Array<{ resourceType: AuditResourceType; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
  activityByDay: Array<{ date: string; count: number }>;
}

export interface AuditConfiguration {
  tenantScoped: boolean;
  retentionDays: number;
  enableRealTimeLogging: boolean;
  logSensitiveData: boolean;
  excludedActions?: AuditActionType[];
  excludedResources?: AuditResourceType[];
}