import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Play } from "lucide-react";
import { useSecurityScans } from '../hooks/useSecurityScans';
import { useVulnerabilityReports } from '../hooks/useVulnerabilityReports';

export const SecurityAudit = () => {
  const { scans, loading: scansLoading, startScan } = useSecurityScans();
  const { reports, loading: reportsLoading } = useVulnerabilityReports();

  const loading = scansLoading || reportsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartScan = async (scanType: string) => {
    const result = await startScan(scanType);
    if (result.error) {
      console.error('Failed to start scan:', result.error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Audit</CardTitle>
          <CardDescription>
            Comprehensive security assessment and vulnerability management
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Scans</CardTitle>
            <CardDescription>
              Automated security assessments and penetration tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => handleStartScan('Vulnerability Scan')}
                className="flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Vulnerability Scan</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStartScan('Penetration Test')}
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Start Penetration Test</span>
              </Button>
            </div>
            
            <div className="space-y-3">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{scan.scan_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(scan.started_at).toLocaleString()}
                    </p>
                    {scan.vulnerabilities_found > 0 && (
                      <p className="text-sm text-orange-600">
                        {scan.vulnerabilities_found} vulnerabilities found
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(scan.status)}>
                    {scan.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Reports</CardTitle>
            <CardDescription>
              Security vulnerabilities and remediation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No vulnerabilities found</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex space-x-2">
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    {report.cve_id && (
                      <p className="text-xs text-blue-600">{report.cve_id}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Discovered: {new Date(report.discovered_at).toLocaleDateString()}
                      {report.fixed_at && (
                        <span> • Fixed: {new Date(report.fixed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};