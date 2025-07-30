import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useSecurityMetrics } from '../hooks/useSecurityMetrics';

export const SecurityDashboard = () => {
  const { metrics, loading, error } = useSecurityMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading security metrics: {error}
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics?.security_score || 0)}`}>
              {metrics?.security_score || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.active_threats || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Events</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.resolved_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics?.total_events || 0} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.critical_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>
              Current security posture overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Secure
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Security Scan</span>
              <span className="text-sm text-muted-foreground">
                {metrics?.last_scan_date ? 
                  new Date(metrics.last_scan_date).toLocaleDateString() : 
                  'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Encryption Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                AES-256
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Firewall Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Security Actions</CardTitle>
            <CardDescription>
              Latest security-related activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">Security Scan Completed</div>
              <div className="text-muted-foreground">24 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Firewall Rules Updated</div>
              <div className="text-muted-foreground">2 days ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">SSL Certificate Renewed</div>
              <div className="text-muted-foreground">1 week ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Security Policy Updated</div>
              <div className="text-muted-foreground">2 weeks ago</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};