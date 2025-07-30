import { supabase } from '../../../integrations/supabase/client';
import type { 
  AuditLogEntry, 
  AuditLogQuery, 
  AuditLogStats,
  AuditActionType,
  AuditResourceType,
  AuditLogLevel
} from '../types';

export class AuditLogService {
  private static instance: AuditLogService;
  private static initialized = false;
  private static config: any = {};

  private constructor() {}

  static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  static async initialize(config?: any): Promise<void> {
    if (AuditLogService.initialized) return;
    
    console.log('📝 Initializing Audit Log Service', config);
    AuditLogService.config = config || {};
    AuditLogService.initialized = true;
  }

  // Log an audit event
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Store in database
    await this.storeAuditEntry(auditEntry);

    // Emit real-time event if enabled
    if (AuditLogService.config.enableRealTimeLogging) {
      this.emitAuditEvent(auditEntry);
    }

    return auditEntry.id;
  }

  // Quick logging methods for common actions
  async logUserAction(
    userId: string,
    action: AuditActionType,
    resourceType: AuditResourceType,
    details: string,
    options: {
      resourceId?: string;
      resourceName?: string;
      companyId?: string;
      sourceModule: string;
      route?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    return this.log({
      userId,
      action,
      resourceType,
      details,
      level: 'info',
      success: true,
      sourceModule: options.sourceModule,
      companyId: options.companyId,
      resourceId: options.resourceId,
      resourceName: options.resourceName,
      route: options.route,
      oldValues: options.oldValues,
      newValues: options.newValues,
      metadata: options.metadata,
    });
  }

  async logSystemAction(
    action: AuditActionType,
    resourceType: AuditResourceType,
    details: string,
    sourceModule: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      action,
      resourceType,
      details,
      level: 'info',
      success: true,
      sourceModule,
      metadata,
    });
  }

  async logError(
    action: AuditActionType,
    resourceType: AuditResourceType,
    error: string,
    sourceModule: string,
    options: {
      userId?: string;
      companyId?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    return this.log({
      ...options,
      action,
      resourceType,
      details: `Error: ${error}`,
      level: 'error',
      success: false,
      errorMessage: error,
      sourceModule,
    });
  }

  // Query audit logs
  async queryLogs(query: AuditLogQuery): Promise<{ logs: AuditLogEntry[]; total: number }> {
    // Mock implementation - would query actual audit_logs table
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        userId: 'user-1',
        userEmail: 'admin@company.com',
        companyId: 'company-1',
        action: 'create',
        resourceType: 'payroll_run',
        resourceId: 'payroll-123',
        resourceName: 'October 2024 Payroll',
        details: 'Created new payroll run for October 2024',
        level: 'info',
        success: true,
        sourceModule: 'HaaLO.PayrollEngine',
        route: '/admin/payroll/create',
        duration: 1500,
        affectedRecords: 25,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        userId: 'user-2',
        userEmail: 'manager@company.com',
        companyId: 'company-1',
        action: 'update',
        resourceType: 'employee',
        resourceId: 'emp-456',
        resourceName: 'John Doe',
        details: 'Updated employee salary information',
        level: 'info',
        success: true,
        sourceModule: 'HaaLO.EmployeeManagement',
        route: '/admin/employees/emp-456/edit',
        oldValues: { salary: 75000 },
        newValues: { salary: 78000 },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: 'login',
        resourceType: 'user',
        userId: 'user-1',
        userEmail: 'admin@company.com',
        companyId: 'company-1',
        details: 'User logged in successfully',
        level: 'info',
        success: true,
        sourceModule: 'HaaLO.Authentication',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
    ];

    // Apply filters
    let filteredLogs = mockLogs;
    
    if (query.companyId) {
      filteredLogs = filteredLogs.filter(log => log.companyId === query.companyId);
    }
    
    if (query.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
    }
    
    if (query.action) {
      filteredLogs = filteredLogs.filter(log => log.action === query.action);
    }
    
    if (query.resourceType) {
      filteredLogs = filteredLogs.filter(log => log.resourceType === query.resourceType);
    }

    // Sort
    filteredLogs.sort((a, b) => {
      const aValue = a.timestamp;
      const bValue = b.timestamp;
      return query.sortOrder === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    });

    // Paginate
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
    };
  }

  // Get audit statistics
  async getStats(companyId?: string, dateRange?: { start: Date; end: Date }): Promise<AuditLogStats> {
    // Mock implementation
    return {
      totalEvents: 1247,
      uniqueUsers: 15,
      errorRate: 2.3,
      topActions: [
        { action: 'read', count: 450 },
        { action: 'update', count: 320 },
        { action: 'create', count: 180 },
        { action: 'login', count: 150 },
        { action: 'delete', count: 45 },
      ],
      topResources: [
        { resourceType: 'employee', count: 380 },
        { resourceType: 'payroll_run', count: 220 },
        { resourceType: 'timesheet', count: 180 },
        { resourceType: 'user', count: 150 },
        { resourceType: 'report', count: 90 },
      ],
      activityByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 10,
      })),
      activityByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 200) + 50,
      })),
    };
  }

  // Store audit entry in database
  private async storeAuditEntry(entry: AuditLogEntry): Promise<void> {
    try {
      // Mock implementation - would store in actual audit_logs table
      console.log('📝 Storing audit log entry:', {
        id: entry.id,
        action: entry.action,
        resourceType: entry.resourceType,
        userId: entry.userId,
        sourceModule: entry.sourceModule,
      });
      
      // In real implementation:
      // await supabase.from('audit_logs').insert(entry);
    } catch (error) {
      console.error('Failed to store audit entry:', error);
    }
  }

  // Emit real-time audit event
  private emitAuditEvent(entry: AuditLogEntry): void {
    // Emit to real-time subscribers
    const event = {
      type: 'audit_log_created',
      payload: entry,
      timestamp: new Date(),
    };
    
    // Would emit to WebSocket or Server-Sent Events
    console.log('📡 Emitting audit event:', event.type);
  }

  // Clean up old audit logs based on retention policy
  async cleanupOldLogs(): Promise<number> {
    const retentionDays = AuditLogService.config.retentionDays || 365;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    // Mock implementation
    console.log(`🧹 Cleaning up audit logs older than ${cutoffDate.toISOString()}`);
    return 0; // Number of deleted records
  }
}