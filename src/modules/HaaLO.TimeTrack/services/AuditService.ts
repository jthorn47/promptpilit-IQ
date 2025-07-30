/**
 * Time Tracking Audit Service
 * Handles creation and retrieval of immutable audit logs
 */

import { supabase } from "@/integrations/supabase/client";

export interface TimeAuditLog {
  id: string;
  employee_id: string;
  action_type: string;
  performed_by_user_id: string;
  performed_by_role: string;
  timestamp: string;
  previous_value?: any;
  new_value?: any;
  source: string;
  device_id?: string | null;
  ip_address?: unknown;
  notes?: string | null;
  company_id: string;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
  performer?: {
    email: string;
  };
}

export interface AuditLogFilters {
  employee_id?: string;
  action_type?: string;
  performed_by_user_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export class AuditService {
  /**
   * Log a time tracking action
   */
  static async logAction(params: {
    employee_id: string;
    action_type: string;
    performed_by_user_id: string;
    performed_by_role: string;
    previous_value?: any;
    new_value?: any;
    source?: string;
    device_id?: string;
    notes?: string;
    company_id?: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_time_tracking_action', {
        p_employee_id: params.employee_id,
        p_action_type: params.action_type,
        p_performed_by_user_id: params.performed_by_user_id,
        p_performed_by_role: params.performed_by_role,
        p_previous_value: params.previous_value || null,
        p_new_value: params.new_value || null,
        p_source: params.source || 'web_portal',
        p_device_id: params.device_id || null,
        p_notes: params.notes || null,
        p_company_id: params.company_id || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging audit action:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(filters?: AuditLogFilters): Promise<TimeAuditLog[]> {
    try {
      let query = supabase
        .from('time_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }

      if (filters?.action_type) {
        query = query.eq('action_type', filters.action_type);
      }

      if (filters?.performed_by_user_id) {
        query = query.eq('performed_by_user_id', filters.performed_by_user_id);
      }

      if (filters?.date_range) {
        query = query
          .gte('timestamp', filters.date_range.start)
          .lte('timestamp', filters.date_range.end);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      return (data || []) as TimeAuditLog[];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific employee
   */
  static async getEmployeeAuditLogs(employeeId: string): Promise<TimeAuditLog[]> {
    return this.getAuditLogs({ employee_id: employeeId });
  }

  /**
   * Export audit logs to CSV
   */
  static async exportToCSV(filters?: AuditLogFilters): Promise<string> {
    try {
      const logs = await this.getAuditLogs(filters);
      
      const headers = [
        'Timestamp',
        'Employee',
        'Action',
        'Performed By',
        'Role',
        'Source',
        'Previous Value',
        'New Value',
        'Notes'
      ];

      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          `"${(log as any).employee?.first_name || ''} ${(log as any).employee?.last_name || ''}"`,
          log.action_type,
          `"${(log as any).performer?.email || log.performed_by_user_id}"`,
          log.performed_by_role,
          log.source,
          `"${log.previous_value ? JSON.stringify(log.previous_value) : ''}"`,
          `"${log.new_value ? JSON.stringify(log.new_value) : ''}"`,
          `"${log.notes || ''}"`
        ].join(','))
      ];

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit summary stats
   */
  static async getAuditStats(filters?: AuditLogFilters): Promise<{
    total_logs: number;
    action_counts: Record<string, number>;
    top_performers: Array<{ user_id: string; count: number }>;
  }> {
    try {
      const logs = await this.getAuditLogs(filters);
      
      const action_counts = logs.reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const performer_counts = logs.reduce((acc, log) => {
        acc[log.performed_by_user_id] = (acc[log.performed_by_user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const top_performers = Object.entries(performer_counts)
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        total_logs: logs.length,
        action_counts,
        top_performers
      };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      throw error;
    }
  }
}