// ATS Domain Types

export type JobVisibilityType = 'public' | 'internal' | 'invite_only';
export type JobBoardType = 'internal_hr' | 'both';
export type ApplicationStage = 'applied' | 'screening' | 'phone_screen' | 'interview' | 'reference_check' | 'background_check' | 'offer' | 'hired' | 'rejected';

export interface ATSJobPosting {
  id: string;
  company_id: string;
  position_id?: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location?: string;
  department?: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  visibility: JobVisibilityType;
  board_type: JobBoardType;
  post_to_internal: boolean;
  post_to_career_page: boolean;
  expires_at?: string;
  hiring_manager_id?: string;
  status: string;
  metadata: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ATSApplication {
  id: string;
  job_posting_id: string;
  candidate_id?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  cover_letter?: string;
  application_source: string;
  current_stage: ApplicationStage;
  score: number;
  notes?: string;
  application_data: any;
  applied_at: string;
  updated_at: string;
}

export interface ATSApplicationActivity {
  id: string;
  application_id: string;
  user_id?: string;
  activity_type: string;
  description: string;
  old_stage?: ApplicationStage;
  new_stage?: ApplicationStage;
  metadata: any;
  created_at: string;
}

export interface ATSInterview {
  id: string;
  application_id: string;
  interviewer_id?: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
  status: string;
  feedback: any;
  created_at: string;
  updated_at: string;
}

export interface ATSEvaluation {
  id: string;
  application_id: string;
  evaluator_id?: string;
  interview_id?: string;
  scores: any;
  overall_rating: number;
  recommendation: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface ATSCareerPageSettings {
  id: string;
  company_id: string;
  page_title: string;
  page_description?: string;
  header_image_url?: string;
  theme_config: any;
  custom_css?: string;
  contact_email?: string;
  application_instructions?: string;
  is_active: boolean;
  embed_code?: string;
  created_at: string;
  updated_at: string;
}

export interface ATSApplicationForm {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  form_fields: any;
  is_default: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Candidate interface
export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience_level: string;
  availability: string;
  status: string;
  resume_url?: string;
  notes?: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  company_logo_url?: string;
  primary_color?: string;
  industry?: string;
  website?: string;
  description?: string;
}