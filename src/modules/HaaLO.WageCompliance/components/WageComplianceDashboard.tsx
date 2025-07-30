/**
 * WageComplianceDashboard - Main dashboard for wage compliance monitoring
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  Scale,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { useWageCompliance, useWageChecks, useOvertimeViolations } from '../hooks/useWageCompliance';
import { MinimumWageTracker } from './MinimumWageTracker';
import { OvertimeComplianceView } from './OvertimeComplianceView';

export const WageComplianceDashboard: React.FC = () => {
  const { dashboardData, loading, error, refreshData } = useWageCompliance();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load compliance data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 50) return { label: 'Needs Attention', variant: 'destructive' as const };
    return { label: 'Critical', variant: 'destructive' as const };
  };

  const status = getComplianceStatus(dashboardData.overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wage & Hour Compliance</h1>
          <p className="text-muted-foreground">
            Monitor compliance with federal, state, and local wage and hour laws
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${getScoreColor(dashboardData.overallScore)}`}>
                {dashboardData.overallScore}%
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <Progress value={dashboardData.overallScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.totalViolations}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.activeAlerts} alerts requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees at Risk</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.employeesAtRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring wage or hour adjustments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +2.3%
            </div>
            <p className="text-xs text-muted-foreground">
              Improvement over last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {dashboardData.recentFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Recent Compliance Findings
            </CardTitle>
            <CardDescription>
              Issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentFindings.map((finding, index) => (
              <Alert key={index} variant={finding.severity === 'high' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{finding.description}</strong>
                      <p className="text-sm mt-1">{finding.recommendedFix}</p>
                    </div>
                    <Badge variant={finding.severity === 'high' ? 'destructive' : 'secondary'}>
                      {finding.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Views */}
      <Tabs defaultValue="minimum-wage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="minimum-wage">Minimum Wage</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
          <TabsTrigger value="classification">FLSA Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="minimum-wage" className="space-y-4">
          <MinimumWageTracker />
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          <OvertimeComplianceView />
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Break & Meal Period Compliance</CardTitle>
              <CardDescription>
                Monitor required rest and meal breaks by jurisdiction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Break compliance tracking coming soon</p>
                <p className="text-sm">Integration with time tracking systems in development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FLSA Employee Classification</CardTitle>
              <CardDescription>
                Ensure proper exempt/non-exempt classification under Fair Labor Standards Act
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>FLSA classification wizard coming soon</p>
                <p className="text-sm">Interactive assessment tool in development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};