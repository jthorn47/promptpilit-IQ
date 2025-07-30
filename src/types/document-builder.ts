export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  compliance_framework: string[];
  legal_disclaimer?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  document_type_id: string;
  name: string;
  description?: string;
  template_data: any;
  is_public: boolean;
  is_default: boolean;
  created_by?: string;
  company_id?: string;
  version: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  document_type_id: string;
  template_id?: string;
  title: string;
  content: any;
  dynamic_fields: Record<string, any>;
  status: 'draft' | 'review' | 'published' | 'archived';
  version: string;
  is_locked: boolean;
  metadata: any;
  created_by: string;
  last_modified_by?: string;
  published_at?: string;
  published_by?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentSection {
  id: string;
  document_id: string;
  section_title: string;
  section_content: any;
  section_order: number;
  is_required: boolean;
  is_collapsed: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'company_data';
  default_value?: string;
  validation_rules: any;
  is_required: boolean;
  source_table?: string;
  source_column?: string;
  description?: string;
  created_at: string;
}

export interface LegalClause {
  id: string;
  title: string;
  content: string;
  clause_type: string;
  applicable_documents: string[];
  jurisdiction: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  section_id?: string;
  user_id: string;
  comment_text: string;
  comment_type: 'comment' | 'suggestion' | 'approval' | 'rejection';
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentApproval {
  id: string;
  document_id: string;
  approver_id: string;
  approval_type: 'review' | 'approval' | 'signature';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  digital_signature?: string;
  signed_at?: string;
  created_at: string;
}

export interface EditorContent {
  type: 'text' | 'heading' | 'list' | 'table' | 'image' | 'dynamic_field' | 'legal_clause' | 'page_break';
  content: any;
  id: string;
  order: number;
}

export interface SectionTemplate {
  title: string;
  content: EditorContent[];
  is_required: boolean;
  category: string;
}

// New interfaces for IIPP & Employee Handbook Builder
export interface Jurisdiction {
  id: string;
  name: string;
  type: 'state' | 'county' | 'city';
  parent_jurisdiction_id?: string;
  abbreviation?: string;
  fips_code?: string;
  regulations_last_updated: string;
  contact_info: any;
  created_at: string;
  updated_at: string;
}

export interface RegulationRule {
  id: string;
  jurisdiction_id: string;
  document_category: string;
  rule_type: string;
  title: string;
  content: string;
  effective_date?: string;
  expiration_date?: string;
  compliance_requirements: any;
  tags: string[];
  source_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  document_section_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  correct_answer: any;
  answer_options: any[];
  points: number;
  explanation?: string;
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceForm {
  id: string;
  document_section_id: string;
  form_name: string;
  form_type: 'checklist' | 'inspection' | 'incident_report' | 'training_record';
  form_fields: any[];
  submission_required: boolean;
  retention_period_days?: number;
  created_at: string;
  updated_at: string;
}

export interface HandbookBuilderConfig {
  selectedJurisdictions: Jurisdiction[];
  documentCategory: 'iipp' | 'state' | 'handbook';
  companyInfo: {
    name: string;
    state: string;
    county?: string;
    septic_permit_number?: string;
    osha_establishment_id?: string;
  };
  includeQuizzes: boolean;
  includeForms: boolean;
  language: 'en' | 'es' | 'bilingual';
}