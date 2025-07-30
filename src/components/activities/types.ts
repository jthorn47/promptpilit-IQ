export interface Activity {
  id: string;
  subject: string;
  type: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_id?: string;
  client_type?: string;
  created_at: string;
  created_by: string;
  assigned_to: string;
  status: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  outcome?: string;
  next_steps?: string;
  priority: string;
  company_id: string;
}

export interface ActivityFilter {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  types: string[];
  userId: string;
  clientType: string;
}