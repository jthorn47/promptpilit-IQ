export type TrainingType = 
  | 'Harassment'
  | 'SB553'
  | 'AML'
  | 'Safety'
  | 'Cybersecurity'
  | 'Manager_Training'
  | 'Compliance';

export interface LMSCredit {
  id: string;
  company_id: string;
  employee_id?: string;
  training_type: TrainingType;
  credits_issued: number;
  credits_used: number;
  notes?: string;
  issued_at: string;
  updated_at: string;
}

export interface LMSCreditSummary {
  training_type: TrainingType;
  total_issued: number;
  total_used: number;
  total_remaining: number;
  last_updated: string;
}

export interface LMSCreditForm {
  training_type: TrainingType;
  credits_issued: number;
  employee_id?: string;
  notes?: string;
}