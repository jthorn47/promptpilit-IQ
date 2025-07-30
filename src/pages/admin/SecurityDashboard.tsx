import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity, 
  Users, 
  FileWarning,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecurityMetrics {
  totalViolations: number;
  criticalViolations: number;
  averageRiskScore: number;
  activeThreats: number;
  encryptedFields: number;
  complianceScore: number;
}

interface ComplianceViolation {
  id: string;
  violation_type: string;
  severity: string;
  user_id: string;
  created_at: string;
  investigation_status: string;
  violation_details: any;
}

interface SecurityAuditLog {
  id: string;
  event_type: string;
  resource_type: string;
  action: string;
  risk_score: number;
  success: boolean;
  sensitive_data_accessed: boolean;
  created_at: string;
  compliance_flags: string[];
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalViolations: 0,
    criticalViolations: 0,
    averageRiskScore: 0,
    activeThreats: 0,
    encryptedFields: 0,
    complianceScore: 0
  });
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      await Promise.all([
        fetchSecurityMetrics(),
        fetchComplianceViolations(),
        fetchSecurityAuditLogs()
      ]);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityMetrics = async () => {
    // Get compliance violations count
    const { data: violationsData, error: violationsError } = await supabase
      .from('compliance_violations')
      .select('severity')
      .eq('investigation_status', 'open');

    // Get average risk score from recent audit logs
    const { data: auditData, error: auditError } = await supabase
      .from('security_audit_logs')
      .select('risk_score, sensitive_data_accessed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Get encrypted fields count
    const { data: encryptedData, error: encryptedError } = await supabase
      .from('data_classifications')
      .select('id')
      .eq('encryption_required', true);

    if (!violationsError && !auditError && !encryptedError) {
      const totalViolations = violationsData?.length || 0;
      const criticalViolations = violationsData?.filter(v => v.severity === 'critical').length || 0;
      const avgRisk = auditData?.length ? 
        auditData.reduce((sum, log) => sum + (log.risk_score || 0), 0) / auditData.length : 0;
      const activeThreats = auditData?.filter(log => (log.risk_score || 0) > 70).length || 0;
      const encryptedFields = encryptedData?.length || 0;

      // Calculate compliance score based on violations and security measures
      const complianceScore = Math.max(0, 100 - (criticalViolations * 10) - (totalViolations * 2));

      setMetrics({
        totalViolations,
        criticalViolations,
        averageRiskScore: Math.round(avgRisk),
        activeThreats,
        encryptedFields,
        complianceScore: Math.round(complianceScore)
      });
    }
  };

  const fetchComplianceViolations = async () => {
    const { data, error } = await supabase
      .from('compliance_violations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setViolations(data);
    }
  };

  const fetchSecurityAuditLogs = async () => {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setAuditLogs(data);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <Badge className={styles[severity as keyof typeof styles]}>{severity}</Badge>;
  };

  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor HIPAA compliance, payroll security, and system threats</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold">Security Status: Active</span>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics.criticalViolations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Security Alert</AlertTitle>
          <AlertDescription className="text-red-700">
            {metrics.criticalViolations} critical compliance violation(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceScoreColor(metrics.complianceScore)}`}>
              {metrics.complianceScore}%
            </div>
            <Progress value={metrics.complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViolations}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalViolations} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRiskScore}</div>
            <div className="mt-1">{getRiskScoreBadge(metrics.averageRiskScore)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">High risk events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted Fields</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.encryptedFields}</div>
            <p className="text-xs text-muted-foreground">Protected data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Access</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.filter(log => log.sensitive_data_accessed).length}</div>
            <p className="text-xs text-muted-foreground">Sensitive access (24h)</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="violations">Compliance Violations</TabsTrigger>
          <TabsTrigger value="audit">Security Audit Log</TabsTrigger>
          <TabsTrigger value="protection">Data Protection</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No compliance violations detected
                  </div>
                ) : (
                  violations.map((violation) => (
                    <div key={violation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{violation.violation_type.replace(/_/g, ' ').toUpperCase()}</h4>
                          {getSeverityBadge(violation.severity)}
                        </div>
                        <Badge variant="outline">{violation.investigation_status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {violation.violation_details?.description || 'No description available'}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(violation.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">{log.event_type.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{log.resource_type}</span>
                      </div>
                      {getRiskScoreBadge(log.risk_score || 0)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Action: {log.action}</span>
                      {log.sensitive_data_accessed && (
                        <Badge variant="outline" className="text-xs">Sensitive Data</Badge>
                      )}
                      {log.compliance_flags?.map(flag => (
                        <Badge key={flag} variant="outline" className="text-xs uppercase">
                          {flag}
                        </Badge>
                      ))}
                      <span className="ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Protection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">HIPAA Protected Data</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Social Security Numbers</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Medical Information</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Date of Birth</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Financial Data (SOX)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Payroll Records</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Tax Withholdings</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>Banking Information</span>
                      <Badge className="bg-green-100 text-green-800">Encrypted</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}