
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SupportTicketsKPI: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('support-service');
      
      if (error) throw error;
      setCount(data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 dark:text-orange-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Open Support Tickets
            </p>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
              ) : error ? (
                <span className="text-destructive text-xs sm:text-sm">{error}</span>
              ) : (
                count
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
