import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Filter, Search, Eye, Clock, User, Activity } from "lucide-react";
import { AuditService, TimeAuditLog, AuditLogFilters } from "../services/AuditService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface AuditLogViewerProps {
  employeeId?: string;
  showFilters?: boolean;
  maxHeight?: string;
}

export function AuditLogViewer({ 
  employeeId, 
  showFilters = true, 
  maxHeight = "600px" 
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<TimeAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    employee_id: employeeId
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActionType, setSelectedActionType] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await AuditService.getAuditLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await AuditService.exportToCSV(filters);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const applyFilters = () => {
    const newFilters: AuditLogFilters = {
      employee_id: employeeId
    };

    if (selectedActionType) {
      newFilters.action_type = selectedActionType;
    }

    if (dateRange.start && dateRange.end) {
      newFilters.date_range = {
        start: dateRange.start,
        end: dateRange.end
      };
    }

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSelectedActionType("");
    setDateRange({ start: "", end: "" });
    setSearchTerm("");
    setFilters({ employee_id: employeeId });
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'CLOCK_IN':
      case 'CLOCK_OUT':
        return 'default';
      case 'PUNCH_EDIT':
      case 'PUNCH_DELETE':
        return 'destructive';
      case 'TIMECARD_APPROVAL':
        return 'secondary';
      case 'MISSED_PUNCH_CORRECTION':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatValue = (value: any) => {
    if (!value) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(searchLower) ||
      log.performed_by_role.toLowerCase().includes(searchLower) ||
      log.source.toLowerCase().includes(searchLower) ||
      (log.notes && log.notes.toLowerCase().includes(searchLower))
    );
  });

  const actionTypes = [
    'CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END',
    'PUNCH_EDIT', 'PUNCH_DELETE', 'MISSED_PUNCH_CORRECTION',
    'TIMECARD_APPROVAL', 'TIMECARD_REJECTION', 'TIMECARD_LOCK',
    'PAYROLL_EXPORT', 'SCHEDULE_OVERRIDE', 'ADMIN_CORRECTION'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Immutable log of all time tracking activities
            </CardDescription>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {formatActionType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-40"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-40"
                />
              </div>
              <Button onClick={applyFilters} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </div>
        )}

        <div 
          className="space-y-3 overflow-y-auto" 
          style={{ maxHeight }}
        >
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {formatActionType(log.action_type)}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{log.performed_by_role}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.source}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {log.previous_value && (
                    <div>
                      <h4 className="font-medium mb-1 text-destructive">Before</h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {formatValue(log.previous_value)}
                      </pre>
                    </div>
                  )}
                  
                  {log.new_value && (
                    <div>
                      <h4 className="font-medium mb-1 text-green-600">After</h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {formatValue(log.new_value)}
                      </pre>
                    </div>
                  )}
                </div>

                {log.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {log.notes}
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.device_id && (
                    <span>Device: {log.device_id}</span>
                  )}
                  {log.ip_address && (
                    <span>IP: {String(log.ip_address)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredLogs.length} of {logs.length} audit entries
          </span>
          <span>
            Read-only • Immutable trail
          </span>
        </div>
      </CardContent>
    </Card>
  );
}