import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, FileText, Users, Target } from 'lucide-react';
import { PulseMetrics } from '@/services/PulseAnalyticsService';

interface PulseReportMetricsProps {
  metrics: PulseMetrics;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-border bg-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{trend.value}%</span>
                  {trend.label && <span className="text-muted-foreground">vs {trend.label}</span>}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${getIconColor()}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export const PulseReportMetrics: React.FC<PulseReportMetricsProps> = ({ metrics }) => {
  const getComplianceVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getTaskCompletionVariant = (completed: number, total: number): 'success' | 'warning' | 'danger' => {
    const rate = total > 0 ? (completed / total) * 100 : 0;
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'danger';
  };

  const getResolutionTimeVariant = (time: number): 'success' | 'warning' | 'danger' => {
    if (time <= 5) return 'success';
    if (time <= 10) return 'warning';
    return 'danger';
  };

  const getOverdueTasksVariant = (overdueTasks: number): 'success' | 'warning' | 'danger' => {
    if (overdueTasks === 0) return 'success';
    if (overdueTasks <= 3) return 'warning';
    return 'danger';
  };

  const getBillableRateVariant = (rate: number): 'success' | 'warning' | 'danger' => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  };

  const getBillableRateDirection = (rate: number): 'up' | 'down' => {
    return rate >= 80 ? 'up' : 'down';
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatDays = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    return `${days.toFixed(1)} days`;
  };

  const calculateBillableRate = () => {
    return metrics.totalHours > 0 
      ? Math.round((metrics.billableHours / metrics.totalHours) * 100)
      : 0;
  };

  const metricCards = [
    {
      title: 'Total Cases',
      value: metrics.totalCases,
      icon: FileText,
      description: `${metrics.openCases} open, ${metrics.inProgressCases} in progress`,
      variant: 'default' as const
    },
    {
      title: 'Cases Closed',
      value: metrics.closedCases,
      icon: CheckCircle,
      trend: {
        direction: 'up' as const,
        value: 12, // Would calculate from historical data
        label: 'last month'
      },
      variant: 'success' as const
    },
    {
      title: 'Avg Resolution Time',
      value: formatDays(metrics.avgResolutionTime),
      icon: Clock,
      trend: {
        direction: 'down' as const,
        value: 8, // Would calculate from historical data
        label: 'last month'
      },
      variant: getResolutionTimeVariant(metrics.avgResolutionTime)
    },
    {
      title: 'Task Completion',
      value: `${metrics.completedTasks}/${metrics.totalTasks}`,
      icon: Target,
      description: `${Math.round((metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100)}% completion rate`,
      variant: getTaskCompletionVariant(metrics.completedTasks, metrics.totalTasks)
    },
    {
      title: 'Overdue Tasks',
      value: metrics.overdueTasks,
      icon: AlertCircle,
      description: metrics.overdueTasks > 0 ? 'Requires attention' : 'All tasks on track',
      variant: getOverdueTasksVariant(metrics.overdueTasks)
    },
    {
      title: 'Total Hours',
      value: formatHours(metrics.totalHours),
      icon: Users,
      description: `${formatHours(metrics.billableHours)} billable (${calculateBillableRate()}%)`,
      variant: 'default' as const
    },
    {
      title: 'Billable Hours',
      value: formatHours(metrics.billableHours),
      icon: TrendingUp,
      trend: {
        direction: getBillableRateDirection(calculateBillableRate()),
        value: calculateBillableRate(),
        label: 'utilization'
      },
      variant: getBillableRateVariant(calculateBillableRate())
    },
    {
      title: 'Compliance Score',
      value: `${metrics.complianceScore}%`,
      icon: CheckCircle,
      trend: {
        direction: 'up' as const,
        value: 5, // Would calculate from historical data
        label: 'last quarter'
      },
      variant: getComplianceVariant(metrics.complianceScore)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Key Metrics</h2>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            description={metric.description}
            variant={metric.variant}
          />
        ))}
      </div>
    </div>
  );
};