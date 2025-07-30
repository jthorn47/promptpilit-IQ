/**
 * ComplianceDashboardTab - Visual dashboard for client compliance health
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar,
  BarChart3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ComplianceDashboardService, 
  ComplianceDashboardData 
} from '@/modules/HaaLO.TimeTrack/services/ComplianceDashboardService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ComplianceDashboardTabProps {
  clientId: string;
}

export const ComplianceDashboardTab: React.FC<ComplianceDashboardTabProps> = ({ clientId }) => {
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [clientId]);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await ComplianceDashboardService.getClientComplianceDashboard(clientId);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading compliance dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading compliance dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No compliance data available</p>
      </div>
    );
  }

  const riskLevel = ComplianceDashboardService.getRiskLevel(dashboardData.riskScore);
  const chartColors = ['#655DC6', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Compliance Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Real-time view of time tracking compliance health
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Risk Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Risk Score Summary
          </CardTitle>
          <CardDescription>
            Overall compliance health score based on time tracking behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compliance Score</span>
                <span className={`text-lg font-bold ${riskLevel.color}`}>
                  {dashboardData.riskScore}/100
                </span>
              </div>
              <Progress 
                value={dashboardData.riskScore} 
                className="h-3 mb-2" 
              />
              <div className="flex items-center gap-2">
                <Badge 
                  variant={dashboardData.riskScore >= 70 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {riskLevel.level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {riskLevel.description}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${riskLevel.color} mb-1`}>
                {dashboardData.riskScore >= 70 ? (
                  <CheckCircle className="h-12 w-12 mx-auto" />
                ) : (
                  <AlertTriangle className="h-12 w-12 mx-auto" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Snapshot
          </CardTitle>
          <CardDescription>
            Current week compliance metrics and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {dashboardData.summary.overtimeCount}
              </div>
              <div className="text-xs text-muted-foreground">Overtime Employees</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {dashboardData.summary.doubletimeCount}
              </div>
              <div className="text-xs text-muted-foreground">Doubletime Employees</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {dashboardData.summary.alertsCount}
              </div>
              <div className="text-xs text-muted-foreground">Compliance Alerts</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(dashboardData.summary.submissionRate)}%
              </div>
              <div className="text-xs text-muted-foreground">On-time Submissions</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {dashboardData.summary.flaggedEntries} of {dashboardData.summary.totalEntries} entries flagged
            </span>
            <Badge 
              variant={dashboardData.summary.flaggedEntries === 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {dashboardData.summary.flaggedEntries === 0 ? 'All Clear' : 'Needs Attention'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overtime Hours Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overtime Hours Trend</CardTitle>
            <CardDescription>Last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.trends.overtimeHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`${value} hours`, 'Overtime']}
                  labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#655DC6" 
                  strokeWidth={2}
                  dot={{ fill: '#655DC6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Score Trend</CardTitle>
            <CardDescription>Last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.trends.complianceScore}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value}/100`, 'Score']}
                  labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alerts by Type</CardTitle>
          <CardDescription>Current week breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.trends.alertsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#655DC6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actionable Insights
          </CardTitle>
          <CardDescription>
            Recent violations and suggested actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.insights.map((insight) => (
              <div 
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'error' ? 'border-red-500 bg-red-50' :
                  insight.type === 'warning' ? 'border-amber-500 bg-amber-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <p className="text-sm font-medium">
                      💡 {insight.action}
                    </p>
                  </div>
                  {insight.type === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                  ) : insight.type === 'warning' ? (
                    <Clock className="h-5 w-5 text-amber-500 mt-1" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-1" />
                  )}
                </div>
              </div>
            ))}
            
            {dashboardData.insights.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No compliance issues detected. Great job!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};