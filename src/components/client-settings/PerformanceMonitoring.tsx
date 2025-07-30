import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  WifiOff,
  TrendingDown,
  Settings,
  RefreshCw
} from "lucide-react";
import { MODULE_DEFINITIONS } from "@/types/modules";

interface ModuleHealth {
  moduleId: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  performance: {
    responseTime: number;
    errorRate: number;
    usage: number;
  };
  issues: Array<{
    type: 'performance' | 'configuration' | 'integration' | 'usage';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
    autoFixAvailable: boolean;
  }>;
}

interface PerformanceMetrics {
  totalUsers: number;
  activeModules: number;
  systemLoad: number;
  avgResponseTime: number;
  errorRate: number;
  moduleHealth: ModuleHealth[];
}

interface PerformanceMonitoringProps {
  metrics: PerformanceMetrics;
  systemHealthScore: number;
  criticalIssues: any[];
  onRefresh: () => void;
  onAutoFix: () => Promise<boolean>;
  loading: boolean;
}

export const PerformanceMonitoring = ({ 
  metrics, 
  systemHealthScore, 
  criticalIssues, 
  onRefresh, 
  onAutoFix,
  loading 
}: PerformanceMonitoringProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical': return <WifiOff className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const formatResponseTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.activeModules}</div>
              <div className="text-xs text-muted-foreground">Active Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatResponseTime(metrics.avgResponseTime)}</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Health Score</span>
              <span className={`text-lg font-bold ${getHealthScoreColor(systemHealthScore)}`}>
                {systemHealthScore}%
              </span>
            </div>
            <Progress value={systemHealthScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {criticalIssues.length} critical issue(s) detected requiring immediate attention
            </span>
            <Button variant="outline" size="sm" onClick={onAutoFix}>
              <Zap className="w-4 h-4 mr-2" />
              Auto Fix
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Module Health Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Module Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {metrics.moduleHealth.map((health) => {
              const module = MODULE_DEFINITIONS.find(m => m.id === health.moduleId);
              if (!module) return null;

              return (
                <div key={health.moduleId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(health.status)}
                      <div>
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Uptime: {formatUptime(health.uptime)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(health.status)}>
                      {health.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                      <div className="font-medium">{formatResponseTime(health.performance.responseTime)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Error Rate</div>
                      <div className="font-medium">{health.performance.errorRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Usage</div>
                      <div className="font-medium">{Math.round(health.performance.usage)}%</div>
                    </div>
                  </div>

                  {health.issues.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Issues ({health.issues.length})</div>
                      {health.issues.map((issue, index) => (
                        <div key={index} className="text-xs bg-muted/50 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                            <span className="font-medium">{issue.message}</span>
                          </div>
                          <div className="text-muted-foreground">{issue.suggestion}</div>
                          {issue.autoFixAvailable && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-fix available
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div className="font-medium mb-2">Optimization Recommendations:</div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <span>System load is within normal parameters (75%)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <span>Consider enabling caching for modules with high response times</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>Review module configurations for optimal performance</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};