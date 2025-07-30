import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface RetainerUsageWidgetProps {
  hoursUsed: number;
  totalHours: number;
  rolloverHours?: number;
  overageHours?: number;
  tierName?: string;
  status?: 'ok' | 'warning' | 'critical';
  className?: string;
}

export const RetainerUsageWidget: React.FC<RetainerUsageWidgetProps> = ({
  hoursUsed,
  totalHours,
  rolloverHours = 0,
  overageHours = 0,
  tierName = 'Standard',
  status = 'ok',
  className = ''
}) => {
  const percentage = totalHours > 0 ? (hoursUsed / totalHours) * 100 : 0;
  const remainingHours = Math.max(0, totalHours - hoursUsed);
  const effectiveTotal = totalHours + rolloverHours;
  const effectiveUsed = hoursUsed;
  const effectivePercentage = effectiveTotal > 0 ? (effectiveUsed / effectiveTotal) * 100 : 0;

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          {tierName} Retainer Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Usage Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Hours Used This Month</p>
            <p className="text-2xl font-bold">
              {hoursUsed.toFixed(1)} / {totalHours}
            </p>
          </div>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {percentage.toFixed(1)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
          {percentage > 100 && (
            <div className="text-xs text-destructive">
              Overage: {overageHours.toFixed(1)} hours
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-medium">{remainingHours.toFixed(1)}h</p>
          </div>
          
          {rolloverHours > 0 && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Rollover Bank</p>
              <p className="font-medium">{rolloverHours.toFixed(1)}h</p>
            </div>
          )}
          
          {overageHours > 0 && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Overage</p>
              <p className="font-medium text-destructive">{overageHours.toFixed(1)}h</p>
            </div>
          )}
        </div>

        {/* Rollover Calculation */}
        {rolloverHours > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Effective Total (w/ Rollover)</span>
              <span className="font-medium">{effectiveTotal}h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Effective Usage</span>
              <span className="font-medium">{effectivePercentage.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'critical' && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              Retainer Limit Exceeded
            </p>
            <p className="text-xs text-destructive/80">
              Additional charges will apply for overage hours
            </p>
          </div>
        )}

        {status === 'warning' && (
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-800">
              Approaching Retainer Limit
            </p>
            <p className="text-xs text-orange-600">
              Consider discussing additional hours or priority adjustments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};