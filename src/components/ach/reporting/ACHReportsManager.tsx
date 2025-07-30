import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users, Activity, AlertCircle } from "lucide-react";
import { ACHAnalyticsDashboard } from "./ACHAnalyticsDashboard";
import { ACHAuditTrail } from "./ACHAuditTrail";
import { ACHTransactionHistory } from "./ACHTransactionHistory";

export const ACHReportsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const reports = [
    {
      id: "batch-summary",
      name: "Batch Processing Summary",
      description: "Complete overview of all ACH batches and their status",
      icon: FileText,
      lastGenerated: "2 hours ago",
      status: "ready",
      count: 47
    },
    {
      id: "transaction-details",
      name: "Transaction Details Report",
      description: "Individual transaction breakdowns with employee details",
      icon: DollarSign,
      lastGenerated: "1 day ago",
      status: "ready",
      count: 1247
    },
    {
      id: "compliance-audit",
      name: "Compliance & Audit Trail",
      description: "Full audit log for regulatory compliance",
      icon: AlertCircle,
      lastGenerated: "3 days ago",
      status: "ready",
      count: 324
    },
    {
      id: "error-analysis",
      name: "Error & Return Analysis",
      description: "Analysis of failed transactions and return reasons",
      icon: Activity,
      lastGenerated: "5 days ago",
      status: "generating",
      count: 23
    },
    {
      id: "performance-metrics",
      name: "Performance Metrics",
      description: "Processing times, success rates, and efficiency metrics",
      icon: TrendingUp,
      lastGenerated: "1 week ago",
      status: "ready",
      count: 89
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ready</Badge>;
      case "generating":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Generating</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const quickStats = [
    {
      title: "Total Processed",
      value: "$2,847,392",
      change: "+12.5%",
      icon: DollarSign,
      positive: true
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: "+0.3%",
      icon: TrendingUp,
      positive: true
    },
    {
      title: "Active Employees",
      value: "1,247",
      change: "+23",
      icon: Users,
      positive: true
    },
    {
      title: "Failed Transactions",
      value: "16",
      change: "-8",
      icon: AlertCircle,
      positive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ACH Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and data insights for ACH operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download comprehensive ACH reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter(report => selectedStatus === 'all' || report.status === selectedStatus)
                  .map((report) => {
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
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Last generated: {report.lastGenerated}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Records: {report.count}
                              </p>
                            </div>
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
                            Export
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <ACHAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="transactions">
          <ACHTransactionHistory />
        </TabsContent>

        <TabsContent value="audit">
          <ACHAuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
};