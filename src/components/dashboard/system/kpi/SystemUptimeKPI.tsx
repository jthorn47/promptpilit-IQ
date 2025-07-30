
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Server, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UptimeData {
  uptime: number;
  trend: 'up' | 'down';
  period: string;
}

export const SystemUptimeKPI: React.FC = () => {
  const [data, setData] = useState<UptimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUptime();
  }, []);

  const fetchUptime = async () => {
    try {
      setLoading(true);
      const { data: response, error } = await supabase.functions.invoke('monitoring-service/uptime');
      
      if (error) throw error;
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching uptime:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
            <Server className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              System Uptime (30 Days)
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {loading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
                ) : error ? (
                  <span className="text-destructive text-xs sm:text-sm">{error}</span>
                ) : (
                  `${data?.uptime}%`
                )}
              </div>
              {data && !loading && !error && (
                data.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
