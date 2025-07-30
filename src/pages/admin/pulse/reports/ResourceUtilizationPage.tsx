import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileText, Printer, Clock, Users, TrendingUp, AlertTriangle, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePulseCases } from '@/modules/CaseManagement/hooks/usePulseCases';

// Mock resource utilization data
const mockResourceData = [
  {
    userId: 'user-1',
    userName: 'John Smith',
    role: 'Senior Case Manager',
    totalCases: 15,
    totalHours: 42.5,
    avgHoursPerCase: 2.8,
    weeklyHours: [38, 42, 45, 39, 42],
    isOverCapacity: true,
    casesByType: {
      'compliance': 18.5,
      'investigation': 12.0,
      'consultation': 8.5,
      'training': 3.5
    }
  },
  {
    userId: 'user-2',
    userName: 'Sarah Johnson',
    role: 'Case Manager',
    totalCases: 12,
    totalHours: 36.0,
    avgHoursPerCase: 3.0,
    weeklyHours: [35, 38, 32, 36, 40],
    isOverCapacity: false,
    casesByType: {
      'compliance': 15.0,
      'investigation': 10.5,
      'consultation': 7.0,
      'training': 3.5
    }
  },
  {
    userId: 'user-3',
    userName: 'Mike Davis',
    role: 'Junior Case Manager',
    totalCases: 8,
    totalHours: 28.5,
    avgHoursPerCase: 3.6,
    weeklyHours: [25, 30, 28, 32, 28],
    isOverCapacity: false,
    casesByType: {
      'compliance': 12.0,
      'investigation': 8.0,
      'consultation': 5.5,
      'training': 3.0
    }
  },
  {
    userId: 'user-4',
    userName: 'Lisa Chen',
    role: 'Senior Case Manager',
    totalCases: 18,
    totalHours: 48.0,
    avgHoursPerCase: 2.7,
    weeklyHours: [46, 50, 48, 45, 51],
    isOverCapacity: true,
    casesByType: {
      'compliance': 20.0,
      'investigation': 15.0,
      'consultation': 9.0,
      'training': 4.0
    }
  },
  {
    userId: 'user-5',
    userName: 'Tom Wilson',
    role: 'Case Manager',
    totalCases: 10,
    totalHours: 32.0,
    avgHoursPerCase: 3.2,
    weeklyHours: [30, 35, 32, 28, 35],
    isOverCapacity: false,
    casesByType: {
      'compliance': 14.0,
      'investigation': 9.0,
      'consultation': 6.0,
      'training': 3.0
    }
  }
];

// Mock client utilization data
const mockClientData = [
  { name: 'Acme Corp', hours: 45.5, value: 45.5, fill: 'hsl(var(--chart-1))' },
  { name: 'TechStart Inc', hours: 38.0, value: 38.0, fill: 'hsl(var(--chart-2))' },
  { name: 'Global Systems', hours: 32.5, value: 32.5, fill: 'hsl(var(--chart-3))' },
  { name: 'Innovation Labs', hours: 28.0, value: 28.0, fill: 'hsl(var(--chart-4))' },
  { name: 'Future Corp', hours: 22.0, value: 22.0, fill: 'hsl(var(--chart-5))' }
];

// Mock heatmap data (weeks x users for capacity visualization)
const mockHeatmapData = [
  { week: 'Week 1', 'John Smith': 38, 'Sarah Johnson': 35, 'Mike Davis': 25, 'Lisa Chen': 46, 'Tom Wilson': 30 },
  { week: 'Week 2', 'John Smith': 42, 'Sarah Johnson': 38, 'Mike Davis': 30, 'Lisa Chen': 50, 'Tom Wilson': 35 },
  { week: 'Week 3', 'John Smith': 45, 'Sarah Johnson': 32, 'Mike Davis': 28, 'Lisa Chen': 48, 'Tom Wilson': 32 },
  { week: 'Week 4', 'John Smith': 39, 'Sarah Johnson': 36, 'Mike Davis': 32, 'Lisa Chen': 45, 'Tom Wilson': 28 },
  { week: 'Week 5', 'John Smith': 42, 'Sarah Johnson': 40, 'Mike Davis': 28, 'Lisa Chen': 51, 'Tom Wilson': 35 }
];

export const ResourceUtilizationPage = () => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    caseType: '',
    client: '',
    assignedUser: '',
    role: ''
  });

  const { cases, loading } = usePulseCases();

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalHours = mockResourceData.reduce((sum, user) => sum + user.totalHours, 0);
    const totalCases = mockResourceData.reduce((sum, user) => sum + user.totalCases, 0);
    const avgHoursPerCase = totalCases > 0 ? totalHours / totalCases : 0;
    const overCapacityUsers = mockResourceData.filter(user => user.isOverCapacity).length;

    return {
      totalHours: totalHours.toFixed(1),
      avgHoursPerCase: avgHoursPerCase.toFixed(1),
      totalCases,
      overCapacityUsers
    };
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return mockResourceData.filter(user => {
      if (filters.assignedUser && user.userId !== filters.assignedUser) return false;
      if (filters.role && user.role !== filters.role) return false;
      return true;
    });
  }, [filters]);

  // Prepare stacked bar chart data
  const stackedBarData = useMemo(() => {
    return filteredData.map(user => ({
      name: user.userName,
      compliance: user.casesByType.compliance,
      investigation: user.casesByType.investigation,
      consultation: user.casesByType.consultation,
      training: user.casesByType.training
    }));
  }, [filteredData]);

  const handleExport = (format: 'pdf' | 'csv' | 'print') => {
    console.log(`Exporting resource utilization as ${format}`);
    // Implementation would go here
  };

  const getCapacityColor = (hours: number) => {
    if (hours > 40) return 'hsl(var(--destructive))';
    if (hours > 35) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getCapacityStatus = (hours: number) => {
    if (hours > 40) return 'Over Capacity';
    if (hours > 35) return 'Near Capacity';
    return 'Normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading resource utilization...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resource Utilization</h1>
          <p className="text-muted-foreground">Track team capacity and workload distribution</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('print')}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Case Type</label>
              <Select value={filters.caseType} onValueChange={(value) => setFilters(prev => ({ ...prev, caseType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  <SelectItem value="acme">Acme Corp</SelectItem>
                  <SelectItem value="techstart">TechStart Inc</SelectItem>
                  <SelectItem value="global">Global Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">User Role</label>
              <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="Senior Case Manager">Senior Case Manager</SelectItem>
                  <SelectItem value="Case Manager">Case Manager</SelectItem>
                  <SelectItem value="Junior Case Manager">Junior Case Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateMetrics.totalHours}</div>
            <p className="text-xs text-muted-foreground">This reporting period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours per Case</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateMetrics.avgHoursPerCase}</div>
            <p className="text-xs text-muted-foreground">Across all case types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateMetrics.totalCases}</div>
            <p className="text-xs text-muted-foreground">Active and completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Capacity Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{aggregateMetrics.overCapacityUsers}</div>
            <p className="text-xs text-muted-foreground">{'>'}40 hours/week</p>
          </CardContent>
        </Card>
      </div>

      {/* Hours by Case Type - Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hours by Case Type per User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="compliance" stackId="a" fill="hsl(var(--chart-1))" name="Compliance" />
                <Bar dataKey="investigation" stackId="a" fill="hsl(var(--chart-2))" name="Investigation" />
                <Bar dataKey="consultation" stackId="a" fill="hsl(var(--chart-3))" name="Consultation" />
                <Bar dataKey="training" stackId="a" fill="hsl(var(--chart-4))" name="Training" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Hours Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hours by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockClientData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}h`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockClientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients by Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClientData.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.hours} hours</div>
                    </div>
                  </div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(client.hours / mockClientData[0].hours) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Utilization Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Cases</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Avg per Case</TableHead>
                <TableHead>Weekly Avg</TableHead>
                <TableHead>Capacity Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((user) => {
                const weeklyAvg = user.weeklyHours.reduce((sum, h) => sum + h, 0) / user.weeklyHours.length;
                return (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.totalCases}</TableCell>
                    <TableCell>{user.totalHours}h</TableCell>
                    <TableCell>{user.avgHoursPerCase.toFixed(1)}h</TableCell>
                    <TableCell>{weeklyAvg.toFixed(1)}h</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.isOverCapacity ? 'destructive' : weeklyAvg > 35 ? 'secondary' : 'default'}
                        className="flex items-center gap-1"
                      >
                        {user.isOverCapacity && <AlertTriangle className="h-3 w-3" />}
                        {getCapacityStatus(weeklyAvg)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Weekly Capacity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Capacity Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground">Hours worked per week per user (red indicates overages)</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Week</th>
                  {Object.keys(mockHeatmapData[0]).filter(key => key !== 'week').map(user => (
                    <th key={user} className="text-center p-2 min-w-[100px]">{user}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockHeatmapData.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    <td className="p-2 font-medium">{week.week}</td>
                    {Object.entries(week).filter(([key]) => key !== 'week').map(([user, hours]) => (
                      <td key={user} className="p-2 text-center">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-white font-medium mx-auto"
                          style={{ backgroundColor: getCapacityColor(hours as number) }}
                        >
                          {hours}h
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--success))' }}></div>
              <span>Normal (≤35h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
              <span>Near Capacity (35-40h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
              <span>Over Capacity ({'>'}40h)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overcapacity Alerts */}
      {filteredData.some(user => user.isOverCapacity) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Overcapacity Alerts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Users working more than 40 hours per week
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredData.filter(user => user.isOverCapacity).map((user) => {
                const weeklyAvg = user.weeklyHours.reduce((sum, h) => sum + h, 0) / user.weeklyHours.length;
                return (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                    <div>
                      <div className="font-medium">{user.userName}</div>
                      <div className="text-sm text-muted-foreground">{user.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-destructive font-medium">{weeklyAvg.toFixed(1)}h</span> avg/week
                      </div>
                      <div className="text-sm">
                        <span className="text-destructive font-medium">{user.totalCases}</span> active cases
                      </div>
                    </div>
                    <Badge variant="destructive">Redistribute Load</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};