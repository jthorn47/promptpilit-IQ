// HALOnet Payment Orchestration Types
export interface PaymentBatch {
  id: string;
  company_id: string;
  batch_number: string;
  batch_type: 'payroll' | 'garnishment' | 'bonus' | 'correction';
  effective_date: string;
  created_by: string;
  
  // Batch totals
  total_amount: number;
  total_count: number;
  credit_amount: number;
  debit_amount: number;
  
  // Status tracking
  status: 'draft' | 'pending_approval' | 'approved' | 'submitted' | 'processing' | 'completed' | 'failed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected';
  submission_status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  
  // Provider information
  provider_id?: string;
  provider_batch_id?: string;
  provider_response?: any;
  
  // Approval workflow
  requires_approval: boolean;
  approval_threshold?: number;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  
  // Submission tracking
  submitted_by?: string;
  submitted_at?: string;
  confirmed_at?: string;
  
  // NACHA file
  nacha_file_content?: string;
  nacha_file_hash?: string;
  entry_hash?: number;
  
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentEntry {
  id: string;
  batch_id: string;
  company_id: string;
  
  // Employee/recipient info
  employee_id?: string;
  recipient_name: string;
  recipient_account_number: string; // Encrypted
  recipient_routing_number: string;
  recipient_account_type: 'checking' | 'savings';
  
  // Payment details
  amount: number;
  currency: string;
  transaction_type: 'credit' | 'debit';
  payment_type: 'salary' | 'bonus' | 'garnishment' | 'child_support' | 'tax_levy';
  
  // Garnishment specific
  garnishment_id?: string;
  garnishment_priority?: number;
  court_order_number?: string;
  
  // Status tracking
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'returned' | 'failed' | 'voided';
  provider_transaction_id?: string;
  trace_number?: string;
  
  // Return/NSF handling
  return_code?: string;
  return_reason?: string;
  return_date?: string;
  nsf_fee?: number;
  
  addenda_info?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  batch_id: string;
  company_id: string;
  
  // Request details
  request_type: 'batch_approval' | 'void_request' | 'emergency_release';
  requested_by: string;
  request_reason?: string;
  
  // Approval requirements
  required_approvers: any[];
  approval_threshold: number;
  requires_2fa: boolean;
  
  // Current status
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approved_count: number;
  
  expires_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RiskControl {
  id: string;
  company_id: string;
  
  control_type: 'amount_threshold' | 'velocity_check' | 'account_validation' | 'time_restriction';
  control_name: string;
  is_active: boolean;
  
  threshold_config: any;
  action_type: 'require_approval' | 'block' | 'flag' | 'delay';
  action_config: any;
  
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface RiskEvent {
  id: string;
  company_id: string;
  batch_id?: string;
  entry_id?: string;
  control_id: string;
  
  event_type: 'threshold_exceeded' | 'velocity_violation' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  risk_score: number;
  risk_factors: any;
  detected_patterns?: any;
  
  status: 'active' | 'resolved' | 'false_positive' | 'suppressed';
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  
  created_at: string;
}

export interface CreateBatchRequest {
  batch_type: 'payroll' | 'garnishment' | 'bonus' | 'correction';
  effective_date: string;
  entries: Omit<PaymentEntry, 'id' | 'batch_id' | 'company_id' | 'created_at' | 'updated_at'>[];
  metadata?: any;
}

export interface HALOcalcIntegrationRequest {
  payroll_calculation_id: string;
  net_pay_results: Array<{
    employee_id: string;
    net_pay: number;
    garnishments?: Array<{
      type: string;
      amount: number;
      priority: number;
      court_order?: string;
    }>;
    bank_account: {
      account_number: string;
      routing_number: string;
      account_type: 'checking' | 'savings';
    };
  }>;
  effective_date: string;
}

export interface ProviderSubmissionResponse {
  success: boolean;
  provider_batch_id?: string;
  confirmation_number?: string;
  estimated_settlement_date?: string;
  errors?: string[];
  warnings?: string[];
}