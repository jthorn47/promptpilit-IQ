import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Clock, DollarSign, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { CaseAnalyticsService } from '../services/CaseAnalyticsService';
import { CaseAnalyticsDashboard, CaseAnalyticsFilters } from '../types';
import { Skeleton } from '@/components/ui/skeleton';

const CaseAnalyticsManagerComponent = ({ companyId }: { companyId?: string }) => {
  const [dashboard, setDashboard] = useState<CaseAnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [selectedType, setSelectedType] = useState<string>('all');

  const stableCompanyId = useMemo(() => companyId, [companyId]);

  useEffect(() => {
    let isMounted = true;
    
    const loadDashboard = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        const filters: CaseAnalyticsFilters = {
          companyId: stableCompanyId,
          ...(selectedType !== 'all' && { caseType: selectedType }),
          dateRange: {
            start: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
        };
        
        const data = await CaseAnalyticsService.getDashboardData();
        if (isMounted) {
          setDashboard(data);
        }
      } catch (error) {
        console.error('Error loading analytics dashboard:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    
    return () => {
      isMounted = false;
    };
  }, [stableCompanyId, dateRange, selectedType]);

  if (loading) {
    return (
      <div className="space-y-6" data-tour="analytics-overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>Error loading analytics data</div>;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Case Analytics</h2>
        <div className="flex gap-4">
          <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="analytics-overview">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{dashboard.metrics.totalCases}</p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.trends.caseVolumeChange > 0 ? '+' : ''}{dashboard.trends.caseVolumeChange.toFixed(1)}% from last period
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold">{dashboard.metrics.openCases}</p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.metrics.inProgressCases} in progress
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {(dashboard.metrics.averageResolutionTime / (1000 * 60 * 60)).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.trends.resolutionTimeChange > 0 ? '+' : ''}{dashboard.trends.resolutionTimeChange.toFixed(1)}% from last period
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">${dashboard.metrics.totalLaborCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.metrics.totalHours.toFixed(1)} hours logged
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases across different types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {dashboard.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Metrics Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Case Activity</CardTitle>
            <CardDescription>Cases created and resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="casesCreated" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Cases Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="casesResolved" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Cases Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      {dashboard.assigneeMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Individual assignee metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.assigneeMetrics.map((assignee) => (
                <div key={assignee.assigneeId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{assignee.assigneeName || assignee.assigneeId}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignee.casesAssigned} cases assigned • {assignee.casesCompleted} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{assignee.completionRate.toFixed(1)}% completion</p>
                    <p className="text-sm text-muted-foreground">
                      {(assignee.averageResolutionTime / (1000 * 60 * 60)).toFixed(1)}h avg resolution
                    </p>
                  </div>
                  <Badge variant={assignee.completionRate > 80 ? "default" : "secondary"}>
                    {assignee.totalHours.toFixed(1)}h logged
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const CaseAnalyticsManager = React.memo(CaseAnalyticsManagerComponent, (prevProps, nextProps) => {
  return prevProps.companyId === nextProps.companyId;
});