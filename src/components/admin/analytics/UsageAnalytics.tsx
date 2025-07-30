import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, Users, Activity, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface UsageData {
  roleUsage: Array<{ role: string; users: number; color: string }>;
  moduleUsage: Array<{ module: string; dailyUsers: number; weeklyUsers: number; monthlyUsers: number }>;
  dailyActivity: Array<{ date: string; logins: number; actions: number }>;
  featureUsage: Array<{ feature: string; usage: number; trend: 'up' | 'down' | 'stable' }>;
  inactiveUsers: Array<{ email: string; lastLogin: string; role: string; daysSinceLogin: number }>;
}

interface UsageAnalyticsProps {
  dateRange: { from: Date; to: Date };
  selectedModule: string;
}

export function UsageAnalytics({ dateRange, selectedModule }: UsageAnalyticsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'roles' | 'modules' | 'features' | 'inactive'>('overview');

  // Mock data generation for demonstration
  const generateMockUsageData = (): UsageData => {
    const colors = ['#655DC6', '#16A34A', '#DC2626', '#EA580C', '#7C3AED'];
    
    return {
      roleUsage: [
        { role: 'learner', users: 1247, color: colors[0] },
        { role: 'company_admin', users: 89, color: colors[1] },
        { role: 'client_admin', users: 156, color: colors[2] },
        { role: 'super_admin', users: 12, color: colors[3] },
      ],
      moduleUsage: [
        { module: 'Pulse', dailyUsers: 423, weeklyUsers: 1156, monthlyUsers: 2341 },
        { module: 'HRO IQ', dailyUsers: 234, weeklyUsers: 876, monthlyUsers: 1654 },
        { module: 'Vault', dailyUsers: 156, weeklyUsers: 654, monthlyUsers: 1234 },
        { module: 'CRM', dailyUsers: 89, weeklyUsers: 234, monthlyUsers: 567 },
        { module: 'Time Track', dailyUsers: 345, weeklyUsers: 987, monthlyUsers: 1876 },
        { module: 'Admin', dailyUsers: 23, weeklyUsers: 67, monthlyUsers: 145 },
      ],
      dailyActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        logins: Math.floor(Math.random() * 200) + 100,
        actions: Math.floor(Math.random() * 1000) + 500,
      })),
      featureUsage: [
        { feature: 'Document Upload', usage: 89, trend: 'up' },
        { feature: 'Case Submission', usage: 76, trend: 'up' },
        { feature: 'User Management', usage: 45, trend: 'stable' },
        { feature: 'Report Generation', usage: 34, trend: 'down' },
        { feature: 'Policy Access', usage: 67, trend: 'up' },
        { feature: 'Training Modules', usage: 156, trend: 'up' },
      ],
      inactiveUsers: [
        { email: 'john.doe@company.com', lastLogin: '2024-01-15', role: 'learner', daysSinceLogin: 15 },
        { email: 'jane.smith@company.com', lastLogin: '2024-01-10', role: 'learner', daysSinceLogin: 20 },
        { email: 'admin@company.com', lastLogin: '2024-01-20', role: 'company_admin', daysSinceLogin: 10 },
        { email: 'manager@company.com', lastLogin: '2024-01-05', role: 'client_admin', daysSinceLogin: 25 },
      ],
    };
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockUsageData();
      setUsageData(mockData);
      setLoading(false);
    }, 1000);
  }, [dateRange, selectedModule]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!usageData) return null;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.roleUsage.reduce((sum, role) => sum + role.users, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.moduleUsage.reduce((sum, module) => sum + module.dailyUsers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Module</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.moduleUsage.sort((a, b) => b.dailyUsers - a.dailyUsers)[0]?.module || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              By daily users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.inactiveUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              No login in 10+ days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>User count by role type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData.roleUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="users"
                  label={({ role, users }) => `${role}: ${users}`}
                >
                  {usageData.roleUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
            <CardDescription>Logins and actions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="logins" stroke="#655DC6" strokeWidth={2} />
                <Line type="monotone" dataKey="actions" stroke="#16A34A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderModuleUsage = () => (
    <Card>
      <CardHeader>
        <CardTitle>Module Usage Statistics</CardTitle>
        <CardDescription>User activity across different modules</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={usageData.moduleUsage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="module" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="dailyUsers" fill="#655DC6" name="Daily Users" />
            <Bar dataKey="weeklyUsers" fill="#16A34A" name="Weekly Users" />
            <Bar dataKey="monthlyUsers" fill="#DC2626" name="Monthly Users" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderFeatureUsage = () => (
    <Card>
      <CardHeader>
        <CardTitle>Feature Usage & Trends</CardTitle>
        <CardDescription>Most popular features and their usage trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usageData.featureUsage.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{feature.feature}</span>
                {feature.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {feature.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                {feature.trend === 'stable' && <div className="h-4 w-4 rounded-full bg-gray-400" />}
              </div>
              <div className="flex items-center space-x-3">
                <Progress value={feature.usage} className="w-24" />
                <span className="text-sm text-muted-foreground w-12">{feature.usage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderInactiveUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>Inactive Users</CardTitle>
        <CardDescription>Users who haven't logged in recently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usageData.inactiveUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">Last login: {user.lastLogin}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{user.role}</Badge>
                <p className="text-sm text-muted-foreground mt-1">{user.daysSinceLogin} days ago</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Analyze role distribution, module usage, and user activity patterns
          </p>
        </div>
        <Select value={viewMode} onValueChange={setViewMode as any}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="modules">Module Usage</SelectItem>
            <SelectItem value="features">Feature Usage</SelectItem>
            <SelectItem value="inactive">Inactive Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'modules' && renderModuleUsage()}
      {viewMode === 'features' && renderFeatureUsage()}
      {viewMode === 'inactive' && renderInactiveUsers()}
    </div>
  );
}