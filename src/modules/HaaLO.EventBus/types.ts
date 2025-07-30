// Event Bus types and interfaces

export interface HaaLOEvent {
  type: string;
  payload: any;
  sourceModule: string;
  timestamp: number;
  id: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  callback: (event: HaaLOEvent) => void | Promise<void>;
  module: string;
  filter?: (event: HaaLOEvent) => boolean;
  once?: boolean;
  priority?: number;
}

export interface EventBusMetrics {
  totalEvents: number;
  eventsPerMinute: number;
  activeSubscriptions: number;
  eventTypes: {
    type: string;
    count: number;
    lastSeen: number;
  }[];
  moduleActivity: {
    module: string;
    published: number;
    subscribed: number;
  }[];
  performance: {
    averageProcessingTime: number;
    slowestEvents: {
      type: string;
      processingTime: number;
      timestamp: number;
    }[];
  };
}

export interface EventBusConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  eventHistoryLimit: number;
  processingTimeout: number;
}

// Standard HaaLO event types
export const HAALO_EVENTS = {
  // Employee events
  EMPLOYEE_CREATED: 'employee.created',
  EMPLOYEE_UPDATED: 'employee.updated',
  EMPLOYEE_TERMINATED: 'employee.terminated',
  EMPLOYEE_REHIRED: 'employee.rehired',
  
  // Payroll events
  PAYROLL_RUN_STARTED: 'payroll.run.started',
  PAYROLL_RUN_COMPLETED: 'payroll.run.completed',
  PAYROLL_RUN_FAILED: 'payroll.run.failed',
  PAY_STUB_GENERATED: 'paystub.generated',
  
  // Benefits events
  BENEFIT_ENROLLMENT_CREATED: 'benefits.enrollment.created',
  BENEFIT_ENROLLMENT_UPDATED: 'benefits.enrollment.updated',
  BENEFIT_ENROLLMENT_CANCELLED: 'benefits.enrollment.cancelled',
  
  // Time tracking events
  TIME_ENTRY_CREATED: 'time.entry.created',
  TIME_ENTRY_UPDATED: 'time.entry.updated',
  TIME_ENTRY_APPROVED: 'time.entry.approved',
  TIME_ENTRY_REJECTED: 'time.entry.rejected',
  
  // Compliance events
  COMPLIANCE_VIOLATION_DETECTED: 'compliance.violation.detected',
  COMPLIANCE_REPORT_GENERATED: 'compliance.report.generated',
  
  // System events
  MODULE_LOADED: 'system.module.loaded',
  MODULE_UNLOADED: 'system.module.unloaded',
  USER_SESSION_STARTED: 'system.user.session.started',
  USER_SESSION_ENDED: 'system.user.session.ended'
} as const;

export type HaaLOEventType = typeof HAALO_EVENTS[keyof typeof HAALO_EVENTS];