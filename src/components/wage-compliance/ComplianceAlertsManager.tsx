import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Eye, FileText, Plus, Settings, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ComplianceAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  violation_details: any;
  affected_employees: string[];
  jurisdiction: string;
  recommended_actions: string[];
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface ComplianceRule {
  id: string;
  rule_name: string;
  rule_type: string;
  trigger_conditions: any;
  alert_threshold: any;
  notification_frequency: string;
  notification_channels: string[];
  recipients: string[];
  is_active: boolean;
  created_at: string;
}

export const ComplianceAlertsManager: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch compliance alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['wage-compliance-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wage_compliance_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ComplianceAlert[];
    }
  });

  // Fetch compliance rules
  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['wage-compliance-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wage_compliance_rules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ComplianceRule[];
    }
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes: string }) => {
      const { error } = await supabase.rpc('resolve_wage_compliance_alert', {
        p_alert_id: alertId,
        p_resolution_notes: notes
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wage-compliance-alerts'] });
      toast.success('Alert resolved successfully');
      setSelectedAlert(null);
      setResolutionNotes('');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      console.error('Error resolving alert:', error);
    }
  });

  const handleResolveAlert = () => {
    if (!selectedAlert) return;
    resolveAlertMutation.mutate({
      alertId: selectedAlert.id,
      notes: resolutionNotes
    });
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants]} className={colors[severity as keyof typeof colors]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'wage_violation':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'upcoming_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'threshold_breach':
        return <ExternalLink className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const activeAlerts = alerts?.filter(alert => !alert.is_resolved) || [];
  const resolvedAlerts = alerts?.filter(alert => alert.is_resolved) || [];
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  if (alertsLoading) {
    return <div className="flex items-center justify-center p-8">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Alerts & Monitoring</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              +{alerts?.filter(a => !a.is_resolved && new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Action needed soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active compliance rules</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active-alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-alerts">Active Alerts ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
          <TabsTrigger value="rules">Monitoring Rules ({rules?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active-alerts" className="space-y-4">
          {criticalAlerts.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''} that require immediate attention.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAlertTypeIcon(alert.alert_type)}
                          <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{alert.jurisdiction}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {alert.affected_employees.length}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(alert.created_at), 'MMM d, HH:mm')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resolve Alert</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">{alert.title}</h4>
                                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Resolution Notes</label>
                                  <Textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="Describe how this alert was resolved..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    onClick={() => {
                                      setSelectedAlert(alert);
                                      handleResolveAlert();
                                    }}
                                    disabled={resolveAlertMutation.isPending}
                                  >
                                    Resolve Alert
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div className="font-medium">No Active Alerts</div>
                          <p className="text-sm text-muted-foreground">
                            Your wage compliance is up to date
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Resolved Date</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.resolved_at ? format(new Date(alert.resolved_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {alert.resolved_at && (
                          Math.round(
                            (new Date(alert.resolved_at).getTime() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60)
                          ) + ' hours'
                        )}
                      </TableCell>
                      <TableCell>{alert.resolution_notes || 'No notes provided'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Compliance Monitoring Rules</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules?.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell className="capitalize">{rule.rule_type.replace('_', ' ')}</TableCell>
                      <TableCell className="capitalize">{rule.notification_frequency}</TableCell>
                      <TableCell>{rule.recipients.length} recipients</TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!rules || rules.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">No monitoring rules configured</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};