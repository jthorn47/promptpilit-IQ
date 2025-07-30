import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Building2, 
  TrendingUp,
  Calendar,
  FileText,
  Bell,
  Settings,
  Activity,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const dashboardCards = [
    {
      title: 'Analytics',
      description: 'View comprehensive analytics and reporting',
      icon: BarChart3,
      href: '/admin/analytics',
      stats: '12 Reports',
      color: 'bg-blue-500'
    },
    {
      title: 'Company Management',
      description: 'Manage company settings and configurations',
      icon: Building2,
      href: '/admin/companies',
      stats: '45 Companies',
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      stats: '234 Users',
      color: 'bg-purple-500'
    },
    {
      title: 'Performance',
      description: 'Track system and business performance',
      icon: TrendingUp,
      href: '/admin/performance',
      stats: '98.5% Uptime',
      color: 'bg-orange-500'
    },
    {
      title: 'Calendar',
      description: 'Manage events and scheduled tasks',
      icon: Calendar,
      href: '/calendar',
      stats: '5 Events Today',
      color: 'bg-red-500'
    },
    {
      title: 'Reports',
      description: 'Generate and view detailed reports',
      icon: FileText,
      href: '/reports',
      stats: '23 Generated',
      color: 'bg-indigo-500'
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications and alerts',
      icon: Bell,
      href: '/notifications',
      stats: '8 Unread',
      color: 'bg-yellow-500'
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      stats: 'Updated Today',
      color: 'bg-gray-500'
    },
    {
      title: 'Activity Log',
      description: 'Monitor system activity and user actions',
      icon: Activity,
      href: '/admin/audit',
      stats: '156 Events',
      color: 'bg-pink-500'
    },
    {
      title: 'Financials',
      description: 'Track revenue, expenses, and profitability',
      icon: DollarSign,
      href: '/admin/financials',
      stats: '$45,230',
      color: 'bg-emerald-500'
    },
    {
      title: 'Time Tracking',
      description: 'Monitor time allocation and productivity',
      icon: Clock,
      href: '/time-tracking',
      stats: '7.5 hrs avg',
      color: 'bg-cyan-500'
    },
    {
      title: 'Tasks',
      description: 'Manage tasks and project workflows',
      icon: CheckCircle,
      href: '/tasks',
      stats: '12 Pending',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="container mx-auto py-4 px-4 space-y-6 max-w-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your system.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-green-600">+5% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue MTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.2K</div>
            <p className="text-xs text-green-600">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to={card.href} className="block">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{card.stats}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-500 text-white rounded-full">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-muted-foreground">john.doe@company.com joined the platform</p>
              </div>
              <div className="text-sm text-muted-foreground">5 min ago</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-500 text-white rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Task completed</p>
                <p className="text-sm text-muted-foreground">Monthly report generation finished</p>
              </div>
              <div className="text-sm text-muted-foreground">12 min ago</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-orange-500 text-white rounded-full">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">System maintenance scheduled</p>
                <p className="text-sm text-muted-foreground">Scheduled for tonight at 2:00 AM EST</p>
              </div>
              <div className="text-sm text-muted-foreground">1 hour ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;