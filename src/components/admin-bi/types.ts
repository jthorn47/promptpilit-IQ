export interface BIMetrics {
  totalEmployees: number;
  totalAssignments: number;
  totalCompletions: number;
  complianceRate: number;
  averageCompletionTime: number;
  certificatesIssued: number;
}

export interface DepartmentData {
  department: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface ComplianceData {
  name: string;
  value: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  completions: number;
  assignments: number;
}

export interface EmployeePerformance {
  name: string;
  completed: number;
  inProgress: number;
  score: number;
  efficiency: number;
}

export interface TrainingModuleStats {
  module: string;
  popularity: number;
  avgScore: number;
  completionRate: number;
  difficulty: number;
}

export interface TimeDistribution {
  hour: string;
  completions: number;
  engagement: number;
}

export interface SkillGapAnalysis {
  skill: string;
  required: number;
  current: number;
  gap: number;
}

export interface AtRiskEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  overdueTrainings: number;
  lastActivity: string;
}

export const COLORS = ['#655DC6', '#10B981', '#F59E0B', '#EF4444'];