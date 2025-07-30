// Assessments Domain Types
export interface Assessment {
  id: string;
  company_name: string;
  company_email: string;
  company_size: string;
  industry: string;
  responses: any;
  risk_score: number;
  risk_level: string;
  status?: string;
  assigned_to?: string[];
  assigned_by?: string;
  due_date?: string;
  reminder_sent_at?: string;
  ai_report?: any;
  completion_metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AssessmentNotification {
  id: string;
  assessment_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AssessmentMetrics {
  totalAssessments: number;
  completedAssessments: number;
  averageRiskScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  industryBreakdown: Record<string, number>;
  companySizeBreakdown: Record<string, number>;
}

export interface RiskAnalysis {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  categories: Record<string, number>;
  recommendations: string[];
  priority_actions: string[];
}