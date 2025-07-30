import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Users,
  Target,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  case_id: string;
  cases?: {
    title: string;
    type: string;
    priority: string;
  };
}

interface Trend {
  id: string;
  trend_type: string;
  current_value: number;
  baseline_value: number;
  variance_percentage: number;
  confidence_score: number;
  status: string;
  case_type?: string;
  case_count?: number;
  trend_details: any;
  company_settings?: {
    company_name: string;
  };
}

interface Metrics {
  cases_created: number;
  cases_resolved: number;
  avg_response_time: number;
  avg_resolution_time: number;
  response_sla_met: number;
  response_sla_total: number;
  resolution_sla_met: number;
  resolution_sla_total: number;
  open_case_count: number;
  overdue_case_count: number;
}

interface AutoTag {
  id: string;
  suggested_tag: string;
  confidence_score: number;
  auto_applied: boolean;
  review_decision?: string;
  cases?: {
    title: string;
    description: string;
  };
}

export const CaseIntelligenceDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [autoTags, setAutoTags] = useState<AutoTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data until proper database schema is implemented
      console.log('CaseIntelligenceDashboard: Using mock data until database schema is ready');
      
      // Mock alerts data
      const mockAlerts: Alert[] = [
        {
          id: '1',
          alert_type: 'sla_breach',
          severity: 'high',
          title: 'SLA Breach Alert',
          message: 'Case #123 has exceeded response time SLA',
          status: 'active',
          created_at: new Date().toISOString(),
          case_id: 'case1',
          cases: {
            title: 'Payroll Issue',
            type: 'payroll',
            priority: 'high'
          }
        }
      ];

      // Mock trends data
      const mockTrends: Trend[] = [
        {
          id: '1',
          trend_type: 'volume_spike',
          current_value: 25,
          baseline_value: 15,
          variance_percentage: 66.7,
          confidence_score: 0.85,
          status: 'active',
          case_type: 'hr',
          case_count: 10,
          trend_details: {},
          company_settings: {
            company_name: 'Acme Corp'
          }
        }
      ];

      // Mock metrics data
      const mockMetrics: Metrics = {
        cases_created: 12,
        cases_resolved: 8,
        avg_response_time: 2.5,
        avg_resolution_time: 24.3,
        response_sla_met: 9,
        response_sla_total: 12,
        resolution_sla_met: 7,
        resolution_sla_total: 8,
        open_case_count: 15,
        overdue_case_count: 3
      };

      // Mock auto-tags data
      const mockAutoTags: AutoTag[] = [
        {
          id: '1',
          suggested_tag: 'payroll-benefits',
          confidence_score: 0.92,
          auto_applied: false,
          review_decision: undefined,
          cases: {
            title: 'Benefits Question',
            description: 'Employee asking about health insurance coverage'
          }
        }
      ];

      setAlerts(mockAlerts);
      setTrends(mockTrends);
      setMetrics(mockMetrics);
      setAutoTags(mockAutoTags);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      // TODO: Implement proper alert acknowledgment when database schema is ready
      console.log('Alert acknowledgment attempted for:', alertId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleAcknowledgeTrend = async (trendId: string) => {
    try {
      // TODO: Implement proper trend acknowledgment when database schema is ready
      console.log('Trend acknowledgment attempted for:', trendId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error acknowledging trend:', error);
    }
  };

  const handleAutoTagReview = async (autoTagId: string, decision: 'approved' | 'rejected') => {
    try {
      // TODO: Implement proper auto-tag review when database schema is ready
      console.log('Auto-tag review attempted:', { autoTagId, decision });
      fetchDashboardData();
    } catch (error) {
      console.error('Error reviewing auto-tag:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/80 text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSLAPercentage = (met: number, total: number) => {
    return total > 0 ? Math.round((met / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response SLA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? getSLAPercentage(metrics.response_sla_met, metrics.response_sla_total) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.response_sla_met || 0} of {metrics?.response_sla_total || 0} met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution SLA</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? getSLAPercentage(metrics.resolution_sla_met, metrics.resolution_sla_total) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.resolution_sla_met || 0} of {metrics?.resolution_sla_total || 0} met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_response_time ? `${metrics.avg_response_time.toFixed(1)}h` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Today's average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends ({trends.length})
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Auto-Tags ({autoTags.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>
                SLA breaches, idle cases, and escalations requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active alerts</p>
              ) : (
                alerts.map((alert) => (
                  <Alert key={alert.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>{alert.message}</p>
                        {alert.cases && (
                          <p className="text-sm">
                            Case: {alert.cases.title} ({alert.cases.type} - {alert.cases.priority})
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Client Trends & Patterns
              </CardTitle>
              <CardDescription>
                Unusual case volume spikes and repeated issues detected by AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trends.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trends detected</p>
              ) : (
                trends.map((trend) => (
                  <div key={trend.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {trend.company_settings?.company_name || 'Unknown Company'}
                        </h4>
                        <Badge variant="outline">
                          {trend.trend_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeTrend(trend.id)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="font-medium">{trend.current_value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Baseline</p>
                        <p className="font-medium">{trend.baseline_value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variance</p>
                        <p className="font-medium text-destructive">
                          +{trend.variance_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {trend.case_type && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Issue Type:</span> {trend.case_type}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress 
                        value={trend.confidence_score * 100} 
                        className="flex-1 max-w-32" 
                      />
                      <span className="text-sm">{(trend.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Auto-Tag Suggestions
              </CardTitle>
              <CardDescription>
                AI-powered case categorization suggestions awaiting review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {autoTags.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No suggestions pending review</p>
              ) : (
                autoTags.map((autoTag) => (
                  <div key={autoTag.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{autoTag.cases?.title}</h4>
                        <Badge variant="secondary">{autoTag.suggested_tag}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAutoTagReview(autoTag.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAutoTagReview(autoTag.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress 
                        value={autoTag.confidence_score * 100} 
                        className="flex-1 max-w-32" 
                      />
                      <span className="text-sm">{(autoTag.confidence_score * 100).toFixed(0)}%</span>
                    </div>

                    {autoTag.cases?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {autoTag.cases.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Today's Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-primary">
                      {metrics?.cases_created || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Created</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-success">
                      {metrics?.cases_resolved || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Load
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">
                      {metrics?.open_case_count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Open Cases</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-destructive">
                      {metrics?.overdue_case_count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};