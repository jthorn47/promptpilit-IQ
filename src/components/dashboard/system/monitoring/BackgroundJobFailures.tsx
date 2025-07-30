
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface JobFailure {
  id: string;
  job_name: string;
  timestamp: string;
  error: string;
  status: string;
}

export const BackgroundJobFailures: React.FC = () => {
  const [failures, setFailures] = useState<JobFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobFailures();
  }, []);

  const fetchJobFailures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('job-service');
      
      if (error) throw error;
      setFailures(data.failures);
      setError(null);
    } catch (err) {
      console.error('Error fetching job failures:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'timeout': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-sm">Background Job Failures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Unable to load</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Background Job Failures
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : failures.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent failures</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {failures.map((failure) => (
              <div key={failure.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{failure.job_name}</span>
                  <Badge className={getStatusColor(failure.status)}>
                    {failure.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {formatDistanceToNow(new Date(failure.timestamp), { addSuffix: true })}
                </p>
                <p className="text-xs text-destructive">{failure.error}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
