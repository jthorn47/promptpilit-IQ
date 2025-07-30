import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Percent,
  Building2
} from "lucide-react";

interface ExecutiveDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function ExecutiveDashboard({ region, vertical, client }: ExecutiveDashboardProps) {
  // Mock data - in real implementation, this would come from API based on filters
  const kpiData = [
    {
      title: "Total Payroll Volume",
      value: "$847.2M",
      change: "+12.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Clients",
      value: "2,847",
      change: "+8.1%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Revenue (MRR)",
      value: "$23.1M",
      change: "+15.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Gross Margin",
      value: "34.2%",
      change: "-1.2%",
      trend: "down",
      icon: Percent,
      color: "text-orange-600"
    },
    {
      title: "Client Churn Rate",
      value: "2.1%",
      change: "-0.8%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "New Clients",
      value: "183",
      change: "+22.4%",
      trend: "up",
      icon: Building2,
      color: "text-purple-600"
    }
  ];

  const revenueData = [
    { month: "Jan", payroll: 65, lms: 28, ats: 12, benefits: 18 },
    { month: "Feb", payroll: 72, lms: 32, ats: 15, benefits: 22 },
    { month: "Mar", payroll: 68, lms: 29, ats: 13, benefits: 19 },
    { month: "Apr", payroll: 78, lms: 35, ats: 18, benefits: 25 },
    { month: "May", payroll: 82, lms: 38, ats: 20, benefits: 28 },
    { month: "Jun", payroll: 85, lms: 41, ats: 22, benefits: 31 }
  ];

  const trendsData = [
    { week: "W1", volume: 18500, clients: 2750, margin: 32.1 },
    { week: "W2", volume: 19200, clients: 2780, margin: 33.2 },
    { week: "W3", volume: 18800, clients: 2790, margin: 34.1 },
    { week: "W4", volume: 20100, clients: 2820, margin: 34.8 },
    { week: "W5", volume: 21300, clients: 2847, margin: 34.2 }
  ];

  const productMixData = [
    { name: "Payroll", value: 65, color: "#655DC6" },
    { name: "LMS", value: 20, color: "#22C55E" },
    { name: "Benefits", value: 10, color: "#F59E0B" },
    { name: "ATS", value: 5, color: "#EF4444" }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${kpi.trend === 'down' ? 'rotate-180' : ''}`} />
                  {kpi.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product Line</CardTitle>
            <CardDescription>Monthly recurring revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}M`, '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area type="monotone" dataKey="payroll" stackId="1" stroke="#655DC6" fill="#655DC6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="lms" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                <Area type="monotone" dataKey="ats" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="benefits" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
            <CardDescription>Volume, clients, and margins over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#655DC6" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="clients" stroke="#22C55E" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Mix */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Mix</CardTitle>
            <CardDescription>Distribution by product line</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={productMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {productMixData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Compliance Issues</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Margin Clients</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Filing Delays</span>
              <Badge variant="outline">7</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">At-Risk Clients</span>
              <Badge variant="destructive">5</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Forecasts */}
        <Card>
          <CardHeader>
            <CardTitle>Next Quarter Forecast</CardTitle>
            <CardDescription>AI-powered predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Revenue Growth</span>
                <span className="text-green-600">+18.2%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Client Retention</span>
                <span className="text-blue-600">97.8%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Margin Improvement</span>
                <span className="text-primary">+2.4%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}