import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';

// Sample data for analytics
const salesData = [
  { month: 'Jan', revenue: 45000, deals: 12, leads: 150 },
  { month: 'Feb', revenue: 52000, deals: 15, leads: 180 },
  { month: 'Mar', revenue: 48000, deals: 13, leads: 165 },
  { month: 'Apr', revenue: 61000, deals: 18, leads: 200 },
  { month: 'May', revenue: 55000, deals: 16, leads: 175 },
  { month: 'Jun', revenue: 67000, deals: 20, leads: 220 }
];

const pipelineData = [
  { name: 'Prospecting', value: 35, count: 45 },
  { name: 'Qualification', value: 25, count: 32 },
  { name: 'Proposal', value: 20, count: 26 },
  { name: 'Negotiation', value: 12, count: 15 },
  { name: 'Closed Won', value: 8, count: 10 }
];

const performanceData = [
  { rep: 'John Smith', deals: 15, revenue: 125000, conversion: 85 },
  { rep: 'Sarah Johnson', deals: 12, revenue: 98000, conversion: 78 },
  { rep: 'Mike Chen', deals: 18, revenue: 142000, conversion: 92 },
  { rep: 'Emma Davis', deals: 10, revenue: 87000, conversion: 75 }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const AdvancedAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('6m');
  const [reportType, setReportType] = useState('overview');

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Implementation for export functionality
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive reporting and data insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$328,000</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deals Closed</p>
                <p className="text-2xl font-bold">94</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8.2%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">1,290</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-3.1%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">23.4%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+1.8%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pipeline Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Pipeline Distribution
                </CardTitle>
                <CardDescription>Current deals by pipeline stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Performance
              </CardTitle>
              <CardDescription>Monthly sales metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" />
                  <Bar yAxisId="right" dataKey="deals" fill="hsl(var(--secondary))" name="Deals Closed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Health</CardTitle>
                <CardDescription>Current pipeline stage distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineData.map((stage, index) => (
                  <div key={stage.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stage.count} deals</span>
                        <Badge variant="secondary">{stage.value}%</Badge>
                      </div>
                    </div>
                    <Progress value={stage.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Velocity</CardTitle>
                <CardDescription>Average time spent in each stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Prospecting</span>
                    <Badge>12 days</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Qualification</span>
                    <Badge>8 days</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Proposal</span>
                    <Badge>15 days</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Negotiation</span>
                    <Badge>6 days</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Average Cycle</span>
                    <Badge variant="default">41 days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual sales rep performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((rep, index) => (
                  <div key={rep.rep} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {rep.rep.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{rep.rep}</p>
                        <p className="text-sm text-muted-foreground">{rep.deals} deals closed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">${rep.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={rep.conversion} className="w-16 h-2" />
                          <span className="text-sm font-medium">{rep.conversion}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue for next 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Q3 2024 Forecast</span>
                    <Badge variant="default">$420,000</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>Q4 2024 Forecast</span>
                    <Badge variant="secondary">$380,000</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Level</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Achievement</CardTitle>
                <CardDescription>Progress towards quarterly goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue Goal</span>
                      <span className="text-sm">$328K / $400K</span>
                    </div>
                    <Progress value={82} className="h-3" />
                    <p className="text-xs text-muted-foreground">82% complete</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Deals Goal</span>
                      <span className="text-sm">94 / 120</span>
                    </div>
                    <Progress value={78} className="h-3" />
                    <p className="text-xs text-muted-foreground">78% complete</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Leads Goal</span>
                      <span className="text-sm">1,290 / 1,500</span>
                    </div>
                    <Progress value={86} className="h-3" />
                    <p className="text-xs text-muted-foreground">86% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};