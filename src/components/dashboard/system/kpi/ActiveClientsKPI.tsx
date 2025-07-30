
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ActiveClientsKPI: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveClients();
  }, []);

  const fetchActiveClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('client-service/active-count');
      
      if (error) throw error;
      setCount(data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching active clients:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total Active Clients
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
