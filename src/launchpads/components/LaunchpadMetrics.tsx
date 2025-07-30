
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricData {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  description?: string;
}

interface LaunchpadMetricsProps {
  metrics: MetricData[];
}

export const LaunchpadMetrics: React.FC<LaunchpadMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.trend && (
              <p className={`text-xs flex items-center gap-1 ${
                metric.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend.direction === 'up' ? '↗' : '↘'} {metric.trend.percentage}%
              </p>
            )}
            {metric.description && (
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
