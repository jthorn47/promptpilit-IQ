// Compliance Domain Types
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  status: 'Fully Supported' | 'Available' | 'Configurable';
  category: 'State Law' | 'Federal' | 'Corporate' | 'Industry';
}

export interface CompliancePolicy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  assigned_to?: string;
  created_by?: string;
  next_review_date: string;
  review_frequency_months: number;
  requirements?: string[];
  compliance_frameworks?: string[];
  implementation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceAssessment {
  id: string;
  policy_id: string;
  assessment_date: string;
  assessor_id?: string;
  compliance_score: number;
  status: string;
  findings?: string[];
  recommendations?: string[];
  created_at: string;
}

export interface ComplianceViolation {
  id: string;
  violation_type: string;
  severity: string;
  user_id?: string;
  session_id?: string;
  resource_affected?: string;
  violation_details?: any;
  auto_detected?: boolean;
  reported_by?: string;
  investigation_status?: string;
  notification_sent?: boolean;
  regulatory_reported?: boolean;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ComplianceMetrics {
  total_policies: number;
  active_policies: number;
  compliance_score: number;
  overdue_reviews: number;
  violations_this_month: number;
  frameworks_supported: number;
}