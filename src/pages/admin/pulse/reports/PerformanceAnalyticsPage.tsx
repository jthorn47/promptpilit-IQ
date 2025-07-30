import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileText, Printer, AlertTriangle, Clock, CheckCircle, Target, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePulseCases } from '@/modules/CaseManagement/hooks/usePulseCases';

// Mock data for demonstration
const mockUserPerformance = [
  {
    userId: 'user-1',
    userName: 'John Smith',
    role: 'Senior Case Manager',
    avgResolutionTime: 4.2,
    taskCompletionRate: 87,
    openCaseload: 12,
    slaComplianceRate: 92,
    totalTasksAssigned: 156,
    tasksCompletedOnTime: 136,
    overdueTasks: 8,
    isLowPerformer: false
  },
  {
    userId: 'user-2', 
    userName: 'Sarah Johnson',
    role: 'Case Manager',
    avgResolutionTime: 6.8,
    taskCompletionRate: 73,
    openCaseload: 18,
    slaComplianceRate: 78,
    totalTasksAssigned: 142,
    tasksCompletedOnTime: 104,
    overdueTasks: 22,
    isLowPerformer: true
  },
  {
    userId: 'user-3',
    userName: 'Mike Davis',
    role: 'Junior Case Manager', 
    avgResolutionTime: 5.1,
    taskCompletionRate: 82,
    openCaseload: 8,
    slaComplianceRate: 85,
    totalTasksAssigned: 98,
    tasksCompletedOnTime: 80,
    overdueTasks: 12,
    isLowPerformer: false
  },
  {
    userId: 'user-4',
    userName: 'Lisa Chen',
    role: 'Senior Case Manager',
    avgResolutionTime: 3.9,
    taskCompletionRate: 94,
    openCaseload: 15,
    slaComplianceRate: 96,
    totalTasksAssigned: 178,
    tasksCompletedOnTime: 167,
    overdueTasks: 4,
    isLowPerformer: false
  },
  {
    userId: 'user-5',
    userName: 'Tom Wilson',
    role: 'Case Manager',
    avgResolutionTime: 8.2,
    taskCompletionRate: 65,
    openCaseload: 22,
    slaComplianceRate: 71,
    totalTasksAssigned: 134,
    tasksCompletedOnTime: 87,
    overdueTasks: 31,
    isLowPerformer: true
  }
];

// Mock heatmap data (weeks x users)
const mockHeatmapData = [
  { week: 'Week 1', 'John Smith': 8, 'Sarah Johnson': 12, 'Mike Davis': 6, 'Lisa Chen': 10, 'Tom Wilson': 14 },
  { week: 'Week 2', 'John Smith': 10, 'Sarah Johnson': 15, 'Mike Davis': 7, 'Lisa Chen': 12, 'Tom Wilson': 16 },
  { week: 'Week 3', 'John Smith': 9, 'Sarah Johnson': 13, 'Mike Davis': 5, 'Lisa Chen': 11, 'Tom Wilson': 18 },
  { week: 'Week 4', 'John Smith': 11, 'Sarah Johnson': 14, 'Mike Davis': 8, 'Lisa Chen': 13, 'Tom Wilson': 15 }
];

export const PerformanceAnalyticsPage = () => {
  const [filters, setFilters] = useState({
    client: '',
    userRole: '',
    dateRange: { start: '', end: '' }
  });

  const { cases, loading } = usePulseCases();

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalUsers = mockUserPerformance.length;
    const avgResolutionTime = mockUserPerformance.reduce((sum, user) => sum + user.avgResolutionTime, 0) / totalUsers;
    const avgTaskCompletion = mockUserPerformance.reduce((sum, user) => sum + user.taskCompletionRate, 0) / totalUsers;
    const totalOpenCases = mockUserPerformance.reduce((sum, user) => sum + user.openCaseload, 0);
    const avgSlaCompliance = mockUserPerformance.reduce((sum, user) => sum + user.slaComplianceRate, 0) / totalUsers;

    return {
      avgResolutionTime: avgResolutionTime.toFixed(1),
      avgTaskCompletion: Math.round(avgTaskCompletion),
      totalOpenCases,
      avgSlaCompliance: Math.round(avgSlaCompliance)
    };
  }, []);

  // Filter and process data
  const filteredPerformance = useMemo(() => {
    return mockUserPerformance.filter(user => {
      if (filters.userRole && user.role !== filters.userRole) return false;
      return true;
    });
  }, [filters]);

  // Low performers
  const lowPerformers = filteredPerformance.filter(user => user.isLowPerformer);

  const handleExport = (format: 'pdf' | 'csv' | 'print') => {
    console.log(`Exporting performance analytics as ${format}`);
    // Implementation would go here
  };

  const getWorkloadColor = (value: number) => {
    if (value >= 15) return 'hsl(var(--destructive))';
    if (value >= 10) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading performance analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">Track team effectiveness and accountability</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  <SelectItem value="client-1">Acme Corp</SelectItem>
                  <SelectItem value="client-2">TechStart Inc</SelectItem>
                  <SelectItem value="client-3">Global Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">User Role</label>
              <Select value={filters.userRole} onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value }))}>
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
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgResolutionTime} days</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline text-green-500" /> 12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion %</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgTaskCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline text-green-500" /> 5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Open Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalOpenCases}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline text-green-500" /> 8 fewer than last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgSlaCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline text-green-500" /> 3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Times Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Times per User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userName" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgResolutionTime" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Assigned</TableHead>
                <TableHead>Completed On Time</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformance.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.userName}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.totalTasksAssigned}</TableCell>
                  <TableCell>{user.tasksCompletedOnTime}</TableCell>
                  <TableCell>
                    <span className={user.overdueTasks > 15 ? 'text-destructive font-medium' : ''}>
                      {user.overdueTasks}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.taskCompletionRate >= 85 ? 'default' : user.taskCompletionRate >= 70 ? 'secondary' : 'destructive'}>
                      {user.taskCompletionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isLowPerformer ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Performer
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Good
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Workload Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground">Cases assigned per week per user</p>
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
                    {Object.entries(week).filter(([key]) => key !== 'week').map(([user, value]) => (
                      <td key={user} className="p-2 text-center">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-white font-medium mx-auto"
                          style={{ backgroundColor: getWorkloadColor(value as number) }}
                        >
                          {value}
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
              <span>Low (0-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
              <span>Medium (10-14)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
              <span>High (15+)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Performers Flag List */}
      {lowPerformers.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Performers Alert
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Users with {'>'}30% late tasks or average SLA violation {'>'}7 days
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowPerformers.map((user) => (
                <div key={user.userId} className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                  <div>
                    <div className="font-medium">{user.userName}</div>
                    <div className="text-sm text-muted-foreground">{user.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-destructive font-medium">{user.overdueTasks}</span> overdue tasks
                    </div>
                    <div className="text-sm">
                      <span className="text-destructive font-medium">{user.taskCompletionRate}%</span> completion rate
                    </div>
                  </div>
                  <Badge variant="destructive">Action Required</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};