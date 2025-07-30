export interface WorkersCompCode {
  id: string;
  code: string;
  description: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
}

export interface JobDescription {
  id: string;
  job_title_id: string;
  description: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobTitle {
  id: string;
  title_name: string;
  wc_code_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  is_global: boolean;
  category?: string;
  is_available_for_clients: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  workers_comp_codes?: WorkersCompCode;
  company_settings?: CompanySettings;
  job_descriptions?: JobDescription[];
}

export interface CreateJobTitleRequest {
  title_name: string;
  wc_code_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  is_global?: boolean;
  category?: string;
  is_available_for_clients?: boolean;
  description?: string;
}

export interface UpdateJobTitleRequest {
  job_title_id: string;
  title_name?: string;
  wc_code_id?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  is_available_for_clients?: boolean;
  description?: string;
}

export interface GenerateJobDescriptionRequest {
  job_title: string;
  wc_code_description?: string;
  industry?: string;
  company_type?: string;
}

export const JOB_CATEGORIES = [
  'Administrative',
  'Construction',
  'Healthcare',
  'Information Technology',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Education',
  'Transportation',
  'Hospitality',
  'Finance',
  'Other'
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];