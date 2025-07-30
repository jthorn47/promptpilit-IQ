import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, DollarSign, Target, Users, Mail, Activity } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("sales_summary");

  const metrics = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+15.2%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Lead Conversion",
      value: "24.8%",
      change: "+3.1%",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Active Deals",
      value: "87",
      change: "+12",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "New Leads",
      value: "156",
      change: "+8.7%",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const emailMetrics = [
    { metric: "Campaigns Sent", value: "24", period: "This Month" },
    { metric: "Total Emails", value: "12,450", period: "This Month" },
    { metric: "Open Rate", value: "32.4%", period: "Average" },
    { metric: "Click Rate", value: "4.2%", period: "Average" },
    { metric: "Bounce Rate", value: "2.1%", period: "Average" }
  ];

  const pipelineData = [
    { stage: "Lead", count: 156, value: "$520,000", winRate: "15%" },
    { stage: "Qualified", count: 67, value: "$380,000", winRate: "35%" },
    { stage: "Proposal", count: 34, value: "$285,000", winRate: "65%" },
    { stage: "Negotiation", count: 18, value: "$195,000", winRate: "80%" },
    { stage: "Closed Won", count: 12, value: "$124,500", winRate: "100%" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track performance metrics and generate insights
        </p>
      </div>

      {/* Date Range and Report Type Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales_summary">Sales Summary</SelectItem>
            <SelectItem value="lead_analysis">Lead Analysis</SelectItem>
            <SelectItem value="email_performance">Email Performance</SelectItem>
            <SelectItem value="revenue_forecast">Revenue Forecast</SelectItem>
          </SelectContent>
        </Select>

        <Button>Generate Report</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={cn("h-4 w-4", metric.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{metric.change}</span> from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Campaign Performance
            </CardTitle>
            <CardDescription>Email marketing metrics and engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{metric.metric}</p>
                  <p className="text-sm text-muted-foreground">{metric.period}</p>
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sales Pipeline Analysis
            </CardTitle>
            <CardDescription>Deals progression through sales stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineData.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stage.count} deals</Badge>
                    <span className="text-sm font-medium">{stage.value}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Win Rate: {stage.winRate}</span>
                  <span>Avg Deal: ${(parseInt(stage.value.replace(/[$,]/g, '')) / stage.count).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Targets</CardTitle>
          <CardDescription>Track progress against monthly and quarterly goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Revenue Target</span>
                <span className="text-sm">$150,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">$124,500 achieved (83%)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lead Conversion Target</span>
                <span className="text-sm">30%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">24.8% achieved (83%)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Leads Target</span>
                <span className="text-sm">200</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">156 achieved (78%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated analytics reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Q4 2024 Sales Performance</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 15, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Sales Summary</Badge>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email Campaign Analysis - November</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 1, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Email Performance</Badge>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Lead Conversion Deep Dive</p>
                <p className="text-sm text-muted-foreground">Generated on Nov 28, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Lead Analysis</Badge>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}