import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Clock, DollarSign, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, isAfter, isBefore } from 'date-fns';

interface CaseAnalyticsDashboardProps {
  companyId?: string;
}

export const CaseAnalyticsDashboard = ({ companyId }: CaseAnalyticsDashboardProps) => {
  const [cases, setCases] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [timeLoading, setTimeLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch cases data
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setCasesLoading(true);
        console.log('Fetching cases for analytics...');
        
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching cases:', error);
          throw error;
        }

        console.log('Cases fetched successfully:', data?.length || 0, 'cases');
        setCases(data || []);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        setCases([]);
      } finally {
        setCasesLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Fetch time entries
  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        setTimeLoading(true);
        
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('entry_date', { ascending: false });

        if (error) {
          console.error('Error fetching time entries:', error);
          throw error;
        }

        setTimeEntries(data || []);
      } catch (error) {
        console.error('Failed to fetch time entries:', error);
        setTimeEntries([]);
      } finally {
        setTimeLoading(false);
      }
    };

    fetchTimeEntries();
  }, []);

  // Filter data based on date range and type
  const filteredCases = cases.filter(case_ => {
    const caseDate = new Date(case_.created_at);
    const cutoffDate = subDays(new Date(), dateRange);
    const isInRange = isAfter(caseDate, cutoffDate);
    const matchesType = selectedType === 'all' || case_.type === selectedType;
    return isInRange && matchesType;
  });

  const filteredTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const cutoffDate = subDays(new Date(), dateRange);
    return isAfter(entryDate, cutoffDate);
  });

  // Calculate KPIs
  const totalCases = filteredCases.length;
  const openCases = filteredCases.filter(c => c.status === 'open').length;
  const avgResolutionTime = filteredCases
    .filter(c => c.status === 'closed' && c.closed_at)
    .reduce((acc, c) => {
      const created = new Date(c.created_at);
      const closed = new Date(c.closed_at!);
      return acc + (closed.getTime() - created.getTime());
    }, 0) / (filteredCases.filter(c => c.status === 'closed').length || 1);

  const totalLabor = filteredTimeEntries.reduce((acc, entry) => acc + (entry.duration_minutes / 60), 0);
  // Calculate labor cost based on duration and hourly rates (placeholder calculation)
  const totalLaborCost = filteredTimeEntries.reduce((acc, entry) => acc + (entry.duration_minutes / 60) * 85, 0); // $85/hour default rate

  // Chart data preparation
  const casesByType = filteredCases.reduce((acc, case_) => {
    acc[case_.type] = (acc[case_.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const caseTypeData = Object.entries(casesByType).map(([type, count]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count
  }));

  const casesByStatus = filteredCases.reduce((acc, case_) => {
    acc[case_.status] = (acc[case_.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(casesByStatus).map(([status, count]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  // Daily case creation trend
  const dailyCases = Array.from({ length: dateRange }, (_, i) => {
    const date = subDays(new Date(), dateRange - i - 1);
    const dateStr = format(date, 'MM/dd');
    const count = filteredCases.filter(c => 
      format(new Date(c.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return { date: dateStr, cases: count };
  });

  if (casesLoading || timeLoading) {
  return (
    <div className="space-y-6" data-tour="analytics-overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="dateRange">Date Range:</Label>
          <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="caseType">Case Type:</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="general_support">General Support</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="key-metrics">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{totalCases}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Badge variant={openCases > 0 ? "destructive" : "default"}>
                {openCases} open
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-tour="team-performance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {Math.round(avgResolutionTime / (1000 * 60 * 60 * 24))}d
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(avgResolutionTime / (1000 * 60 * 60))} hours average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Labor</p>
                <p className="text-2xl font-bold">{totalLabor.toFixed(1)}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredTimeEntries.length} time entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${(totalLaborCost / (totalLabor || 1)).toFixed(0)}/hour avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="status-breakdown">
        {/* Case Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of case types in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caseTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
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
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Case Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Creation Trend</CardTitle>
            <CardDescription>Daily case volume over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyCases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};