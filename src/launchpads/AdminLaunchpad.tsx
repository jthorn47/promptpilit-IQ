
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { LaunchpadCard } from './components/LaunchpadCard';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield,
  Calendar,
  Bell
} from 'lucide-react';

export const AdminLaunchpad: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All company metrics have been updated.",
      });
    }, 1000);
  };

  const companyMetrics = [
    {
      title: "Total Employees",
      value: 142,
      icon: Users,
      trend: { direction: 'up' as const, percentage: 8 },
      description: "Active employees"
    },
    {
      title: "Training Completion",
      value: "87%",
      icon: GraduationCap,
      trend: { direction: 'up' as const, percentage: 5 },
      description: "Average completion rate"
    },
    {
      title: "Compliance Score",
      value: "94%",
      icon: Shield,
      trend: { direction: 'up' as const, percentage: 2 },
      description: "Overall compliance"
    },
    {
      title: "Pending Actions",
      value: 12,
      icon: Bell,
      description: "Require attention"
    }
  ];

  const adminActions = [
    {
      title: "Employee Management",
      description: "Manage your organization's employees and their roles",
      icon: Users,
      onClick: () => navigate('/admin/employees')
    },
    {
      title: "Training Administration",
      description: "Oversee training programs and course assignments",
      icon: GraduationCap,
      onClick: () => navigate('/learning/admin')
    },
    {
      title: "Analytics & Reports",
      description: "View detailed analytics and generate reports",
      icon: BarChart3,
      onClick: () => navigate('/admin/analytics')
    },
    {
      title: "Compliance Management",
      description: "Monitor and manage compliance requirements",
      icon: Shield,
      onClick: () => navigate('/admin/compliance')
    },
    {
      title: "Company Settings",
      description: "Configure company preferences and policies",
      icon: Settings,
      onClick: () => navigate('/admin/settings')
    },
    {
      title: "Schedule Management",
      description: "Manage schedules and calendar events",
      icon: Calendar,
      onClick: () => navigate('/admin/schedules')
    }
  ];

  return (
    <StandardPageLayout
      title="Launchpad 🚀"
      subtitle="Manage your organization's employees and operations"
      badge="Admin"
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-8">
        {/* Company Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {companyMetrics.map((metric, index) => (
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

        {/* Admin Actions Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Administrative Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminActions.map((action, index) => (
              <LaunchpadCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
};
