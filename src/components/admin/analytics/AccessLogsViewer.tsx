import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Activity, Check, X, ExternalLink } from "lucide-react";

interface AccessLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  details: any;
  ip_address?: string;
  user_agent?: string;
}

interface AccessLogsViewerProps {
  dateRange: { from: Date; to: Date };
  searchQuery: string;
  selectedModule: string;
  selectedOutcome: string;
}

export function AccessLogsViewer({ 
  dateRange, 
  searchQuery, 
  selectedModule, 
  selectedOutcome 
}: AccessLogsViewerProps) {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`user_id.ilike.%${searchQuery}%,resource_type.ilike.%${searchQuery}%`);
      }

      if (selectedModule !== 'all') {
        query = query.eq('resource_type', selectedModule);
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      // Transform admin_audit_log data to match our interface
      const transformedLogs: AccessLogEntry[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.created_at,
        user_email: log.user_id || 'System',
        action_type: log.action_type,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        success: true, // Admin audit logs generally represent successful actions
        details: log.action_details,
        ip_address: log.ip_address?.toString(),
        user_agent: log.user_agent
      }));

      setLogs(transformedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch access logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessLogs();
  }, [dateRange, searchQuery, selectedModule, selectedOutcome]);

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }: any) => (
        <span className="text-sm">
          {format(new Date(row.getValue("timestamp")), "MMM dd, yyyy HH:mm:ss")}
        </span>
      ),
    },
    {
      accessorKey: "user_email",
      header: "User",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("user_email")}</span>
      ),
    },
    {
      accessorKey: "action_type",
      header: "Action",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue("action_type")}</Badge>
      ),
    },
    {
      accessorKey: "resource_type",
      header: "Resource",
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.getValue("resource_type")}</Badge>
      ),
    },
    {
      accessorKey: "success",
      header: "Outcome",
      cell: ({ row }: any) => {
        const success = row.getValue("success");
        return (
          <Badge variant={success ? "default" : "destructive"}>
            {success ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Granted
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Denied
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("ip_address") || "N/A"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Show detailed view
            console.log("View details for:", row.original);
          }}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading access logs: {error}</p>
          <Button onClick={fetchAccessLogs} className="mt-4">
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
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(log => log.user_email)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active users in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0 ? Math.round((logs.filter(log => log.success).length / logs.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful access attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Resource</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0 ? 
                Object.entries(
                  logs.reduce((acc, log) => {
                    acc[log.resource_type] = (acc[log.resource_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most accessed resource
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Access Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Access Logs
          </CardTitle>
          <CardDescription>
            Detailed view of all user access events and system interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logs}
          />
        </CardContent>
      </Card>
    </div>
  );
}