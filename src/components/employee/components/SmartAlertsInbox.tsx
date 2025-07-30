import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Mail,
  Trash2,
  Filter
} from 'lucide-react';

const SmartAlertsInbox: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('all');
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['employee-alerts', filter],
    queryFn: async () => {
      let query = supabase
        .from('employee_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'action_required') {
        query = query.eq('action_required', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('employee_alerts')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-alerts'] });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('employee_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-alerts'] });
    }
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payroll':
        return '💰';
      case 'tax':
        return '📋';
      case 'benefits':
        return '🏥';
      case 'system':
        return '⚙️';
      case 'halo_insight':
        return '🤖';
      default:
        return '📢';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Smart Alerts & Inbox</h2>
          <p className="text-muted-foreground">Automated messages and insights from HALO</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="hover-scale"
          >
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className="hover-scale"
          >
            <Mail className="w-4 h-4 mr-2" />
            Unread
          </Button>
          <Button
            variant={filter === 'action_required' ? 'default' : 'outline'}
            onClick={() => setFilter('action_required')}
            className="hover-scale"
          >
            <Clock className="w-4 h-4 mr-2" />
            Action Required
          </Button>
        </div>
      </div>

      {/* Alert Categories */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="payroll">💰 Payroll</TabsTrigger>
          <TabsTrigger value="tax">📋 Tax</TabsTrigger>
          <TabsTrigger value="benefits">🏥 Benefits</TabsTrigger>
          <TabsTrigger value="system">⚙️ System</TabsTrigger>
          <TabsTrigger value="halo_insight">🤖 HALO</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {alerts?.map((alert) => (
            <Card 
              key={alert.id} 
              className={`bg-card/80 backdrop-blur-sm border-border/50 hover-scale transition-all ${
                !alert.is_read ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(alert.priority)}
                      <span className="text-2xl">{getTypeIcon(alert.alert_type)}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${!alert.is_read ? 'text-primary' : ''}`}>
                          {alert.title}
                        </h3>
                        {!alert.is_read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                          {alert.priority}
                        </Badge>
                        {alert.action_required && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Action Required
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                        {alert.expires_at && (
                          <span>Expires: {new Date(alert.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {alert.action_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(alert.action_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {alert.action_label || 'View'}
                      </Button>
                    )}
                    
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Category-specific tabs */}
        {['payroll', 'tax', 'benefits', 'system', 'halo_insight'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {alerts?.filter(alert => alert.alert_type === category).map((alert) => (
              <Card 
                key={alert.id} 
                className={`bg-card/80 backdrop-blur-sm border-border/50 hover-scale transition-all ${
                  !alert.is_read ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(alert.priority)}
                        <span className="text-2xl">{getTypeIcon(alert.alert_type)}</span>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${!alert.is_read ? 'text-primary' : ''}`}>
                            {alert.title}
                          </h3>
                          {!alert.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                            {alert.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground">{alert.message}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {alert.action_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(alert.action_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {alert.action_label || 'View'}
                        </Button>
                      )}
                      
                      {!alert.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {alerts?.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Alerts</h3>
            <p className="text-muted-foreground">
              You're all caught up! HALO will notify you when there are new insights or actions needed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartAlertsInbox;