
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const NewClientsKPI: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewClients();
  }, []);

  const fetchNewClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('client-service/new-monthly-count');
      
      if (error) throw error;
      setCount(data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching new clients:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              New Clients This Month
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {loading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
                ) : error ? (
                  <span className="text-destructive text-xs sm:text-sm">{error}</span>
                ) : (
                  count
                )}
              </div>
              {count !== null && count > 0 && !loading && !error && (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
