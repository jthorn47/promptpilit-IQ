
// Core Case Management Domain Types
export interface Case {
  id: string;
  title: string;
  type: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  assigned_to?: string;
  assigned_team?: string;
  related_company_id?: string;
  related_contact_email?: string;
  client_id?: string;
  related_employees?: string[];
  source: CaseSource;
  description: string;
  internal_notes?: string;
  tags: string[];
  visibility: CaseVisibility;
  client_viewable: boolean;
  external_reference?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  estimated_hours?: number;
  actual_hours: number;
  company_settings?: {
    company_name: string;
  };
  client?: {
    id: string;
    company_name: string;
    company_settings_id?: string;
  };
  employees?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    position?: string;
  }[];
}

export type CaseType = 
  | 'hr' 
  | 'payroll' 
  | 'benefits'
  | 'compliance' 
  | 'safety' 
  | 'onboarding' 
  | 'general_support' 
  | 'technical' 
  | 'billing';

export type CasePriority = 'high' | 'medium' | 'low';

export type CaseStatus = 'open' | 'in_progress' | 'waiting' | 'closed';

export type CaseSource = 'email' | 'manual' | 'phone' | 'internal' | 'web_form';

export type CaseVisibility = 'internal' | 'client_viewable';

export interface CaseFilters {
  status?: CaseStatus;
  type?: CaseType;
  assigned_to?: string;
  assigned_team?: string;
  company_id?: string;
  tags?: string[];
  visibility?: CaseVisibility;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface TimeEntry {
  id: string;
  case_id: string;
  user_id: string;
  duration_minutes: number;
  billable_rate: number;
  is_billable: boolean;
  notes: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseRequest extends Omit<Case, 'id' | 'created_at' | 'updated_at' | 'actual_hours' | 'closed_at'> {}

export interface UpdateCaseRequest extends Partial<Omit<Case, 'id' | 'created_at' | 'updated_at'>> {}

// Domain Events
export interface CaseCreatedEvent {
  type: 'CASE_CREATED';
  payload: {
    caseId: string;
    case: Case;
    timestamp: string;
  };
}

export interface CaseUpdatedEvent {
  type: 'CASE_UPDATED';
  payload: {
    caseId: string;
    changes: Partial<Case>;
    previousState: Case;
    timestamp: string;
  };
}

export interface CaseClosedEvent {
  type: 'CASE_CLOSED';
  payload: {
    caseId: string;
    case: Case;
    resolutionTime: number;
    timestamp: string;
  };
}

export type CaseEvent = CaseCreatedEvent | CaseUpdatedEvent | CaseClosedEvent;

// Case Activity Types
export interface CaseActivity {
  id: string;
  case_id: string;
  activity_type: CaseActivityType;
  content?: string;
  metadata: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export type CaseActivityType = 'note' | 'email' | 'file' | 'status_change' | 'assignment_change';

export interface CreateCaseActivityRequest {
  case_id: string;
  activity_type: CaseActivityType;
  content?: string;
  metadata?: Record<string, any>;
}

// Case File Types
export interface CaseFile {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface CreateCaseFileRequest {
  case_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
}

// Tag Constants
export const STANDARD_CASE_TAGS = ['HR', 'Payroll', 'Benefits', 'Compliance', 'Other'] as const;
