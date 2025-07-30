import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  FileText,
  Calendar,
  Users,
  Target,
  Activity,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PulseReportsQA } from '@/components/pulse/PulseReportsQA';
import { PulseSystemTest } from '@/components/pulse/PulseSystemTest';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const reportConfigs = [
  {
    title: "Case Resolution Trends",
    slug: "case-resolution-trends",
    description: "Track resolution time trends, SLA compliance, and performance across case types and clients.",
    icon: BarChart3,
    metrics: ["Average Resolution Time", "SLA Compliance Rate", "Case Volume Trends"],
    color: "hsl(var(--chart-1))"
  },
  {
    title: "Compliance Dashboard", 
    slug: "compliance-dashboard",
    description: "Monitor adherence to policies and legal mandates. Flag missing documentation, overdue steps, and non-compliant outcomes.",
    icon: Shield,
    metrics: ["Compliance Rate", "Documentation Flags", "Policy Violations"],
    color: "hsl(var(--chart-2))"
  },
  {
    title: "Risk Assessment Report",
    slug: "risk-assessment", 
    description: "Surface high-risk cases, repeat violators, and systemic issues based on risk scoring, overdue actions, and policy tags.",
    icon: AlertTriangle,
    metrics: ["High-Risk Cases", "Repeat Offenders", "Risk Score Analysis"],
    color: "hsl(var(--chart-3))"
  },
  {
    title: "Performance Analytics",
    slug: "performance-analytics",
    description: "Evaluate team efficiency, case throughput, task completion, and SLA performance at the user level.",
    icon: TrendingUp,
    metrics: ["Task Completion Rate", "User Performance", "Team Efficiency"],
    color: "hsl(var(--chart-4))"
  },
  {
    title: "Resource Utilization",
    slug: "resource-utilization",
    description: "Measure workload distribution and time investment across clients, cases, and users. Detect overuse and optimize staffing.",
    icon: Clock,
    metrics: ["Workload Distribution", "Time Investment", "Capacity Planning"],
    color: "hsl(var(--chart-5))"
  }
];

export const PulseReportsPage = () => {
  const navigate = useNavigate();
  const [showQA, setShowQA] = useState(false);
  const [showSystemTest, setShowSystemTest] = useState(false);

  const handleNavigateToReport = (slug: string) => {
    navigate(`/admin/pulse/reports/${slug}`);
  };

  return (
    <StandardPageLayout
      title="Pulse CMS Reports"  
      subtitle="Comprehensive analytics and insights for case management operations"
      headerActions={
        <div className="flex items-center gap-4">
          <Dialog open={showSystemTest} onOpenChange={setShowSystemTest}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Run System Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <PulseSystemTest />
            </DialogContent>
          </Dialog>
          <Dialog open={showQA} onOpenChange={setShowQA}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                QA Validation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <PulseReportsQA />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-6">

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportConfigs.length}</div>
            <p className="text-xs text-muted-foreground">Available report types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">Currently being tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Case managers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">Overall compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportConfigs.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.slug} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${report.color}20` }}
                    >
                      <IconComponent 
                        className="h-5 w-5" 
                        style={{ color: report.color }}
                      />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Metrics:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {report.metrics.map((metric, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => handleNavigateToReport(report.slug)}
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  style={{ backgroundColor: report.color }}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Features */}
      <Card>
        <CardHeader>
          <CardTitle>Report Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">PDF Export</div>
                <div className="text-sm text-muted-foreground">Professional reports</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Interactive Charts</div>
                <div className="text-sm text-muted-foreground">Dynamic visualizations</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Date Filtering</div>
                <div className="text-sm text-muted-foreground">Custom time ranges</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium">Multi-level Access</div>
                <div className="text-sm text-muted-foreground">Role-based viewing</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </StandardPageLayout>
  );
};