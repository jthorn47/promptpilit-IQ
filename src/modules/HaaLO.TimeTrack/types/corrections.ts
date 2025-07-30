/**
 * Missed Punch Correction Types
 */

export interface MissedPunchDetection {
  hasConflict: boolean;
  conflictType: 'missing_clockout' | 'missing_clockin' | 'overlapping_shift' | 'none';
  lastPunch?: {
    id: string;
    punch_type: 'clock_in' | 'clock_out';
    timestamp: string;
    location?: string;
    job_code?: string;
  };
  suggestedClockOut?: string;
  shiftDuration?: number;
}

export interface PunchCorrection {
  id: string;
  employee_id: string;
  company_id: string;
  original_punch_id: string;
  correction_type: 'missing_clockout' | 'missing_clockin' | 'time_adjustment';
  original_timestamp?: string;
  corrected_timestamp: string;
  reason: string;
  reason_category: 'forgot' | 'kiosk_down' | 'emergency' | 'break_issue' | 'other';
  employee_submitted: boolean;
  requires_approval: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  approved_by?: string;
  offline_submitted: boolean;
  correction_notes?: string;
  manager_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CorrectionWorkflowState {
  isBlocked: boolean;
  detection?: MissedPunchDetection;
  showCorrectionModal: boolean;
  submittingCorrection: boolean;
  correctionComplete: boolean;
}

export interface PunchCorrectionRequest {
  employee_id: string;
  original_punch_id: string;
  corrected_timestamp: string;
  reason: string;
  reason_category: PunchCorrection['reason_category'];
  correction_notes?: string;
  device_id?: string;
  offline_mode: boolean;
}