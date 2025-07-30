import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";

export default function ReportsManager() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  const reports = [
    {
      id: "earnings",
      name: "Earnings Report",
      description: "Detailed breakdown of commission earnings",
      icon: DollarSign,
      lastGenerated: "2 hours ago",
      status: "ready"
    },
    {
      id: "placements",
      name: "Placement Summary",
      description: "All successful placements and their details",
      icon: Users,
      lastGenerated: "1 day ago",
      status: "ready"
    },
    {
      id: "performance",
      name: "Performance Analytics",
      description: "KPIs and performance metrics",
      icon: TrendingUp,
      lastGenerated: "3 days ago",
      status: "ready"
    },
    {
      id: "client-activity",
      name: "Client Activity Report",
      description: "Client engagement and job order history",
      icon: FileText,
      lastGenerated: "5 days ago",
      status: "generating"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case "generating":
        return <Badge className="bg-yellow-100 text-yellow-800">Generating</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive business reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,250</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              8 filled this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +4 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate and download business reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last generated: {report.lastGenerated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={report.status === "generating"}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Time to Fill</span>
              <span className="font-medium">8.5 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Client Retention Rate</span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Candidate Show Rate</span>
              <span className="font-medium">87%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">90-Day Retention</span>
              <span className="font-medium">78%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Schedule</CardTitle>
            <CardDescription>Automated report delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">Every Monday at 9 AM</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Earnings</p>
                <p className="text-sm text-muted-foreground">1st of each month</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Quarterly Review</p>
                <p className="text-sm text-muted-foreground">End of each quarter</p>
              </div>
              <Badge variant="secondary">Paused</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}