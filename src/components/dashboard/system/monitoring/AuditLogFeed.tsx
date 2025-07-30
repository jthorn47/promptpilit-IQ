
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: any;
}

export const AuditLogFeed: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('audit-log-service');
      
      if (error) throw error;
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-sm">Audit Log Feed</CardTitle>
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
          <Shield className="h-5 w-5" />
          Audit Log Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
