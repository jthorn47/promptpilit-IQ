import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Shield, 
  AlertTriangle, 
  FileWarning,
  GraduationCap,
  UserX,
  BookOpen,
  TrendingUp,
  Trophy,
  Target
} from 'lucide-react';

interface WidgetProps {
  title: string;
  description: string;
  config?: any;
}

// CLIENTS & HR WIDGETS
export const ActiveClientsWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  // Mock data - replace with real API calls
  const clientData = {
    total: 24,
    tiers: {
      enterprise: 8,
      professional: 12,
      basic: 4
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-primary">{clientData.total}</div>
          {config?.show_tiers && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enterprise</span>
                <Badge variant="secondary">{clientData.tiers.enterprise}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Professional</span>
                <Badge variant="outline">{clientData.tiers.professional}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Basic</span>
                <Badge variant="outline">{clientData.tiers.basic}</Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeeHeadcountWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const headcountData = {
    total: 342,
    departments: {
      hr: 28,
      finance: 45,
      operations: 156,
      sales: 67,
      it: 46
    },
    trend: '+12 this month'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{headcountData.total}</div>
            {config?.show_trends && (
              <div className="text-sm text-green-600">{headcountData.trend}</div>
            )}
          </div>
          {config?.show_departments && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(headcountData.departments).map(([dept, count]) => (
                <div key={dept} className="flex justify-between">
                  <span className="capitalize">{dept}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const NewHireTrackerWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const newHires = [
    { name: 'Sarah Johnson', department: 'HR', hired: '2024-01-15', status: 'in_progress' },
    { name: 'Mike Chen', department: 'IT', hired: '2024-01-10', status: 'completed' },
    { name: 'Emma Davis', department: 'Sales', hired: '2024-01-08', status: 'pending' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{newHires.length} New Hires</div>
          <div className="space-y-2">
            {newHires.map((hire, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <div className="font-medium text-sm">{hire.name}</div>
                  <div className="text-xs text-muted-foreground">{hire.department}</div>
                </div>
                {config?.show_onboarding_status && (
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(hire.status)}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// COMPLIANCE & RISK WIDGETS
export const SB553ComplianceWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const complianceData = {
    submitted: 18,
    total: 24,
    overdue: 3
  };

  const percentage = Math.round((complianceData.submitted / complianceData.total) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="text-sm text-muted-foreground">
              {complianceData.submitted}/{complianceData.total} submitted
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
          {config?.alert_overdue && complianceData.overdue > 0 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {complianceData.overdue} overdue submissions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TrainingExpirationsWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const expirationData = {
    expiring_soon: 15,
    critical: 3,
    departments: ['Safety', 'Harassment Prevention', 'Data Security']
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-orange-600">{expirationData.expiring_soon}</div>
              <div className="text-xs text-muted-foreground">Expiring Soon</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{expirationData.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
          <div className="space-y-1">
            {expirationData.departments.map((dept, idx) => (
              <div key={idx} className="text-sm text-muted-foreground">• {dept}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const IncidentReportsWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const incidentData = {
    total: 12,
    status: {
      open: 5,
      investigating: 4,
      resolved: 3
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileWarning className="h-5 w-5 text-red-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{incidentData.total} This Month</div>
          {config?.show_status_breakdown && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-red-600">{incidentData.status.open}</div>
                <div className="text-xs">Open</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{incidentData.status.investigating}</div>
                <div className="text-xs">Investigating</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{incidentData.status.resolved}</div>
                <div className="text-xs">Resolved</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// TRAINING & LMS WIDGETS
export const LMSProgressWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const progressData = {
    overall: 78,
    departments: [
      { name: 'HR', progress: 92 },
      { name: 'Sales', progress: 85 },
      { name: 'IT', progress: 67 },
      { name: 'Operations', progress: 74 }
    ]
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{progressData.overall}%</div>
            <div className="text-sm text-muted-foreground">Overall</div>
          </div>
          {config?.show_by_department && (
            <div className="space-y-2">
              {progressData.departments.map((dept, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{dept.name}</span>
                    <span>{dept.progress}%</span>
                  </div>
                  {config?.show_progress_bars && (
                    <Progress value={dept.progress} className="h-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const UntrainedEmployeesWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const untrainedData = {
    total: 23,
    critical: 8,
    by_department: {
      'New Hires': 12,
      'Sales': 6,
      'Operations': 5
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserX className="h-5 w-5 text-red-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-red-600">{untrainedData.total}</div>
              <div className="text-xs text-muted-foreground">Total Untrained</div>
            </div>
            {config?.show_critical_training && (
              <div>
                <div className="text-2xl font-bold text-orange-600">{untrainedData.critical}</div>
                <div className="text-xs text-muted-foreground">Critical Training</div>
              </div>
            )}
          </div>
          {config?.group_by_department && (
            <div className="space-y-1">
              {Object.entries(untrainedData.by_department).map(([dept, count]) => (
                <div key={dept} className="flex justify-between text-sm">
                  <span>{dept}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const CourseSuggestionsWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const suggestions = [
    'Advanced Excel for HR Professionals',
    'Conflict Resolution in the Workplace',
    'Data Privacy and GDPR Compliance',
    'Leadership Development Fundamentals'
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.slice(0, config?.max_suggestions || 5).map((course, idx) => (
            <div key={idx} className="p-2 bg-muted/50 rounded text-sm hover:bg-muted cursor-pointer">
              {course}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// BUSINESS INSIGHTS WIDGETS
export const RetentionTrackerWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const retentionData = {
    client_retention: 94,
    employee_retention: 88,
    trend: '+2.1%'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {config?.track_clients && (
              <div>
                <div className="text-2xl font-bold text-green-600">{retentionData.client_retention}%</div>
                <div className="text-xs text-muted-foreground">Client Retention</div>
              </div>
            )}
            {config?.track_employees && (
              <div>
                <div className="text-2xl font-bold text-blue-600">{retentionData.employee_retention}%</div>
                <div className="text-xs text-muted-foreground">Employee Retention</div>
              </div>
            )}
          </div>
          <div className="text-sm text-green-600">{retentionData.trend} vs last quarter</div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TopPerformingClientsWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const topClients = [
    { name: 'TechCorp Solutions', metric: '$125K', rank: 1 },
    { name: 'Global Industries', metric: '$98K', rank: 2 },
    { name: 'Metro Services', metric: '$87K', rank: 3 },
    { name: 'Alpha Dynamics', metric: '$76K', rank: 4 }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topClients.slice(0, config?.top_count || 5).map((client, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {client.rank}
                </div>
                <div className="text-sm font-medium">{client.name}</div>
              </div>
              {config?.show_metrics && (
                <div className="text-sm font-bold text-green-600">{client.metric}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const TaskOverloadHeatmapWidget: React.FC<WidgetProps> = ({ title, description, config }) => {
  const overloadData = [
    { name: 'Sarah M.', tasks: 28, level: 'high' },
    { name: 'Operations Team', tasks: 24, level: 'medium' },
    { name: 'Mike R.', tasks: 22, level: 'medium' },
    { name: 'HR Dept', tasks: 19, level: 'normal' }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-red-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {overloadData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                {config?.color_coding && (
                  <div className={`w-3 h-3 rounded-full ${getLevelColor(item.level)}`} />
                )}
                <div className="text-sm font-medium">{item.name}</div>
              </div>
              <div className="text-sm font-bold">{item.tasks} tasks</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};