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

export interface CRMMetrics {
  totalLeads: number;
  totalDeals: number;
  totalActivities: number;
  conversionRate: number;
  avgDealSize: number;
  pipelineValue: number;
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