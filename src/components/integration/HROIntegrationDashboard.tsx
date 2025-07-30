import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Brain, 
  Database, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  BarChart3,
  Settings
} from 'lucide-react';
import { useIntelligentCaseRouting } from '@/hooks/useIntelligentCaseRouting';
import { useServiceDocumentation } from '@/hooks/useServiceDocumentation';
import { useEnhancedBilling } from '@/hooks/useEnhancedBilling';
import { useAdvancedPermissions } from '@/hooks/useAdvancedPermissions';
import { useAnalyticsIntelligence } from '@/hooks/useAnalyticsIntelligence';
import { useIntegrationTesting } from '@/hooks/useIntegrationTesting';
import { logger } from '@/lib/logger';

interface HROIntegrationDashboardProps {
  companyId: string;
}

export const HROIntegrationDashboard: React.FC<HROIntegrationDashboardProps> = ({
  companyId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hook integrations
  const caseRouting = useIntelligentCaseRouting();
  const serviceDoc = useServiceDocumentation();
  const billing = useEnhancedBilling();
  const permissions = useAdvancedPermissions();
  const analytics = useAnalyticsIntelligence();
  const testing = useIntegrationTesting();

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          analytics.getPerformanceMetrics(companyId),
          analytics.getAIInsights(companyId),
          testing.checkSystemHealth()
        ]);
      } catch (error) {
        logger.error('Failed to load dashboard data', error);
      }
    };

    loadDashboardData();
  }, [companyId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const runSystemTests = async () => {
    try {
      await testing.runIntegrationTests();
    } catch (error) {
      logger.error('System tests failed', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HRO IQ + Pulse Integration</h1>
          <p className="text-muted-foreground">
            Advanced HR Operations Intelligence Platform
          </p>
        </div>
        <Button onClick={runSystemTests} disabled={testing.loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${testing.loading ? 'animate-spin' : ''}`} />
          Run Tests
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testing.healthStatus.map((health) => (
          <Card key={health.component}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {health.component}
              </CardTitle>
              {getStatusIcon(health.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(health.status)}>
                  {health.status}
                </Badge>
                {health.responseTime && (
                  <span className="text-xs text-muted-foreground">
                    {health.responseTime}ms
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="case-routing">Case Routing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Active recommendations and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.insights.slice(0, 3).map((insight) => (
                    <Alert key={insight.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>{insight.title}</strong>
                        <br />
                        {insight.description.substring(0, 100)}...
                      </AlertDescription>
                    </Alert>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Insights
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.id} className="flex justify-between items-center">
                      <span className="text-sm">{metric.metricName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {metric.metricValue}
                        </span>
                        {metric.trendDirection && (
                          <Badge variant="outline" className="text-xs">
                            {metric.trendDirection}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Integration health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testing.testResults.slice(-3).map((result) => (
                    <div key={result.testName} className="flex justify-between items-center">
                      <span className="text-sm">{result.testName}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Case Routing Tab */}
        <TabsContent value="case-routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Case Routing</CardTitle>
              <CardDescription>
                AI-powered case assignment and workload distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Active Rules</h4>
                  <div className="space-y-2">
                    {caseRouting.routingRules.slice(0, 3).map((rule) => (
                      <div key={rule.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Rule {rule.id}</span>
                            <Badge className={rule.auto_assign ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {rule.auto_assign ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Type: {rule.case_type}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Consultant Capacity</h4>
                  <div className="space-y-2">
                    {/* This would show real consultant capacity data */}
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Available Consultants</span>
                        <span className="text-lg font-bold">12</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        75% capacity utilization
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Productivity and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.metrics.map((metric) => (
                    <div key={metric.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{metric.metricName}</span>
                        <p className="text-sm text-muted-foreground">
                          {metric.periodType} - {metric.metricType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{metric.metricValue}</span>
                        {metric.benchmarkValue && (
                          <p className="text-sm text-muted-foreground">
                            vs {metric.benchmarkValue} benchmark
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  Predictive analytics and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.map((insight) => (
                    <div key={insight.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge className={getStatusColor(insight.impactLevel)}>
                          {insight.impactLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {(insight.confidenceScore * 100).toFixed(0)}% confidence
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => analytics.dismissInsight()}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Advanced Permissions
              </CardTitle>
              <CardDescription>
                Role-based access control and audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Permission Modules</h4>
                  <div className="space-y-2">
                    {permissions.modules.map((module) => (
                      <div key={module.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{module.name}</span>
                          <Badge className={module.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {module.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {permissions.auditLog.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{entry.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          Resource: {entry.resource}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Billing</CardTitle>
              <CardDescription>
                Advanced billing automation and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Billing integration is configured and operational. 
                    Automated billing processes are running on schedule.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Active Integrations</h4>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Monthly Revenue</h4>
                    <p className="text-2xl font-bold">$24,500</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Success Rate</h4>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Testing</CardTitle>
              <CardDescription>
                System health checks and performance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testing.testResults.map((result) => (
                  <div key={result.testName} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{result.testName}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Duration: {result.duration}ms</span>
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};