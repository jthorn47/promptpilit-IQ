import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MessageSquare, Clock, TrendingUp, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addDays } from 'date-fns';

interface AnalyticsData {
  totalConversations: number;
  avgResponseTime: number;
  escalationRate: number;
  avgResolutionTime: number;
  conversationsByClient: any[];
  conversationsByIssueType: any[];
  conversationsTrend: any[];
}

export const HALIAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('all');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['hali_analytics', dateRange, clientFilter, issueTypeFilter],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('sms_cases')
        .select(`
          *,
          sms_conversations!inner(*)
        `)
        .gte('created_at', dateRange.from?.toISOString())
        .lte('created_at', dateRange.to?.toISOString());

      if (error) throw error;

      // Calculate analytics
      const totalConversations = cases?.length || 0;
      const escalatedCases = cases?.filter(c => c.wants_hr)?.length || 0;
      const closedCases = cases?.filter(c => c.status === 'closed')?.length || 0;
      
      // Mock calculations for demo - replace with real logic
      const avgResponseTime = 4.2; // minutes
      const avgResolutionTime = 1.5; // hours
      const escalationRate = totalConversations > 0 ? (escalatedCases / totalConversations) * 100 : 0;

      // Group by client
      const conversationsByClient = cases?.reduce((acc: any, curr) => {
        const client = curr.client_name || 'Unknown';
        acc[client] = (acc[client] || 0) + 1;
        return acc;
      }, {});

      // Group by issue type
      const conversationsByIssueType = cases?.reduce((acc: any, curr) => {
        const type = curr.issue_category || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalConversations,
        avgResponseTime,
        escalationRate,
        avgResolutionTime,
        conversationsByClient: Object.entries(conversationsByClient || {}).map(([name, value]) => ({ name, value })),
        conversationsByIssueType: Object.entries(conversationsByIssueType || {}).map(([name, value]) => ({ name, value })),
        conversationsTrend: [] // Mock data for demo
      } as AnalyticsData;
    }
  });

  const COLORS = ['#655DC6', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(date) => setDateRange({ from: date?.from, to: date?.to })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="client1">Sample Client 1</SelectItem>
                  <SelectItem value="client2">Sample Client 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Issue Type</label>
              <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Issues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{analyticsData?.totalConversations || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analyticsData?.avgResponseTime || 0}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Escalation Rate</p>
                <p className="text-2xl font-bold">{analyticsData?.escalationRate.toFixed(1) || 0}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{analyticsData?.avgResolutionTime || 0}h</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversations by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.conversationsByClient || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#655DC6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.conversationsByIssueType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData?.conversationsByIssueType?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};