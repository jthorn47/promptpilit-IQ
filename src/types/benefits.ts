// Global Benefits Administration Microservices Types

export type CarrierType = 'medical' | 'dental' | 'vision' | 'life' | 'disability' | 'hsa' | 'fsa' | 'other';
export type RatingMethod = 'composite' | 'age_banded' | 'custom';
export type MeasurementMethod = 'monthly' | 'lookback';
export type AuditAction = 'create' | 'update' | 'delete' | 'assign' | 'unassign';
export type AuditEntity = 'carrier' | 'plan_type' | 'plan_template' | 'eligibility_rule' | 'deduction_code' | 'document' | 'plan_assignment';

// Service 1: Carrier Service
export interface Carrier {
  id: string;
  name: string;
  type: CarrierType;
  contactInfo: {
    email?: string;
    phone?: string;
  };
  ediSettings: {
    format?: string;
    transmissionMethod?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarrierRequest {
  name: string;
  type: CarrierType;
  contactInfo: {
    email?: string;
    phone?: string;
  };
  ediSettings?: {
    format?: string;
    transmissionMethod?: string;
  };
}

// Service 2: Plan Type Service
export interface PlanType {
  id: string;
  category: string;
  subcategory: string;
  code: string;
  description?: string;
  createdAt: string;
}

// Service 3: Plan Template Service
export interface PlanTemplate {
  id: string;
  name: string;
  carrierId: string;
  planTypeCode: string;
  ratingMethod: RatingMethod;
  tierStructure: string[];
  eligibilityRuleId?: string;
  lockFields: string[];
  documents: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  carrier?: Carrier;
  planType?: PlanType;
  eligibilityRule?: EligibilityRule;
}

export interface CreatePlanTemplateRequest {
  name: string;
  carrierId: string;
  planTypeCode: string;
  ratingMethod: RatingMethod;
  tierStructure: string[];
  eligibilityRuleId?: string;
  lockFields?: string[];
  documents?: string[];
}

// Service 4: Eligibility Rule Service
export interface EligibilityRule {
  id: string;
  name: string;
  waitingPeriodDays: number;
  minHoursPerWeek: number;
  rehireResetPeriod: number;
  measurementMethod: MeasurementMethod;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEligibilityRuleRequest {
  name: string;
  waitingPeriodDays: number;
  minHoursPerWeek: number;
  rehireResetPeriod: number;
  measurementMethod: MeasurementMethod;
}

// Service 5: Deduction Code Service
export interface DeductionCode {
  id: string;
  code: string;
  description: string;
  preTax: boolean;
  glCode?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeductionCodeRequest {
  code: string;
  description: string;
  preTax: boolean;
  glCode?: string;
}

// Service 6: Document Service
export interface BenefitDocument {
  id: string;
  name: string;
  type: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBenefitDocumentRequest {
  name: string;
  type: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Service 7: Plan Assignment Service
export interface PlanAssignment {
  id: string;
  planId: string;
  clientId: string;
  effectiveDate: string;
  terminationDate?: string;
  lockedFields: string[];
  customSettings: Record<string, any>;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  plan?: PlanTemplate;
}

export interface CreatePlanAssignmentRequest {
  planId: string;
  clientId: string;
  effectiveDate: string;
  terminationDate?: string;
  lockedFields?: string[];
  customSettings?: Record<string, any>;
}

export interface AssignPlanToClientRequest {
  planId: string;
  clientId: string;
  effectiveDate: string;
  lockedFields: string[];
}

// Service 8: Audit Log Service
export interface BenefitsAuditLog {
  id: string;
  entityType: AuditEntity;
  entityId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Service Configuration
export interface BenefitsServiceConfig {
  baseUrl: string;
  apiKey?: string;
  tenant: string;
  version: string;
}

// Query Parameters
export interface BenefitsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CarrierType;
  status?: string;
  clientId?: string;
  carrierId?: string;
}