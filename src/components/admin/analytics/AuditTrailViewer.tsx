import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Eye, User, Settings, UserPlus, UserMinus } from "lucide-react";

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  admin_user: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  affected_user?: string;
  old_values?: any;
  new_values?: any;
  change_summary: string;
  ip_address?: string;
  user_agent?: string;
}

interface AuditTrailViewerProps {
  dateRange: { from: Date; to: Date };
  searchQuery: string;
}

export function AuditTrailViewer({ dateRange, searchQuery }: AuditTrailViewerProps) {
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`action_type.ilike.%${searchQuery}%,resource_type.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      // Transform admin_audit_log data to match our interface
      const transformedEntries: AuditTrailEntry[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.created_at,
        admin_user: log.user_id || 'System',
        action_type: log.action_type,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        affected_user: log.resource_type === 'user' ? log.resource_id : undefined,
        old_values: log.old_values,
        new_values: log.new_values,
        change_summary: generateChangeSummary(log),
        ip_address: log.ip_address?.toString(),
        user_agent: log.user_agent
      }));

      setAuditEntries(transformedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  const generateChangeSummary = (log: any): string => {
    const { action_type, resource_type, old_values, new_values } = log;
    
    if (action_type === 'created') {
      return `Created new ${resource_type}`;
    } else if (action_type === 'updated') {
      if (old_values && new_values) {
        const changes = Object.keys(new_values).filter(
          key => JSON.stringify(old_values[key]) !== JSON.stringify(new_values[key])
        );
        return `Updated ${resource_type}: ${changes.join(', ')}`;
      }
      return `Updated ${resource_type}`;
    } else if (action_type === 'deleted') {
      return `Deleted ${resource_type}`;
    }
    return `${action_type} on ${resource_type}`;
  };

  useEffect(() => {
    fetchAuditTrail();
  }, [dateRange, searchQuery]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_created':
      case 'role_assigned':
        return <UserPlus className="h-4 w-4" />;
      case 'user_deleted':
      case 'role_removed':
        return <UserMinus className="h-4 w-4" />;
      case 'user_updated':
      case 'attribute_updated':
        return <User className="h-4 w-4" />;
      case 'policy_updated':
      case 'settings_changed':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'created':
      case 'role_assigned':
        return 'default';
      case 'updated':
      case 'attribute_updated':
        return 'secondary';
      case 'deleted':
      case 'role_removed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }: any) => (
        <span className="text-sm">
          {format(new Date(row.getValue("timestamp")), "MMM dd, HH:mm:ss")}
        </span>
      ),
    },
    {
      accessorKey: "admin_user",
      header: "Admin User",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("admin_user")}</span>
      ),
    },
    {
      accessorKey: "action_type",
      header: "Action",
      cell: ({ row }: any) => {
        const actionType = row.getValue("action_type");
        return (
          <Badge variant={getActionColor(actionType) as any}>
            {getActionIcon(actionType)}
            <span className="ml-1">{actionType}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "resource_type",
      header: "Resource",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue("resource_type")}</Badge>
      ),
    },
    {
      accessorKey: "affected_user",
      header: "Affected User",
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("affected_user") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "change_summary",
      header: "Summary",
      cell: ({ row }: any) => (
        <span className="text-sm">{row.getValue("change_summary")}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEntry(row.original)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail Details
              </DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Admin User</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.admin_user}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timestamp</label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEntry.timestamp), "PPpp")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <Badge variant={getActionColor(selectedEntry.action_type) as any}>
                      {selectedEntry.action_type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Resource</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.resource_type}</p>
                  </div>
                </div>

                {selectedEntry.affected_user && (
                  <div>
                    <label className="text-sm font-medium">Affected User</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.affected_user}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Change Summary</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.change_summary}</p>
                </div>

                {selectedEntry.old_values && (
                  <div>
                    <label className="text-sm font-medium">Previous Values</label>
                    <Textarea
                      value={JSON.stringify(selectedEntry.old_values, null, 2)}
                      readOnly
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}

                {selectedEntry.new_values && (
                  <div>
                    <label className="text-sm font-medium">New Values</label>
                    <Textarea
                      value={JSON.stringify(selectedEntry.new_values, null, 2)}
                      readOnly
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}

                {selectedEntry.ip_address && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">IP Address</label>
                      <p className="text-sm text-muted-foreground">{selectedEntry.ip_address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">User Agent</label>
                      <p className="text-sm text-muted-foreground text-xs">
                        {selectedEntry.user_agent || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading audit trail: {error}</p>
          <Button onClick={fetchAuditTrail} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Admin actions performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(auditEntries.map(entry => entry.admin_user)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Resource</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEntries.length > 0 ? 
                Object.entries(
                  auditEntries.reduce((acc, entry) => {
                    acc[entry.resource_type] = (acc[entry.resource_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most modified resource
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEntries.filter(entry => 
                new Date(entry.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Changes in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Admin Action Audit Trail
          </CardTitle>
          <CardDescription>
            Complete log of all administrative changes to roles, attributes, and access policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={auditEntries}
          />
        </CardContent>
      </Card>
    </div>
  );
}