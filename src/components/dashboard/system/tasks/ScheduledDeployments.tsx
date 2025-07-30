
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ScheduledEvent {
  id: string;
  name: string;
  type: string;
  environment: string;
  scheduled_date: string;
  status: string;
}

export const ScheduledDeployments: React.FC = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledEvents();
  }, []);

  const fetchScheduledEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('devops-service');
      
      if (error) throw error;
      setEvents(data.events);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduled events:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deployment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-sm">Scheduled Deployments</CardTitle>
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
          <Rocket className="h-5 w-5" />
          Scheduled Deployments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scheduled events</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium">{event.name}</span>
                  <div className="flex gap-1">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Environment: {event.environment}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.scheduled_date), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
