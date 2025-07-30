import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLMSReports } from '../hooks/useLMSReports';
import { useLMSMetrics } from '../hooks/useLMSMetrics';
import { 
  BarChart3, 
  Download, 
  Users, 
  BookOpen, 
  Award,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

export const LMSReportsPage: React.FC = () => {
  const { moduleReports, employeeReports, completionStats, isLoading, error } = useLMSReports();
  const { metrics } = useLMSMetrics();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading LMS reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading LMS reports</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">LMS Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for your learning management system
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionStats?.totalEmployees || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionStats?.totalModules || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionStats?.totalCertificates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionStats?.completionRate ? `${completionStats.completionRate.toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Module Reports</TabsTrigger>
          <TabsTrigger value="employees">Employee Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Module Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleReports.map((module) => (
                  <div key={module.moduleId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{module.moduleTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.assignmentCount} assignments • {module.completionCount} completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{module.completionRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        Avg Score: {module.averageScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {moduleReports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No module data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeReports.map((employee) => (
                  <div key={employee.employeeId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{employee.employeeName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employee.completedModules}/{employee.assignedModules} modules completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{employee.completionRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.certificatesEarned} certificates
                      </div>
                    </div>
                  </div>
                ))}
                {employeeReports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No employee data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Training Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Training analytics chart would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Completion Time</span>
                    <span className="font-semibold">
                      {employeeReports.reduce((sum, emp) => sum + emp.totalTimeSpent, 0) / (employeeReports.length || 1)} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Score</span>
                    <span className="font-semibold">
                      {employeeReports.reduce((sum, emp) => sum + emp.averageScore, 0) / (employeeReports.length || 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Assignments</span>
                    <span className="font-semibold">{completionStats?.totalAssignments || 0}</span>
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