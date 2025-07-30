/**
 * Tax Filing Engine Type Definitions
 * @module HaaLO.TaxFilingEngine.Types
 */

// Tax Profile Types
export interface TaxProfile {
  id: string;
  companyId: string;
  fein: string;
  stateTaxIds: Record<string, string>;
  localJurisdictions: TaxJurisdiction[];
  futaNumber?: string;
  sutaNumbers: Record<string, string>;
  federalDepositFrequency: 'monthly' | 'semi-weekly' | 'quarterly';
  stateDepositFrequencies: Record<string, string>;
  efilingEnabled: boolean;
  efilingProvider?: string;
  efilingConfig: Record<string, any>;
  isActive: boolean;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TaxJurisdiction {
  code: string;
  name: string;
  type: 'state' | 'county' | 'city';
  taxId?: string;
  rate?: number;
  filingFrequency: string;
}

// Tax Calendar Types
export interface TaxCalendarEntry {
  id: string;
  companyId: string;
  filingType: string;
  agency: string;
  jurisdiction: 'federal' | 'state' | 'local';
  taxYear: number;
  taxQuarter?: number;
  taxMonth?: number;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  extendedDueDate?: string;
  status: 'not_started' | 'in_progress' | 'filed' | 'overdue' | 'amended';
  filedDate?: string;
  confirmationNumber?: string;
  alertDaysBefore: number;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Tax Liability Types
export interface TaxLiability {
  id: string;
  companyId: string;
  payrollRunId?: string;
  taxYear: number;
  taxQuarter?: number;
  taxMonth?: number;
  periodStartDate: string;
  periodEndDate: string;
  liabilityType: string;
  agency: string;
  jurisdiction: string;
  employeeTaxAmount: number;
  employerTaxAmount: number;
  totalLiability: number;
  taxableWages: number;
  taxRate: number;
  status: 'calculated' | 'filed' | 'paid' | 'adjusted';
  createdAt: string;
  updatedAt: string;
}

// Tax Filing Types
export interface TaxFiling {
  id: string;
  companyId: string;
  calendarEntryId?: string;
  filingType: string;
  agency: string;
  jurisdiction: string;
  taxYear: number;
  taxQuarter?: number;
  periodStartDate: string;
  periodEndDate: string;
  filingData: Record<string, any>;
  calculatedLiability: number;
  totalTaxDue: number;
  status: 'draft' | 'ready' | 'submitted' | 'accepted' | 'rejected' | 'amended';
  submittedAt?: string;
  submittedBy?: string;
  efilingTransactionId?: string;
  efilingConfirmation?: string;
  efilingStatus?: string;
  efilingResponse?: Record<string, any>;
  filingDocumentUrl?: string;
  confirmationDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Tax Payment Types
export interface TaxPayment {
  id: string;
  companyId: string;
  filingId?: string;
  paymentType: string;
  agency: string;
  jurisdiction: string;
  paymentAmount: number;
  paymentMethod: 'ach' | 'wire' | 'check' | 'online';
  dueDate: string;
  scheduledDate?: string;
  paymentDate?: string;
  status: 'scheduled' | 'pending' | 'completed' | 'failed' | 'cancelled';
  bankAccountId?: string;
  confirmationNumber?: string;
  traceNumber?: string;
  paymentResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Tax Notice Types
export interface TaxNotice {
  id: string;
  companyId: string;
  filingId?: string;
  noticeType: 'audit' | 'penalty' | 'adjustment' | 'inquiry' | 'refund';
  agency: string;
  jurisdiction: string;
  noticeNumber?: string;
  noticeDate: string;
  responseDueDate?: string;
  subject: string;
  description?: string;
  noticeDocumentUrl?: string;
  penaltyAmount: number;
  interestAmount: number;
  adjustmentAmount: number;
  status: 'received' | 'under_review' | 'responded' | 'resolved' | 'escalated';
  resolutionNotes?: string;
  resolutionDate?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Tax Archive Types
export interface TaxArchive {
  id: string;
  companyId: string;
  filingId?: string;
  filingType: string;
  taxYear: number;
  agency: string;
  documentType: 'filing' | 'confirmation' | 'correspondence';
  documentName: string;
  documentUrl: string;
  documentSizeBytes?: number;
  archivedDate: string;
  archivedBy?: string;
  retentionUntil?: string;
  createdAt: string;
}

// Tax Compliance Audit Types
export interface TaxComplianceAudit {
  id: string;
  companyId: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  actionDetails: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  performedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Form Data Types
export interface Form941Data {
  quarter: number;
  year: number;
  employeeCount: number;
  totalWages: number;
  federalIncomeTax: number;
  socialSecurityWages: number;
  socialSecurityTax: number;
  medicareWages: number;
  medicareTax: number;
  totalTaxDue: number;
  totalDeposits: number;
  balanceDue: number;
  overpayment: number;
}

export interface Form940Data {
  year: number;
  stateTaxPaid: number;
  totalFutaWages: number;
  futaTaxDue: number;
  totalDeposits: number;
  balanceDue: number;
  overpayment: number;
}

// API Response Types
export interface TaxFilingResponse {
  success: boolean;
  transactionId?: string;
  confirmationNumber?: string;
  status: string;
  errors?: string[];
  warnings?: string[];
  acknowledgedAt?: string;
}

export interface TaxPaymentResponse {
  success: boolean;
  confirmationNumber?: string;
  traceNumber?: string;
  status: string;
  processedAt?: string;
  errors?: string[];
}

// Hook Return Types
export interface UseTaxProfileReturn {
  profile: TaxProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<TaxProfile>) => Promise<void>;
  createProfile: (data: Omit<TaxProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export interface UseTaxFilingsReturn {
  filings: TaxFiling[];
  loading: boolean;
  error: string | null;
  createFiling: (data: Omit<TaxFiling, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFiling: (id: string, data: Partial<TaxFiling>) => Promise<void>;
  submitFiling: (id: string) => Promise<TaxFilingResponse>;
  deleteFiling: (id: string) => Promise<void>;
}

export interface UseTaxPaymentsReturn {
  payments: TaxPayment[];
  loading: boolean;
  error: string | null;
  createPayment: (data: Omit<TaxPayment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePayment: (id: string, data: Partial<TaxPayment>) => Promise<void>;
  processPayment: (id: string) => Promise<TaxPaymentResponse>;
  cancelPayment: (id: string) => Promise<void>;
}

export interface UseTaxNoticesReturn {
  notices: TaxNotice[];
  loading: boolean;
  error: string | null;
  createNotice: (data: Omit<TaxNotice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNotice: (id: string, data: Partial<TaxNotice>) => Promise<void>;
  resolveNotice: (id: string, resolutionNotes: string) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}