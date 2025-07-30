import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText,
  Clock,
  DollarSign,
  Activity,
  Plus,
  Bell,
  Calendar,
  BarChart3
} from "lucide-react";
import { CompXClaimsModule } from "@/components/compx/CompXClaimsModule";
import { CompXIncidentsModule } from "@/components/compx/CompXIncidentsModule";
import { CompXSafetyModule } from "@/components/compx/CompXSafetyModule";
import { CompXComplianceModule } from "@/components/compx/CompXComplianceModule";
import { CompXAnalyticsModule } from "@/components/compx/CompXAnalyticsModule";
import { CompXPoliciesModule } from "@/components/compx/CompXPoliciesModule";

const CompXDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for dashboard metrics
  const metrics = {
    totalClaims: 24,
    openClaims: 8,
    totalCosts: 125000,
    incidentRate: 2.3,
    safetyScore: 87,
    complianceScore: 92
  };

  const recentClaims = [
    { id: "WC-2024-001", employee: "John Smith", type: "Medical Only", status: "Open", date: "2024-01-15" },
    { id: "WC-2024-002", employee: "Sarah Johnson", type: "Lost Time", status: "Closed", date: "2024-01-10" },
    { id: "WC-2024-003", employee: "Mike Davis", type: "Medical Only", status: "Under Review", date: "2024-01-08" }
  ];

  const upcomingTasks = [
    { task: "Safety Training - Warehouse Team", due: "2024-01-20", priority: "High" },
    { task: "Policy Renewal - ABC Insurance", due: "2024-02-01", priority: "Medium" },
    { task: "Compliance Audit Review", due: "2024-01-25", priority: "High" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            CompX
          </h1>
          <p className="text-muted-foreground">
            Workers' Compensation Management System
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClaims}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openClaims}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalCosts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Year to date
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incident Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.incidentRate}</div>
                <p className="text-xs text-muted-foreground">
                  Per 100 employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.safetyScore}%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last quarter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
                <p className="text-xs text-muted-foreground">
                  All requirements met
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Claims
                </CardTitle>
                <CardDescription>
                  Latest workers' compensation claims filed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{claim.id}</div>
                        <div className="text-sm text-muted-foreground">{claim.employee}</div>
                        <div className="text-xs text-muted-foreground">{claim.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{claim.type}</div>
                        <Badge variant={claim.status === 'Open' ? 'destructive' : claim.status === 'Closed' ? 'default' : 'secondary'}>
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Claims
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  Important deadlines and action items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{task.task}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {task.due}
                        </div>
                      </div>
                      <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <CompXClaimsModule />
        </TabsContent>

        <TabsContent value="incidents">
          <CompXIncidentsModule />
        </TabsContent>

        <TabsContent value="safety">
          <CompXSafetyModule />
        </TabsContent>

        <TabsContent value="compliance">
          <CompXComplianceModule />
        </TabsContent>

        <TabsContent value="analytics">
          <CompXAnalyticsModule />
        </TabsContent>

        <TabsContent value="policies">
          <CompXPoliciesModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompXDashboard;