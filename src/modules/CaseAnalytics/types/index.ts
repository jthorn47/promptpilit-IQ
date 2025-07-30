// Case Analytics Domain Types
export interface CaseMetrics {
  totalCases: number;
  openCases: number;
  inProgressCases: number;
  closedCases: number;
  averageResolutionTime: number; // in milliseconds
  totalHours: number;
  totalLaborCost: number;
}

export interface CaseTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface CaseStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface CasePriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface DailyCaseMetrics {
  date: string;
  casesCreated: number;
  casesResolved: number;
  hoursLogged: number;
}

export interface AssigneeMetrics {
  assigneeId: string;
  assigneeName?: string;
  casesAssigned: number;
  casesCompleted: number;
  averageResolutionTime: number;
  totalHours: number;
  completionRate: number;
}

export interface CaseAnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  companyId?: string;
  assigneeId?: string;
  caseType?: string;
  priority?: string;
}

export interface CaseAnalyticsDashboard {
  metrics: CaseMetrics;
  typeDistribution: CaseTypeDistribution[];
  statusDistribution: CaseStatusDistribution[];
  priorityDistribution: CasePriorityDistribution[];
  dailyMetrics: DailyCaseMetrics[];
  assigneeMetrics: AssigneeMetrics[];
  trends: {
    caseVolumeChange: number; // percentage change
    resolutionTimeChange: number; // percentage change
    hoursChange: number; // percentage change
  };
}

export interface KPITarget {
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}