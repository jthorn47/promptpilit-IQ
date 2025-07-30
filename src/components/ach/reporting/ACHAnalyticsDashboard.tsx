import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export const ACHAnalyticsDashboard = () => {
  // Mock data for charts
  const batchVolumeData = [
    { month: 'Jan', batches: 45, amount: 245000 },
    { month: 'Feb', batches: 52, amount: 280000 },
    { month: 'Mar', batches: 48, amount: 265000 },
    { month: 'Apr', batches: 61, amount: 310000 },
    { month: 'May', batches: 58, amount: 295000 },
    { month: 'Jun', batches: 67, amount: 340000 },
  ];

  const processingTimeData = [
    { hour: '08:00', avgTime: 12.5 },
    { hour: '10:00', avgTime: 8.3 },
    { hour: '12:00', avgTime: 15.2 },
    { hour: '14:00', avgTime: 9.8 },
    { hour: '16:00', avgTime: 11.1 },
    { hour: '18:00', avgTime: 7.4 },
  ];

  const statusDistribution = [
    { name: 'Processed', value: 1247, color: '#10b981' },
    { name: 'Pending', value: 23, color: '#f59e0b' },
    { name: 'Failed', value: 16, color: '#ef4444' },
    { name: 'Returned', value: 8, color: '#6b7280' },
  ];

  const errorTrends = [
    { date: '2024-01', errors: 12, returns: 5 },
    { date: '2024-02', errors: 8, returns: 3 },
    { date: '2024-03', errors: 15, returns: 7 },
    { date: '2024-04', errors: 6, returns: 2 },
    { date: '2024-05', errors: 9, returns: 4 },
    { date: '2024-06', errors: 4, returns: 1 },
  ];

  const kpiCards = [
    {
      title: "Average Processing Time",
      value: "8.7 minutes",
      change: "-12%",
      trend: "down",
      icon: Clock,
      description: "Time from batch creation to completion"
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: "+0.3%",
      trend: "up",
      icon: CheckCircle,
      description: "Successful transactions vs total"
    },
    {
      title: "Monthly Volume",
      value: "$2.8M",
      change: "+15.2%",
      trend: "up",
      icon: DollarSign,
      description: "Total processed amount this month"
    },
    {
      title: "Error Rate",
      value: "0.3%",
      change: "-0.1%",
      trend: "down",
      icon: AlertTriangle,
      description: "Failed transactions requiring attention"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const IconComponent = kpi.icon;
          const isPositive = kpi.trend === "up";
          const changeColor = isPositive ? "text-green-600" : "text-red-600";
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${changeColor} flex items-center`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {kpi.change} from last period
                </p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Batch Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Volume Trends</CardTitle>
            <CardDescription>Monthly batch count and total amounts processed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batchVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="batches" fill="hsl(var(--primary))" name="Batches" />
                <Bar yAxisId="right" dataKey="amount" fill="hsl(var(--secondary))" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Processing Time Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time Analysis</CardTitle>
            <CardDescription>Average processing time by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Avg Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium">{status.name}</span>
                    <Badge variant="secondary">{status.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Error & Return Trends</CardTitle>
            <CardDescription>Monthly error and return transaction counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={errorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Errors"
                />
                <Area 
                  type="monotone" 
                  dataKey="returns" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Returns"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Efficiency</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-2" />
              <p className="text-xs text-muted-foreground">Batches processed within SLA</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Accuracy</span>
                <span>99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
              <p className="text-xs text-muted-foreground">Transactions without data errors</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span>99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
              <p className="text-xs text-muted-foreground">ACH system availability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};