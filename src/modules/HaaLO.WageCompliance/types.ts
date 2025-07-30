/**
 * Type definitions for HaaLO.WageCompliance module
 */

export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'unknown';

export type JurisdictionType = 'federal' | 'state' | 'local';

export type EmployeeClassification = 'exempt' | 'non-exempt' | 'independent-contractor';

export type ViolationType = 
  | 'minimum-wage'
  | 'overtime'
  | 'meal-break'
  | 'rest-break'
  | 'classification'
  | 'record-keeping';

// Minimum Wage Tracking
export interface MinimumWageRate {
  id: string;
  jurisdiction: JurisdictionType;
  location: string;
  state?: string;
  city?: string;
  county?: string;
  rate: number;
  effectiveDate: Date;
  nextIncreaseDate?: Date;
  nextIncreaseRate?: number;
  tippedRate?: number;
  source: string;
  lastUpdated: Date;
}

export interface WageComplianceCheck {
  employeeId: string;
  employeeName: string;
  currentWage: number;
  minimumRequired: number;
  jurisdiction: string;
  status: ComplianceStatus;
  difference: number;
  lastChecked: Date;
}

// Overtime Rules
export interface OvertimeRule {
  id: string;
  jurisdiction: JurisdictionType;
  location: string;
  dailyThreshold?: number; // hours per day
  weeklyThreshold: number; // hours per week
  multiplier: number; // 1.5, 2.0, etc.
  exemptions: string[];
  effectiveDate: Date;
  description: string;
}

export interface OvertimeViolation {
  employeeId: string;
  employeeName: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  hoursWorked: number;
  overtimeHours: number;
  overtimePaid: number;
  overtimeOwed: number;
  status: ComplianceStatus;
  rule: OvertimeRule;
}

// Break & Meal Rules
export interface BreakRule {
  id: string;
  jurisdiction: JurisdictionType;
  location: string;
  type: 'meal' | 'rest';
  triggerHours: number; // minimum hours worked to trigger break
  duration: number; // break duration in minutes
  isPaid: boolean;
  frequency?: 'per-shift' | 'per-hours'; // how often required
  maxHoursWithoutBreak?: number;
  description: string;
}

export interface BreakViolation {
  employeeId: string;
  employeeName: string;
  shiftDate: Date;
  shiftStart: Date;
  shiftEnd: Date;
  hoursWorked: number;
  breaksRequired: number;
  breaksTaken: number;
  missedBreaks: number;
  violationType: 'missed-meal' | 'missed-rest' | 'short-break' | 'late-break';
  rule: BreakRule;
  status: ComplianceStatus;
}

// FLSA Classification
export interface FLSATest {
  id: string;
  testName: string;
  category: 'executive' | 'administrative' | 'professional' | 'computer' | 'outside-sales';
  questions: FLSAQuestion[];
  minimumSalary?: number;
  description: string;
}

export interface FLSAQuestion {
  id: string;
  question: string;
  type: 'yes-no' | 'multiple-choice' | 'numeric';
  options?: string[];
  weight: number;
  explanation: string;
}

export interface FLSAClassification {
  employeeId: string;
  employeeName: string;
  currentClassification: EmployeeClassification;
  recommendedClassification: EmployeeClassification;
  confidence: number; // 0-100
  testResults: FLSATestResult[];
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  lastUpdated: Date;
}

export interface FLSATestResult {
  testId: string;
  testName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, any>;
}

// Compliance Alerts
export interface ComplianceAlert {
  id: string;
  type: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEmployees: string[];
  jurisdiction: string;
  rule?: string;
  recommendedAction: string;
  legalGuidance?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
}

// Audit Reports
export interface ComplianceAuditReport {
  id: string;
  reportType: 'wage' | 'overtime' | 'breaks' | 'classification' | 'comprehensive';
  periodStart: Date;
  periodEnd: Date;
  totalEmployees: number;
  violationsFound: number;
  complianceScore: number; // 0-100
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
  status: 'draft' | 'final' | 'submitted';
}

export interface ComplianceFinding {
  type: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  description: string;
  affectedEmployees: string[];
  potentialPenalty?: number;
  recommendedFix: string;
}

// Service Interfaces
export interface WageComplianceService {
  checkMinimumWage(employeeId: string): Promise<WageComplianceCheck>;
  getMinimumWageRates(location: string): Promise<MinimumWageRate[]>;
  updateWageRates(): Promise<void>;
}

export interface OvertimeService {
  checkOvertimeCompliance(employeeId: string, payPeriod: { start: Date; end: Date }): Promise<OvertimeViolation[]>;
  getOvertimeRules(location: string): Promise<OvertimeRule[]>;
  calculateOwedOvertime(employeeId: string, period: { start: Date; end: Date }): Promise<number>;
}

export interface BreakComplianceService {
  checkBreakCompliance(employeeId: string, shiftDate: Date): Promise<BreakViolation[]>;
  getBreakRules(location: string): Promise<BreakRule[]>;
  auditBreakViolations(dateRange: { start: Date; end: Date }): Promise<BreakViolation[]>;
}

export interface FLSAService {
  classifyEmployee(employeeId: string): Promise<FLSAClassification>;
  getFLSATests(): Promise<FLSATest[]>;
  runClassificationTest(employeeId: string, testId: string, answers: Record<string, any>): Promise<FLSATestResult>;
}

export interface AlertService {
  getActiveAlerts(): Promise<ComplianceAlert[]>;
  createAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt'>): Promise<ComplianceAlert>;
  resolveAlert(alertId: string, resolution: string): Promise<void>;
  dismissAlert(alertId: string, reason: string): Promise<void>;
}

export interface AuditService {
  generateReport(params: {
    type: ComplianceAuditReport['reportType'];
    periodStart: Date;
    periodEnd: Date;
    employeeIds?: string[];
  }): Promise<ComplianceAuditReport>;
  getReports(): Promise<ComplianceAuditReport[]>;
  exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob>;
}

// Dashboard Data
export interface WageComplianceDashboardData {
  overallScore: number;
  totalViolations: number;
  activeAlerts: number;
  employeesAtRisk: number;
  recentFindings: ComplianceFinding[];
  complianceByType: Record<ViolationType, ComplianceStatus>;
  trendData: {
    date: Date;
    score: number;
    violations: number;
  }[];
}

export interface WageComplianceMetrics {
  minimumWageCompliance: number;
  overtimeCompliance: number;
  breakCompliance: number;
  classificationAccuracy: number;
  lastAuditDate?: Date;
  nextAuditDue?: Date;
}