import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Download, Shield, Clock, User, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id?: string;
  company_id?: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  status: string;
  details?: string;
  ip_address?: unknown;
  user_agent?: string;
  session_id?: string;
}

interface HaloAuditEntry {
  id: string;
  created_at: string;
  user_id: string;
  client_id?: string;
  module: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  override_used: boolean;
  approval_request_id?: string;
}

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [haloAuditLogs, setHaloAuditLogs] = useState<HaloAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('system');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Fetch system audit logs
      const { data: systemLogs, error: systemError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (systemError) throw systemError;

      // Fetch HaaLO audit logs
      const { data: haloLogs, error: haloError } = await supabase
        .from('halo_audit_trail')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (haloError) throw haloError;

      setAuditLogs(systemLogs || []);
      setHaloAuditLogs(haloLogs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'create':
      case 'insert':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Activity className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const exportAuditLogs = () => {
    const logsToExport = activeTab === 'system' ? auditLogs : haloAuditLogs;
    const csv = [
      ['Timestamp', 'Action', 'Resource', 'Status', 'User ID', 'Details'].join(','),
      ...logsToExport.map(log => [
        log.created_at,
        'action_type' in log ? log.action_type : (log as HaloAuditEntry).action,
        'resource_type' in log ? log.resource_type : (log as HaloAuditEntry).resource_type || '',
        'status' in log ? log.status : 'completed',
        log.user_id || '',
        'details' in log ? log.details || '' : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSystemLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const filteredHaloLogs = haloAuditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground">System activity logs and security audit trail</p>
        </div>
        <Button onClick={exportAuditLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAuditLogs} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="haalo">HaaLO Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>
                General system activity and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSystemLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getActionIcon(log.action_type)}
                          <div>
                            <span className="font-medium">{log.action_type}</span>
                            <span className="text-muted-foreground ml-2">on {log.resource_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      {log.details && (
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div>User ID: {log.user_id || 'System'}</div>
                        <div>Resource ID: {log.resource_id || 'N/A'}</div>
                        <div>IP: {log.ip_address ? String(log.ip_address) : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredSystemLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit logs found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="haalo">
          <Card>
            <CardHeader>
              <CardTitle>HaaLO Audit Logs</CardTitle>
              <CardDescription>
                HaaLO specific module activity and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHaloLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getActionIcon(log.action)}
                          <div>
                            <span className="font-medium">{log.action}</span>
                            <span className="text-muted-foreground ml-2">in {log.module}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.override_used && (
                            <Badge variant="destructive">Override Used</Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div>User ID: {log.user_id}</div>
                        <div>Client ID: {log.client_id || 'N/A'}</div>
                        <div>Resource: {log.resource_type || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredHaloLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No HaaLO audit logs found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditTrail;