export interface ComplianceMetrics {
  total_policies: number;
  active_policies: number;
  compliance_score: number;
  overdue_reviews: number;
  violations_this_month: number;
  frameworks_supported: number;
}

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'in_progress' | 'missing';
  source: string;
  lastChecked: Date;
  details: {
    completed: number;
    total: number;
    percentage: number;
  };
  actionButton?: {
    label: string;
    action: () => void;
  };
}

export interface PolicyAssignmentSummary {
  policy_id: string;
  policy_title: string;
  total_assigned: number;
  total_accepted: number;
  acceptance_rate: number;
}

export interface OnboardingSummary {
  total_employees: number;
  completed_onboarding: number;
  completion_rate: number;
}

export interface TrainingSummary {
  total_employees: number;
  completed_training: number;
  completion_rate: number;
  training_type: string;
}