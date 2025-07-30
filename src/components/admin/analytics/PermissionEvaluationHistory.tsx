import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Shield, Check, X, Eye, Code } from "lucide-react";

interface PermissionEvaluation {
  id: string;
  timestamp: string;
  user_email: string;
  feature: string;
  action: string;
  granted: boolean;
  role: string;
  attributes: Record<string, any>;
  context: Record<string, any>;
  reasoning: string;
  policy_version: string;
  evaluation_time_ms: number;
}

interface PermissionEvaluationHistoryProps {
  dateRange: { from: Date; to: Date };
  searchQuery: string;
  selectedModule: string;
  selectedOutcome: string;
}

export function PermissionEvaluationHistory({ 
  dateRange, 
  searchQuery, 
  selectedModule, 
  selectedOutcome 
}: PermissionEvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<PermissionEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PermissionEvaluation | null>(null);

  // Mock data for demonstration - in real app this would come from audit logs
  const generateMockEvaluations = (): PermissionEvaluation[] => {
    const features = ['user_management', 'vault_access', 'payroll_view', 'crm_edit', 'admin_panel'];
    const actions = ['view', 'edit', 'create', 'delete'];
    const roles = ['super_admin', 'company_admin', 'client_admin', 'learner'];
    const users = ['admin@easeworks.com', 'manager@company.com', 'user@company.com'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const feature = features[Math.floor(Math.random() * features.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const granted = Math.random() > 0.3; // 70% success rate
      
      return {
        id: `eval_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_email: users[Math.floor(Math.random() * users.length)],
        feature,
        action,
        granted,
        role,
        attributes: {
          department: ['engineering', 'hr', 'sales'][Math.floor(Math.random() * 3)],
          is_manager: Math.random() > 0.7,
          assigned_modules: ['vault', 'crm', 'payroll'].slice(0, Math.floor(Math.random() * 3) + 1)
        },
        context: {
          company_id: 'company_123',
          session_id: `session_${i}`,
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
        },
        reasoning: granted 
          ? `Access granted: User has role '${role}' with sufficient permissions for '${feature}:${action}'`
          : `Access denied: User role '${role}' lacks permission for '${feature}:${action}' or missing required attributes`,
        policy_version: 'v1.2.0',
        evaluation_time_ms: Math.floor(Math.random() * 50) + 5
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockEvaluations();
      setEvaluations(mockData);
      setLoading(false);
    }, 1000);
  }, [dateRange, searchQuery, selectedModule, selectedOutcome]);

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
      accessorKey: "user_email",
      header: "User",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("user_email")}</span>
      ),
    },
    {
      accessorKey: "feature",
      header: "Feature",
      cell: ({ row }: any) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.getValue("feature")}
        </code>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue("action")}</Badge>
      ),
    },
    {
      accessorKey: "granted",
      header: "Result",
      cell: ({ row }: any) => {
        const granted = row.getValue("granted");
        return (
          <Badge variant={granted ? "default" : "destructive"}>
            {granted ? (
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
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.getValue("role")}</Badge>
      ),
    },
    {
      accessorKey: "evaluation_time_ms",
      header: "Eval Time",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground">
          {row.getValue("evaluation_time_ms")}ms
        </span>
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
              onClick={() => setSelectedEvaluation(row.original)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Evaluation Details
              </DialogTitle>
            </DialogHeader>
            {selectedEvaluation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User</label>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.user_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timestamp</label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvaluation.timestamp), "PPpp")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Feature:Action</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvaluation.feature}:{selectedEvaluation.action}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Result</label>
                    <Badge variant={selectedEvaluation.granted ? "default" : "destructive"}>
                      {selectedEvaluation.granted ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-sm text-muted-foreground">{selectedEvaluation.role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">User Attributes</label>
                  <Textarea
                    value={JSON.stringify(selectedEvaluation.attributes, null, 2)}
                    readOnly
                    className="font-mono text-xs"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Context</label>
                  <Textarea
                    value={JSON.stringify(selectedEvaluation.context, null, 2)}
                    readOnly
                    className="font-mono text-xs"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Evaluation Reasoning</label>
                  <Textarea
                    value={selectedEvaluation.reasoning}
                    readOnly
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Policy Version</label>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.policy_version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Evaluation Time</label>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.evaluation_time_ms}ms</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluations.length}</div>
            <p className="text-xs text-muted-foreground">
              Permission checks performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grant Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluations.length > 0 ? 
                Math.round((evaluations.filter(e => e.granted).length / evaluations.length) * 100) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Permissions granted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Eval Time</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluations.length > 0 ? 
                Math.round(evaluations.reduce((sum, e) => sum + e.evaluation_time_ms, 0) / evaluations.length) : 0
              }ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average evaluation time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Denied Feature</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluations.length > 0 ? 
                Object.entries(
                  evaluations.filter(e => !e.granted).reduce((acc, e) => {
                    acc[e.feature] = (acc[e.feature] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most denied feature
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Evaluation History
          </CardTitle>
          <CardDescription>
            Detailed log of all permission checks with evaluation context and reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={evaluations}
          />
        </CardContent>
      </Card>
    </div>
  );
}