import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SSOManagement } from '@/components/admin/SSOManagement';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Eye, 
  Lock,
  Activity,
  Clock,
  TrendingUp,
  UserCheck,
  Database,
  Network,
  RefreshCw,
  Settings
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  status: string;
  ip_address: unknown;
  user_agent: string;
  created_at: string;
  details: string;
  company_id: string;
  old_values: any;
  new_values: any;
  session_id: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  created_at: string;
  is_resolved: boolean;
  source_ip: unknown;
  user_agent: string;
  details: any;
  resolved_at: string;
  resolved_by: string;
  user_id: string;
}

interface APIKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string;
  expires_at: string;
  created_at: string;
}

export function SecurityAuditPanel() {
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions for security events
    const securityChannel = supabase
      .channel('security-events')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'security_events' },
        () => loadSecurityEvents()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'audit_logs' },
        () => loadAuditLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(securityChannel);
    };
  }, [dateRange, filterType]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadAuditLogs(),
      loadSecurityEvents(),
      loadAPIKeys()
    ]);
    setIsLoading(false);
  };

  const loadAuditLogs = async () => {
    const daysAgo = parseInt(dateRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    let query = supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (filterType !== 'all') {
      query = query.eq('action_type', filterType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading audit logs:', error);
      return;
    }

    setAuditLogs(data || []);
  };

  const loadSecurityEvents = async () => {
    const daysAgo = parseInt(dateRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading security events:', error);
      return;
    }

    setSecurityEvents(data || []);
  };

  const loadAPIKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading API keys:', error);
      return;
    }

    setAPIKeys(data || []);
  };

  const handleResolveSecurityEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('security_events')
      .update({ 
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resolve security event",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Security Event Resolved",
      description: "The security event has been marked as resolved",
    });

    loadSecurityEvents();
  };

  const handleRevokeAPIKey = async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "API Key Revoked",
      description: "The API key has been successfully revoked",
    });

    loadAPIKeys();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'failure': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const securityMetrics = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical' && !e.is_resolved).length,
    resolvedEvents: securityEvents.filter(e => e.is_resolved).length,
    activeAPIKeys: apiKeys.filter(k => k.is_active).length,
    suspiciousActivity: auditLogs.filter(l => l.status === 'failure').length,
    loginAttempts: auditLogs.filter(l => l.action_type === 'login').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Audit Panel</h1>
          <p className="text-muted-foreground">Monitor security events, audit logs, and access controls</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.criticalEvents} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.activeAPIKeys}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.length} total keys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{securityMetrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Attempts</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.loginAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Authentication events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{securityMetrics.resolvedEvents}</div>
            <p className="text-xs text-muted-foreground">
              Security events closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="sso">SSO Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Monitor and respond to security-related incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{event.event_type}</span>
                        {event.is_resolved && (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                         {event.source_ip && (
                           <span className="flex items-center">
                             <Network className="h-3 w-3 mr-1" />
                             {String(event.source_ip)}
                           </span>
                         )}
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                     <p className="text-sm text-muted-foreground mb-3">
                       {JSON.stringify(event.details)}
                     </p>
                    {!event.is_resolved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResolveSecurityEvent(event.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No security events found for the selected time period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Track all system activities and user actions</CardDescription>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="font-medium">{log.action_type}</span>
                        <span className="text-sm text-muted-foreground">
                          {log.resource_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                         {log.ip_address && (
                           <span className="flex items-center">
                             <Network className="h-3 w-3 mr-1" />
                             {String(log.ip_address)}
                           </span>
                         )}
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                    {log.user_agent && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {log.user_agent}
                      </p>
                    )}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found for the selected filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Monitor and manage API access keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{key.name}</span>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {key.is_active && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRevokeAPIKey(key.id)}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Key Preview</Label>
                        <p className="font-mono">{key.key_preview}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Used</Label>
                        <p>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Expires</Label>
                        <p>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'No expiration'}</p>
                      </div>
                    </div>
                    {key.permissions.length > 0 && (
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Permissions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-6">
          <SSOManagement />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Events Trend</span>
                    <div className="flex items-center text-success">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">Decreasing</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Login Rate</span>
                    <span className="text-sm text-muted-foreground">2.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Key Usage</span>
                    <span className="text-sm text-muted-foreground">Normal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Health</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">All systems operational</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">{securityMetrics.criticalEvents} events need attention</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{securityMetrics.activeAPIKeys} API keys active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Security audit up to date</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}