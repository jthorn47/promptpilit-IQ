import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePayrollMetrics } from "@/hooks/usePayrollMetrics";
import { usePayrollReadiness } from "@/hooks/usePayrollReadiness";
import { PayrollReadinessAlert } from "@/components/payroll/PayrollReadinessAlert";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { PayrollAssistant } from "@/components/payroll/PayrollAssistant";
import { PayrollAssistantProvider, usePayrollAssistant } from "@/contexts/PayrollAssistantContext";
import { 
  Users, 
  Building, 
  Calculator, 
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  BarChart3,
  Bell,
  Shield,
  Settings,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Target,
  PieChart
} from "lucide-react";

const PayrollDashboardContent = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { metrics, departmentStats, recentActivity, loading } = usePayrollMetrics();
  const { updateContext } = usePayrollAssistant();
  
  // Sample company ID - in real app, this would come from context/route
  const companyId = "bc172f1c-e102-4a76-945a-c1de29e9f34c";
  const { data: readinessData, loading: readinessLoading } = usePayrollReadiness(companyId);

  useEffect(() => {
    updateContext({
      currentPage: 'Payroll Dashboard',
      activeIssues: 3, // Would come from real data
      recentActions: ['Viewed dashboard', 'Checked metrics']
    });
  }, [updateContext]);

  // Only Super Admins can access this dashboard
  if (!hasRole('super_admin')) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Super Admins can access the Payroll Oversight Dashboard.</p>
          <p className="text-xs text-muted-foreground mt-2">Current user: {user?.email}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Oversight Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Dashboard' }
  ];

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Payroll Oversight Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive payroll management and monitoring</p>
        </div>
        <Button onClick={() => navigate('/company')} className="flex items-center gap-2 w-fit">
          <Settings className="h-4 w-4" />
          <span>Platform Settings</span>
        </Button>
      </div>


      {/* Payroll Readiness Alert */}
      {!readinessLoading && readinessData && (
        <PayrollReadinessAlert data={readinessData} companyId={companyId} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients with Payroll</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clientsWithPayroll}</div>
            <p className="text-xs text-muted-foreground">Clients with payroll</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payrolls Today</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.payrollsToday}</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payrolls This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.payrollsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Employees/Client</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEmployeesPerClient}</div>
            <p className="text-xs text-muted-foreground">Average ratio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPayrollEmployees}</div>
            <p className="text-xs text-muted-foreground">Payroll employees</p>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Payroll management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/admin/payroll/processing')}
            >
              <Calculator className="h-6 w-6" />
              <span className="text-sm">Process Payroll</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/manager')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Employees</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/pay-types')}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Pay Types</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/benefits')}
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm">Benefits</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Payroll system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'processing' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Department Statistics
            </CardTitle>
            <CardDescription>Payroll breakdown by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No department data available</p>
              ) : (
                departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{dept.clientName}</p>
                      <p className="text-xs text-muted-foreground">{dept.employeeCount} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${dept.avgPay.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">avg pay</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <PayrollAssistant />
    </>
  );
};

export const PayrollDashboard = () => {
  return (
    <PayrollAssistantProvider>
      <PayrollDashboardContent />
    </PayrollAssistantProvider>
  );
};