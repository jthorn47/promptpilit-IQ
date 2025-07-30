export interface PayrollAssistantQuery {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  context: 'payroll' | 'taxes' | 'compliance' | 'general';
  confidence: number;
}

export interface RetroPayRequest {
  id: string;
  employeeIds: string[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
  reason: 'bonus' | 'missed_hours' | 'correction' | 'overtime_adjustment' | 'other';
  reasonDetails: string;
  adjustments: PayrollAdjustment[];
  status: 'draft' | 'pending_approval' | 'approved' | 'processed' | 'rejected';
  taxImpact: TaxImpactCalculation;
  createdBy: string;
  approvedBy?: string;
  processedAt?: Date;
}

export interface PayrollAdjustment {
  employeeId: string;
  payTypeId: string;
  hours?: number;
  amount: number;
  description: string;
}

export interface TaxImpactCalculation {
  federalTaxDelta: number;
  stateTaxDelta: number;
  localTaxDelta: number;
  ficaDelta: number;
  medicaireDelta: number;
  totalImpact: number;
}

export interface PayCalendar {
  id: string;
  name: string;
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
  startDate: Date;
  payDates: Date[];
  cutoffDays: number;
  holidays: HolidayRule[];
  stateRules: StatePayrollRule[];
}

export interface HolidayRule {
  name: string;
  date: Date;
  affectsPay: boolean;
  affectsProcessing: boolean;
  states: string[];
}

export interface StatePayrollRule {
  state: string;
  minimumFrequency: string;
  finalPayRequirements: number; // days
  overtimeThreshold: number;
  specialRules: string[];
}

export interface PayrollAuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  entityType: 'employee' | 'payroll_run' | 'pay_type' | 'tax_setting';
  entityId: string;
  changes: PayrollChangeRecord[];
  ipAddress: string;
  userAgent: string;
}

export interface PayrollChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  dollarImpact?: number;
}

export interface MultiStateTaxConfig {
  employeeId: string;
  workStates: StateWorkLocation[];
  residenceState: string;
  reciprocityAgreements: string[];
  apportionmentMethod: 'convenience' | 'actual_work_days' | 'payroll_period';
}

export interface StateWorkLocation {
  state: string;
  percentage: number;
  address: string;
  startDate: Date;
  endDate?: Date;
}

export interface InternationalPayrollConfig {
  employeeId: string;
  payrollCountry: string;
  taxTreaty?: string;
  exemptions: TaxExemption[];
  currency: string;
  exchangeRateSource: string;
  complianceRequirements: string[];
}

export interface TaxExemption {
  type: 'treaty' | 'totalization' | 'foreign_earned_income';
  amount?: number;
  percentage?: number;
  validFrom: Date;
  validTo?: Date;
  documentation: string[];
}