import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Download, Plus, CalendarIcon, Clock, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function ReportsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState("all");

  const reports = [
    {
      id: "1",
      name: "Q4 2024 Sales Performance",
      type: "sales_summary",
      dateRange: "Oct 1, 2024 - Dec 31, 2024",
      generatedAt: "2024-12-15T10:30:00Z",
      generatedBy: "John Smith",
      status: "completed",
      dataPoints: 1247
    },
    {
      id: "2",
      name: "Email Campaign Analysis - November",
      type: "email_performance",
      dateRange: "Nov 1, 2024 - Nov 30, 2024",
      generatedAt: "2024-12-01T14:22:00Z",
      generatedBy: "Sarah Johnson",
      status: "completed",
      dataPoints: 856
    },
    {
      id: "3",
      name: "Lead Conversion Deep Dive",
      type: "lead_analysis",
      dateRange: "Sep 1, 2024 - Nov 30, 2024",
      generatedAt: "2024-11-28T09:15:00Z",
      generatedBy: "Mike Davis",
      status: "completed",
      dataPoints: 2134
    },
    {
      id: "4",
      name: "Revenue Forecast - 2025 Q1",
      type: "revenue_forecast",
      dateRange: "Dec 1, 2024 - Mar 31, 2025",
      generatedAt: "2024-12-20T16:45:00Z",
      generatedBy: "Emily Chen",
      status: "processing",
      dataPoints: 0
    }
  ];

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "sales_summary": return "Sales Summary";
      case "email_performance": return "Email Performance";
      case "lead_analysis": return "Lead Analysis";
      case "revenue_forecast": return "Revenue Forecast";
      default: return type;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "processing": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const filteredReports = reports.filter(report => 
    filterType === "all" || report.type === filterType
  );

  const handleCreateReport = () => {
    // Handle report creation logic
    console.log("Creating report:", { reportName, reportType, dateRange });
    setIsCreateDialogOpen(false);
    setReportName("");
    setReportType("");
    setDateRange(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Manager</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage analytics reports
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Generate a new analytics report with custom parameters
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_summary">Sales Summary</SelectItem>
                    <SelectItem value="lead_analysis">Lead Analysis</SelectItem>
                    <SelectItem value="email_performance">Email Performance</SelectItem>
                    <SelectItem value="revenue_forecast">Revenue Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={!reportName || !reportType}>
                Create Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label>Filter by type:</Label>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="sales_summary">Sales Summary</SelectItem>
            <SelectItem value="lead_analysis">Lead Analysis</SelectItem>
            <SelectItem value="email_performance">Email Performance</SelectItem>
            <SelectItem value="revenue_forecast">Revenue Forecast</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>
                    {getReportTypeLabel(report.type)} • {report.dateRange}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(report.status)}>
                    {report.status}
                  </Badge>
                  {report.status === "completed" && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Generated {format(new Date(report.generatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                  <span>by {report.generatedBy}</span>
                </div>
                {report.dataPoints > 0 && (
                  <span>{report.dataPoints.toLocaleString()} data points</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground">
                {filterType === "all" 
                  ? "Create your first report to get started"
                  : `No ${getReportTypeLabel(filterType).toLowerCase()} reports found`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}