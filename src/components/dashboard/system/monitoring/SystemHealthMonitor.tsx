
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetric {
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
}

interface SystemMetrics {
  api_latency: SystemMetric;
  db_health: SystemMetric;
  error_rate: SystemMetric;
  queue_size: SystemMetric;
}

export const SystemHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemMetrics();
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('monitoring-service/system-metrics');
      
      if (error) throw error;
      setMetrics(data.metrics);
      setError(null);
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base">System Health Monitor</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <p className="text-sm text-destructive">Unable to load</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">System Health Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {metrics && Object.entries(metrics).map(([key, metric]) => (
              <div key={key} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-medium capitalize truncate block">
                    {key.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {metric.value}{metric.unit}
                  </p>
                </div>
                <Badge className={`${getStatusColor(metric.status)} text-xs flex-shrink-0 ml-2`}>
                  {metric.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
