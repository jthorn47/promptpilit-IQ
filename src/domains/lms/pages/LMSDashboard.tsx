import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLMSMetrics } from '../hooks/useLMSMetrics';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

export const LMSDashboard: React.FC = () => {
  const { metrics, isLoading, error } = useLMSMetrics();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading LMS dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading LMS data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">LMS Dashboard</h2>
        <p className="text-muted-foreground">
          Manage training modules, assignments, and track learning progress
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalModules || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.activeModules || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.completedAssignments || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCertificates || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.activeCertificates || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.completionRate ? `${metrics.completionRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average score: {metrics?.averageScore ? `${metrics.averageScore.toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <button className="text-left text-sm text-blue-600 hover:underline">
                Create New Training Module
              </button>
              <button className="text-left text-sm text-blue-600 hover:underline">
                Assign Training to Employees
              </button>
              <button className="text-left text-sm text-blue-600 hover:underline">
                Generate Certificates
              </button>
              <button className="text-left text-sm text-blue-600 hover:underline">
                View Detailed Reports
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};