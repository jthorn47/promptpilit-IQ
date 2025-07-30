import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  Clock, 
  DollarSign, 
  Zap, 
  Calendar, 
  FileText, 
  Activity,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Building2,
  UserPlus,
  Shield,
  AlertTriangle,
  FileWarning,
  GraduationCap,
  UserX,
  BookOpen,
  Trophy,
  Target
} from 'lucide-react';

// Import our new dashboard widgets
import {
  ActiveClientsWidget,
  EmployeeHeadcountWidget,
  NewHireTrackerWidget,
  SB553ComplianceWidget,
  TrainingExpirationsWidget,
  IncidentReportsWidget,
  LMSProgressWidget,
  UntrainedEmployeesWidget,
  CourseSuggestionsWidget,
  RetentionTrackerWidget,
  TopPerformingClientsWidget,
  TaskOverloadHeatmapWidget
} from './DashboardWidgets';

const iconMap = {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Zap,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  Building2,
  UserPlus,
  Shield,
  AlertTriangle,
  FileWarning,
  GraduationCap,
  UserX,
  BookOpen,
  Trophy,
  Target
};

interface QuickActionWidgetProps {
  title: string;
  description?: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  category: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QuickActionWidget: React.FC<QuickActionWidgetProps> = ({
  title,
  description,
  icon,
  href,
  onClick,
  badge,
  category,
  className,
  size = 'md'
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Activity;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'management': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'productivity': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'marketing': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'system': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      case 'clients': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      case 'hr': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'compliance': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'training': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'analytics': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Check if this is a functional dashboard widget
  const functionalWidgetNames = [
    'Analytics Dashboard', 'Team Overview', 'Task Manager', 'Financial Reports',
    'Campaign Management', 'Calendar & Meetings', 'Quick Notes', 'System Status',
    'Active Clients', 'Employee Headcount', 'New Hire Tracker',
    'SB 553 Compliance', 'Training Expirations', 'Incident Reports',
    'LMS Progress', 'Untrained Employees', 'Course Suggestions',
    'Retention Tracker', 'Top Performing Clients', 'Task Overload Heatmap'
  ];

  const renderFunctionalWidget = () => {
    const commonProps = {
      title,
      description,
      config: {} // Widget-specific config would go here
    };

    switch (title) {
      case 'Active Clients':
        return <ActiveClientsWidget {...commonProps} />;
      case 'Employee Headcount':
        return <EmployeeHeadcountWidget {...commonProps} />;
      case 'New Hire Tracker':
        return <NewHireTrackerWidget {...commonProps} />;
      case 'SB 553 Compliance':
        return <SB553ComplianceWidget {...commonProps} />;
      case 'Training Expirations':
        return <TrainingExpirationsWidget {...commonProps} />;
      case 'Incident Reports':
        return <IncidentReportsWidget {...commonProps} />;
      case 'LMS Progress':
        return <LMSProgressWidget {...commonProps} />;
      case 'Untrained Employees':
        return <UntrainedEmployeesWidget {...commonProps} />;
      case 'Course Suggestions':
        return <CourseSuggestionsWidget {...commonProps} />;
      case 'Retention Tracker':
        return <RetentionTrackerWidget {...commonProps} />;
      case 'Top Performing Clients':
        return <TopPerformingClientsWidget {...commonProps} />;
      case 'Task Overload Heatmap':
        return <TaskOverloadHeatmapWidget {...commonProps} />;
      default:
        return null;
    }
  };

  const isFunctionalWidget = functionalWidgetNames.includes(title);

  // Render the functional widget if it matches
  if (isFunctionalWidget) {
    const functionalWidget = renderFunctionalWidget();
    if (functionalWidget) {
      return functionalWidget;
    }
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        getCategoryColor(category),
        className
      )}
      onClick={handleClick}
    >
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg bg-white/50 border",
              getCategoryColor(category)
            )}>
              <IconComponent className={iconSizes[size]} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              {description && size !== 'sm' && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
            {href && (
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};