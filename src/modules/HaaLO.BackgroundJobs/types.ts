export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'retry';

export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export type JobType = 
  | 'payroll_calculation'
  | 'report_generation'
  | 'data_sync'
  | 'email_batch'
  | 'file_processing'
  | 'tax_calculation'
  | 'benefits_sync'
  | 'audit_export'
  | 'system_maintenance'
  | 'data_cleanup';

export interface JobDefinition {
  id: string;
  name: string;
  type: JobType;
  handler: string; // Function name or module path
  description?: string;
  defaultPriority: JobPriority;
  estimatedDuration?: number; // seconds
  maxRetries: number;
  timeout?: number; // milliseconds
  resourceRequirements?: {
    memory?: number; // MB
    cpu?: number; // cores
  };
}

export interface BackgroundJob {
  id: string;
  type: JobType;
  name: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  payload: Record<string, any>;
  options?: {
    delay?: number; // milliseconds
    retryAttempts?: number;
    timeout?: number;
    cron?: string; // For scheduled jobs
  };
  progress?: {
    current: number;
    total: number;
    message?: string;
    percentage: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  sourceModule: string;
  companyId?: string;
  result?: any;
  error?: string;
  retryCount: number;
  nextRetryAt?: Date;
  logs: JobLog[];
  metadata?: Record<string, any>;
}

export interface JobLog {
  id: string;
  jobId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

export interface JobQueue {
  name: string;
  description: string;
  priority: JobPriority;
  maxConcurrency: number;
  isActive: boolean;
  jobCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
}

export interface JobStats {
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number; // seconds
  throughputPerHour: number;
  errorRate: number; // percentage
  queueHealth: 'healthy' | 'warning' | 'critical';
}

export interface JobSchedule {
  id: string;
  name: string;
  jobType: JobType;
  cronExpression: string;
  isActive: boolean;
  payload: Record<string, any>;
  lastRun?: Date;
  nextRun?: Date;
  sourceModule: string;
  companyId?: string;
}