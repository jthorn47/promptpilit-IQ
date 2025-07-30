/**
 * Hook for logging Time Track audit events
 * Provides easy integration for automatic audit logging
 */

import { useCallback } from 'react';
import { AuditService } from '../services/AuditService';
import { toast } from 'sonner';

export interface AuditLogParams {
  employee_id: string;
  action_type: string;
  previous_value?: any;
  new_value?: any;
  notes?: string;
  source?: string;
}

export function useAuditLogger() {
  const logAction = useCallback(async (params: AuditLogParams) => {
    try {
      // Get current user context
      const currentUser = localStorage.getItem('supabase.auth.token');
      const userId = currentUser ? JSON.parse(currentUser)?.user?.id : null;
      
      if (!userId) {
        console.warn('No authenticated user for audit logging');
        return;
      }

      // Determine user role (simplified - could be enhanced with proper role checking)
      const userRole = 'employee'; // This would be determined from user context

      await AuditService.logAction({
        employee_id: params.employee_id,
        action_type: params.action_type,
        performed_by_user_id: userId,
        performed_by_role: userRole,
        previous_value: params.previous_value,
        new_value: params.new_value,
        source: params.source || 'web_portal',
        notes: params.notes
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't show error to user - audit failures shouldn't disrupt workflow
    }
  }, []);

  const logClockIn = useCallback((employeeId: string, timestamp: string, location?: string) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'CLOCK_IN',
      new_value: {
        timestamp,
        location,
        source: 'web_portal'
      },
      notes: `Clock in at ${new Date(timestamp).toLocaleString()}`
    });
  }, [logAction]);

  const logClockOut = useCallback((employeeId: string, timestamp: string, totalHours?: number) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'CLOCK_OUT',
      new_value: {
        timestamp,
        total_hours: totalHours,
        source: 'web_portal'
      },
      notes: `Clock out at ${new Date(timestamp).toLocaleString()}`
    });
  }, [logAction]);

  const logPunchEdit = useCallback((
    employeeId: string, 
    oldPunch: any, 
    newPunch: any, 
    reason?: string
  ) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'PUNCH_EDIT',
      previous_value: oldPunch,
      new_value: newPunch,
      notes: reason || 'Punch time edited'
    });
  }, [logAction]);

  const logTimecardApproval = useCallback((
    employeeId: string, 
    timecardData: any, 
    approvedBy: string
  ) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'TIMECARD_APPROVAL',
      new_value: timecardData,
      notes: `Timecard approved by ${approvedBy}`
    });
  }, [logAction]);

  const logMissedPunchCorrection = useCallback((
    employeeId: string, 
    correction: any, 
    reason: string
  ) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'MISSED_PUNCH_CORRECTION',
      new_value: correction,
      notes: `Missed punch correction: ${reason}`
    });
  }, [logAction]);

  const logBreakStart = useCallback((employeeId: string, timestamp: string) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'BREAK_START',
      new_value: { timestamp },
      notes: `Break started at ${new Date(timestamp).toLocaleString()}`
    });
  }, [logAction]);

  const logBreakEnd = useCallback((employeeId: string, timestamp: string, duration?: number) => {
    return logAction({
      employee_id: employeeId,
      action_type: 'BREAK_END',
      new_value: { timestamp, duration_minutes: duration },
      notes: `Break ended at ${new Date(timestamp).toLocaleString()}`
    });
  }, [logAction]);

  return {
    logAction,
    logClockIn,
    logClockOut,
    logPunchEdit,
    logTimecardApproval,
    logMissedPunchCorrection,
    logBreakStart,
    logBreakEnd
  };
}