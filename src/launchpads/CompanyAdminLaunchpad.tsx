import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { LaunchpadCard } from './components/LaunchpadCard';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Users, 
  DollarSign, 
  GraduationCap, 
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  PlayCircle,
  Eye,
  Send
} from 'lucide-react';

export const CompanyAdminLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All company metrics and data have been updated.",
      });
    }, 1000);
  };

  // SECTION 1: KPI METRICS
  const kpiMetrics = [
    {
      title: "Total Employees",
      value: 47,
      icon: Users,
      trend: { direction: 'up' as const, percentage: 3 },
      description: "Active employees"
    },
    {
      title: "Payroll Processed",
      value: "$89,450",
      icon: DollarSign,
      description: "Last payroll run"
    },
    {
      title: "Training Compliance",
      value: "92%",
      icon: GraduationCap,
      trend: { direction: 'up' as const, percentage: 5 },
      description: "Current compliance rate"
    },
    {
      title: "Open Support Tickets",
      value: 3,
      icon: AlertCircle,
      description: "Pending resolution"
    },
    {
      title: "Time Approvals Pending",
      value: 8,
      icon: Clock,
      description: "Require your approval"
    }
  ];

  // Mock data for upcoming items
  const upcomingItems = [
    { type: "training", title: "Fire Safety Training", employee: "John Doe", dueDate: "2 days", status: "expiring" },
    { type: "anniversary", title: "Work Anniversary", employee: "Sarah Wilson", dueDate: "5 days", status: "upcoming" },
    { type: "pto", title: "PTO Request", employee: "Mike Chen", dueDate: "1 day", status: "pending" },
    { type: "training", title: "Harassment Prevention", employee: "Lisa Brown", dueDate: "3 days", status: "expiring" },
    { type: "anniversary", title: "Work Anniversary", employee: "David Smith", dueDate: "1 week", status: "upcoming" }
  ];

  // Mock data for recent activity
  const recentActivity = [
    { action: "Training Completed", description: "John Doe completed Fire Safety Training", timestamp: "2 hours ago", type: "success" },
    { action: "Payroll Processed", description: "Bi-weekly payroll run completed successfully", timestamp: "1 day ago", type: "info" },
    { action: "Support Ticket Closed", description: "Ticket #1234 resolved by IT team", timestamp: "1 day ago", type: "success" },
    { action: "New Employee Added", description: "Sarah Johnson added to employee directory", timestamp: "2 days ago", type: "info" },
    { action: "Time Approved", description: "Approved timesheet for Mike Chen", timestamp: "3 days ago", type: "success" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expiring': return 'destructive';
      case 'pending': return 'default';
      case 'upcoming': return 'secondary';
      default: return 'outline';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'info': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'payroll':
        navigate('/admin/payroll');
        break;
      case 'time':
        navigate('/admin/time');
        break;
      case 'training':
        navigate('/admin/training');
        break;
      case 'employees':
        navigate('/admin/employees');
        break;
      case 'support':
        toast({ title: "Support Request", description: "Opening support ticket form..." });
        break;
      default:
        toast({ title: "Coming Soon", description: `${action} functionality will be available soon.` });
    }
  };

  return (
    <StandardPageLayout
      title="Launchpad 🚀" 
      subtitle="Manage your company operations and employee data"
      badge="Company Admin"
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
        <div className="space-y-8">
          {/* SECTION 1: TOP ROW - KPI METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpiMetrics.map((metric, index) => (
              <div key={index} className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">{metric.title}</h3>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend && (
                  <p className={`text-xs flex items-center gap-1 ${
                    metric.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend.direction === 'up' ? '↗' : '↘'} {metric.trend.percentage}%
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
            ))}
          </div>


          {/* SECTION 3: UPCOMING ITEMS & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Items */}
            <LaunchpadCard
              title="Upcoming Items"
              description="Important dates and pending tasks"
              icon={Calendar}
            >
              <div className="space-y-3">
                {upcomingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.employee}</div>
                      <div className="text-xs">Due in {item.dueDate}</div>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status === 'expiring' ? 'Expiring' : 
                       item.status === 'pending' ? 'Pending' : 'Upcoming'}
                    </Badge>
                  </div>
                ))}
              </div>
            </LaunchpadCard>

            {/* Recent Activity */}
            <LaunchpadCard
              title="Recent Activity"
              description="Latest updates and events"
              icon={MessageSquare}
            >
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-start space-x-3 py-2 border-b last:border-b-0">
                      <IconComponent className={`h-4 w-4 mt-1 ${
                        activity.type === 'success' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </LaunchpadCard>
          </div>
        </div>
    </StandardPageLayout>
  );
};