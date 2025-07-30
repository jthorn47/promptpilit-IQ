
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ComplianceAlertsKPI: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceAlerts();
  }, []);

  const fetchComplianceAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('compliance-service');
      
      if (error) throw error;
      setCount(data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching compliance alerts:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={count && count > 0 ? 'border-red-200 dark:border-red-800' : ''}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
            count && count > 0 
              ? 'bg-red-100 dark:bg-red-900' 
              : 'bg-green-100 dark:bg-green-900'
          }`}>
            <Shield className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${
              count && count > 0
                ? 'text-red-600 dark:text-red-300'
                : 'text-green-600 dark:text-green-300'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Pending Compliance Alerts
            </p>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
              ) : error ? (
                <span className="text-destructive text-xs sm:text-sm">{error}</span>
              ) : (
                <span className={count && count > 0 ? 'text-red-600' : ''}>
                  {count}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
