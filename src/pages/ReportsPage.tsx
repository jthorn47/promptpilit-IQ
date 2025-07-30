import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Plus,
  Users,
  Building2,
  DollarSign,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportsPage = () => {
  const reportCategories = [
    {
      title: 'Analytics Reports',
      description: 'Business intelligence and data analytics',
      icon: BarChart3,
      reports: ['User Engagement', 'Performance Metrics', 'Growth Analysis'],
      color: 'bg-blue-500'
    },
    {
      title: 'Financial Reports',
      description: 'Revenue, expenses, and financial summaries',
      icon: DollarSign,
      reports: ['Monthly Revenue', 'Expense Analysis', 'Profit & Loss'],
      color: 'bg-green-500'
    },
    {
      title: 'User Reports',
      description: 'User activity and management reports',
      icon: Users,
      reports: ['User Activity', 'Registration Trends', 'Access Logs'],
      color: 'bg-purple-500'
    },
    {
      title: 'Company Reports',
      description: 'Company performance and management data',
      icon: Building2,
      reports: ['Company Overview', 'Department Analysis', 'Resource Usage'],
      color: 'bg-orange-500'
    },
    {
      title: 'Time Reports',
      description: 'Time tracking and productivity analysis',
      icon: Clock,
      reports: ['Time Tracking', 'Productivity Metrics', 'Schedule Analysis'],
      color: 'bg-indigo-500'
    },
    {
      title: 'Custom Reports',
      description: 'Build and manage custom report templates',
      icon: FileText,
      reports: ['Report Builder', 'Saved Templates', 'Scheduled Reports'],
      color: 'bg-gray-500'
    }
  ];

  const recentReports = [
    {
      name: 'Monthly User Engagement Report',
      type: 'Analytics',
      generated: '2 hours ago',
      status: 'Ready',
      size: '2.3 MB'
    },
    {
      name: 'Q4 Financial Summary',
      type: 'Financial',
      generated: '1 day ago', 
      status: 'Ready',
      size: '1.8 MB'
    },
    {
      name: 'Company Performance Report',
      type: 'Company',
      generated: '3 days ago',
      status: 'Ready',
      size: '3.1 MB'
    },
    {
      name: 'Weekly Time Tracking Summary',
      type: 'Time',
      generated: '5 days ago',
      status: 'Ready',
      size: '890 KB'
    }
  ];

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate, view, and manage your business reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-green-600">+8 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Generated Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-blue-600">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 GB</div>
            <p className="text-xs text-muted-foreground">of 10 GB limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.reports.map((report) => (
                    <div key={report} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">{report}</span>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Reports
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your recently generated reports</CardDescription>
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Type: {report.type}</span>
                      <span>Generated: {report.generated}</span>
                      <span>Size: {report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {report.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>View interactive analytics and charts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/admin/analytics">Open Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <PieChart className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Report Builder</CardTitle>
            <CardDescription>Create custom reports with our builder</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Build Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Trends Analysis</CardTitle>
            <CardDescription>Analyze trends and patterns in your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Trends
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;