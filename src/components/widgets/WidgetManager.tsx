import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WidgetDisplay } from './WidgetDisplay';
import { WidgetSelector } from './WidgetSelector';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { useWidgetService } from '@/hooks/useWidgetService';
import { WidgetDefinition } from '@/services/WidgetService';

interface WidgetManagerProps {
  className?: string;
  title?: string;
  showHeader?: boolean;
  maxWidgets?: number;
}

export const WidgetManager: React.FC<WidgetManagerProps> = ({
  className,
  title = "Quick Actions",
  showHeader = true,
  maxWidgets = 6
}) => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    addWidget,
    getAvailableToAdd,
    getEnabledWidgets,
    refresh
  } = useWidgetService();

  const enabledWidgets = getEnabledWidgets();
  const availableToAdd = getAvailableToAdd();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'clients': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      case 'hr': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'compliance': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'training': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'analytics': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
      case 'productivity': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'marketing': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'system': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handleAddWidget = async (widget: WidgetDefinition) => {
    await addWidget(widget.id);
  };

  const handleWidgetClick = (componentName: string) => {
    const getWidgetHref = (componentName: string) => {
      const routeMap: Record<string, string> = {
        'AnalyticsWidget': '/analytics',
        'TeamWidget': '/team',
        'TaskWidget': '/tasks',
        'FinanceWidget': '/finance',
        'CampaignWidget': '/campaigns',
        'CalendarWidget': '/calendar',
        'NotesWidget': '/tasks',
        'StatusWidget': '/launchpad/system',
        'ActiveClientsWidget': '/clients',
        'EmployeeHeadcountWidget': '/hr/employees',
        'NewHireTrackerWidget': '/hr/onboarding',
        'SB553ComplianceWidget': '/compliance/sb553',
        'TrainingExpirationsWidget': '/compliance/training',
        'IncidentReportsWidget': '/pulse',
        'LMSProgressWidget': '/learning/progress',
        'UntrainedEmployeesWidget': '/learning/assignments',
        'CourseSuggestionsWidget': '/learning/catalog',
        'RetentionTrackerWidget': '/analytics/retention',
        'TopPerformingClientsWidget': '/analytics/clients',
        'TaskOverloadHeatmapWidget': '/analytics/workload'
      };
      return routeMap[componentName] || '#';
    };
    
    const route = getWidgetHref(componentName);
    if (route !== '#') {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading widgets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading widgets: {error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <WidgetErrorBoundary>
      <div className={className}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {enabledWidgets.length} of {maxWidgets}
              </Badge>
              
              <WidgetSelector
                availableWidgets={availableToAdd}
                enabledCount={enabledWidgets.length}
                maxWidgets={maxWidgets}
                onAddWidget={handleAddWidget}
                getCategoryColor={getCategoryColor}
              />
            </div>
          </div>
        )}

        <WidgetDisplay
          enabledWidgets={enabledWidgets}
          onWidgetClick={handleWidgetClick}
          getCategoryColor={getCategoryColor}
        />
      </div>
    </WidgetErrorBoundary>
  );
};