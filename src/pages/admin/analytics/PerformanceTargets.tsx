import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Plus, CalendarIcon, TrendingUp, DollarSign, Users, Mail, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function PerformanceTargets() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [targetName, setTargetName] = useState("");
  const [targetType, setTargetType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const targets = [
    {
      id: "1",
      name: "Q1 2025 Revenue Target",
      type: "revenue",
      value: 450000,
      currentValue: 124500,
      period: "Q1 2025",
      periodStart: "2025-01-01",
      periodEnd: "2025-03-31",
      assignedTo: "Sales Team",
      status: "active",
      progress: 28
    },
    {
      id: "2",
      name: "Monthly Lead Generation",
      type: "leads",
      value: 200,
      currentValue: 156,
      period: "December 2024",
      periodStart: "2024-12-01",
      periodEnd: "2024-12-31",
      assignedTo: "Marketing Team",
      status: "active",
      progress: 78
    },
    {
      id: "3",
      name: "Conversion Rate Target",
      type: "conversions",
      value: 30,
      currentValue: 24.8,
      period: "Q4 2024",
      periodStart: "2024-10-01",
      periodEnd: "2024-12-31",
      assignedTo: "John Smith",
      status: "active",
      progress: 83
    },
    {
      id: "4",
      name: "Email Campaign Engagement",
      type: "activities",
      value: 35,
      currentValue: 32.4,
      period: "December 2024",
      periodStart: "2024-12-01",
      periodEnd: "2024-12-31",
      assignedTo: "Sarah Johnson",
      status: "completed",
      progress: 93
    }
  ];

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "revenue": return DollarSign;
      case "leads": return Users;
      case "conversions": return TrendingUp;
      case "activities": return Mail;
      default: return Target;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case "revenue":
        return `$${value.toLocaleString()}`;
      case "conversions":
      case "activities":
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const handleCreateTarget = () => {
    console.log("Creating target:", { targetName, targetType, targetValue, assignedTo, dateRange });
    setIsCreateDialogOpen(false);
    setTargetName("");
    setTargetType("");
    setTargetValue("");
    setAssignedTo("");
    setDateRange(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Targets</h1>
          <p className="text-muted-foreground">
            Set and track performance goals for teams and individuals
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Set Target
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Performance Target</DialogTitle>
              <DialogDescription>
                Create a new performance target with specific goals and timelines
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="target-name">Target Name</Label>
                <Input
                  id="target-name"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="Enter target name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-type">Target Type</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="leads">Lead Generation</SelectItem>
                    <SelectItem value="conversions">Conversion Rate</SelectItem>
                    <SelectItem value="activities">Activity Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-value">Target Value</Label>
                <Input
                  id="target-value"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Enter target value"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales-team">Sales Team</SelectItem>
                    <SelectItem value="marketing-team">Marketing Team</SelectItem>
                    <SelectItem value="john-smith">John Smith</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="mike-davis">Mike Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Period</Label>
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
                        <span>Pick target period</span>
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
              <Button onClick={handleCreateTarget} disabled={!targetName || !targetType || !targetValue}>
                Set Target
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Targets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {targets.map((target) => {
          const Icon = getTargetIcon(target.type);
          return (
            <Card key={target.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {target.name}
                    </CardTitle>
                    <CardDescription>
                      {target.period} • Assigned to {target.assignedTo}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(target.status)}>
                      {target.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{target.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min(target.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Current: {formatValue(target.type, target.currentValue)}
                    </span>
                    <span className="font-medium">
                      Target: {formatValue(target.type, target.value)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targets.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targets.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(targets.reduce((sum, t) => sum + t.progress, 0) / targets.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all targets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targets.filter(t => t.progress >= 75).length}
            </div>
            <p className="text-xs text-muted-foreground">
              75% or higher progress
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}