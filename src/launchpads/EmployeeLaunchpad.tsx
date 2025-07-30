
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LaunchpadLayout } from './components/LaunchpadLayout';
import { LaunchpadGreetingBanner } from './components/LaunchpadGreetingBanner';
import { LaunchpadCard } from './components/LaunchpadCard';
import { LaunchpadMetrics } from './components/LaunchpadMetrics';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Heart,
  Shield,
  MessageSquare
} from 'lucide-react';

export const EmployeeLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Updated",
        description: "Your employee information has been refreshed.",
      });
    }, 1000);
  };

  const employeeMetrics = [
    {
      title: "Hours This Week",
      value: "38.5h",
      icon: Clock,
      description: "Time tracked"
    },
    {
      title: "PTO Balance",
      value: "15.5",
      icon: Calendar,
      description: "Days available"
    },
    {
      title: "Last Paycheck",
      value: "$2,450",
      icon: DollarSign,
      description: "Net pay"
    },
    {
      title: "Benefits Enrolled",
      value: 4,
      icon: Heart,
      description: "Active plans"
    }
  ];

  const employeeActions = [
    {
      title: "Time Tracking",
      description: "Clock in/out and manage your time entries",
      icon: Clock,
      onClick: () => navigate('/employee/time')
    },
    {
      title: "My Profile",
      description: "View and update your personal information",
      icon: User,
      onClick: () => navigate('/employee/profile')
    },
    {
      title: "Payroll & Benefits",
      description: "Access pay stubs and manage benefits",
      icon: DollarSign,
      onClick: () => navigate('/employee/payroll')
    },
    {
      title: "Request Time Off",
      description: "Submit vacation and sick leave requests",
      icon: Calendar,
      onClick: () => navigate('/employee/time-off')
    },
    {
      title: "Documents",
      description: "Access your employment documents",
      icon: FileText,
      onClick: () => navigate('/employee/documents')
    },
    {
      title: "Support",
      description: "Get help with HR and workplace questions",
      icon: MessageSquare,
      onClick: () => navigate('/employee/support')
    }
  ];

  return (
    <UnifiedLayout>
      <LaunchpadLayout
        title="Launchpad 🚀"
        subtitle="Your personal workspace for HR and employment needs"
        badge="Employee"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      >
        <div className="space-y-8">
          {/* Employee Metrics */}
          <LaunchpadMetrics metrics={employeeMetrics} />

          {/* Employee Actions Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Employee Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeActions.map((action, index) => (
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
      </LaunchpadLayout>
    </UnifiedLayout>
  );
};
