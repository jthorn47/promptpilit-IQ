// CRM Domain Types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name: string;
  title?: string;
  source: string;
  status: string;
  score?: number;
  notes?: string;
  assigned_to: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  value?: number;
  stage_id: string;
  status: string;
  probability?: number;
  company_name: string;
  contact_name: string;
  contact_email: string;
  lead_id?: string;
  assigned_to: string;
  expected_close_date?: string;
  actual_close_date?: string;
  notes?: string;
  company_id?: string;
  currency?: string;
  // Enhanced Opportunities fields
  product_line?: 'HRO' | 'Staffing' | 'LMS' | 'Consulting' | 'Other';
  spin_situation?: string;
  spin_problem?: string;
  spin_implication?: string;
  spin_need_payoff?: string;
  risk_assessment_id?: string;
  proposal_id?: string;
  last_activity_date?: string;
  next_follow_up_date?: string;
  sarah_recommendations?: any[];
  spin_completion_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: string;
  status: string;
  subject: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  company_id?: string;
  lead_id?: string;
  deal_id?: string;
  priority: string;
  assigned_to: string;
  created_by: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  outcome?: string;
  next_steps?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  source?: string;
  tags?: string[];
  notes?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesStage {
  id: string;
  name: string;
  description?: string;
  probability: number;
  sort_order: number;
  is_active: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id?: string;
  status: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  scheduled_at?: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CRMMetrics {
  totalLeads: number;
  totalDeals: number;
  totalActivities: number;
  conversionRate: number;
  avgDealSize: number;
  pipelineValue: number;
}

export interface SalesFunnelData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

// Email and Communication Types
export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  template_id?: string;
  campaign_id?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  due_date?: string;
  completed_at?: string;
  lead_id?: string;
  deal_id?: string;
  contact_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}