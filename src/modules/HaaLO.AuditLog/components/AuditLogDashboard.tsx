import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { FileText, Search, Download, Filter, Eye, AlertTriangle } from 'lucide-react';
import { AuditLogService } from '../services/AuditLogService';
import type { AuditLogEntry, AuditLogStats } from '../types';

export const AuditLogDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  
  const auditService = AuditLogService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsResult, statsResult] = await Promise.all([
        auditService.queryLogs({ limit: 100 }),
        auditService.getStats(),
      ]);
      
      setLogs(logsResult.logs);
      setStats(statsResult);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'login': case 'logout': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesResource = selectedResource === 'all' || log.resourceType === selectedResource;
    
    return matchesSearch && matchesAction && matchesResource;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">
            System-wide activity and security audit trail
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                Unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                Failed operations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Action</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats.topActions[0]?.action || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.topActions[0]?.count || 0} events
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="payroll_run">Payroll Run</SelectItem>
                <SelectItem value="timesheet">Timesheet</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {log.action}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{log.details}</p>
                      {!log.success && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{log.userEmail || 'System'}</span>
                      <span>•</span>
                      <span className="capitalize">{log.resourceType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{log.sourceModule}</span>
                      {log.duration && (
                        <>
                          <span>•</span>
                          <span>{log.duration}ms</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground text-right">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found matching the current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};