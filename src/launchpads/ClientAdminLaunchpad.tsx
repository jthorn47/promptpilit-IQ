
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LaunchpadLayout } from './components/LaunchpadLayout';
import { LaunchpadGreetingBanner } from './components/LaunchpadGreetingBanner';
import { LaunchpadCard } from './components/LaunchpadCard';
import { LaunchpadMetrics } from './components/LaunchpadMetrics';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { LMSDashboard } from '@/domains/lms/pages/LMSDashboard';
import { LoadingState } from '@/components/performance/LoadingState';
import { 
  Users, 
  Building2, 
  GraduationCap, 
  Calculator, 
  Shield, 
  Heart, 
  CreditCard,
  HelpCircle,
  BarChart3,
  FileText,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';

export const ClientAdminLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { companyModules, loading } = useAuth();
  const { canAccessSync, hasModuleAccess } = usePermissionContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All information has been updated.",
      });
    }, 1000);
  };

  // Show loading state while auth context loads
  if (loading) {
    return <LoadingState message="Loading your dashboard..." variant="page" />;
  }

  // Check if company only has training module (EaseLearn LMS only)
  const hasPayrollModule = hasModuleAccess('payroll');
  const hasOnlyTrainingModule = companyModules.length === 1 && companyModules.includes('training');

  console.log('🏢 ClientAdminLaunchpad: Module check', {
    hasPayrollModule,
    hasOnlyTrainingModule,
    companyModules,
    dashboardType: hasOnlyTrainingModule ? 'EaseLearn LMS Dashboard' : 'Full Admin Dashboard'
  });

  // If company only has training module, show LMS-focused dashboard
  if (hasOnlyTrainingModule) {
    return (
      <UnifiedLayout>
        <LaunchpadLayout
          title="Launchpad 🚀"
          subtitle="Manage your company's training and compliance programs"
          badge="Client Admin"
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        >
          <div className="space-y-8">
            <LaunchpadGreetingBanner />
            
            {/* LMS-focused metrics */}
            <LaunchpadMetrics metrics={[
              {
                title: "Training Modules",
                value: 7,
                icon: BookOpen,
                description: "3 active"
              },
              {
                title: "Assignments", 
                value: 0,
                icon: Users,
                description: "0 completed"
              },
              {
                title: "Certificates",
                value: 0, 
                icon: Award,
                description: "0 active"
              },
              {
                title: "Completion Rate",
                value: "0%",
                icon: TrendingUp,
                description: "Average score: 0%"
              }
            ]} />
            
          </div>
        </LaunchpadLayout>
      </UnifiedLayout>
    );
  }

  // Dynamic metrics based on available modules
  const metrics = useMemo(() => {
    const baseMetrics: Array<{
      title: string;
      value: string | number;
      icon: any;
      description: string;
    }> = [
      {
        title: "Active Users",
        value: 15,
        icon: Users,
        description: "Company users"
      }
    ];

    if (hasModuleAccess('training')) {
      baseMetrics.push({
        title: "Training Progress",
        value: "85%",
        icon: GraduationCap,
        description: "Completion rate"
      });
    }

    if (hasModuleAccess('payroll')) {
      baseMetrics.push({
        title: "Last Payroll",
        value: "$45,230",
        icon: Calculator,
        description: "Total processed"
      });
    }

    baseMetrics.push({
      title: "System Status",
      value: "Active",
      icon: BarChart3,
      description: "All systems operational"
    });

    return baseMetrics;
  }, [hasModuleAccess]);

  // Dynamic actions based on permissions and modules
  const actions = useMemo(() => {
    const actionsList = [];

    // Users management
    if (canAccessSync('users', 'view')) {
      actionsList.push({
        title: "Manage Users",
        description: "Add, edit, and manage user accounts",
        icon: Users,
        onClick: () => navigate('/admin/users')
      });
    }

    // Company profile
    if (canAccessSync('company', 'view')) {
      actionsList.push({
        title: "Company Profile",
        description: "Update company information and settings",
        icon: Building2,
        onClick: () => navigate('/admin/company')
      });
    }

    // Training module
    if (canAccessSync('training', 'view') && hasModuleAccess('training')) {
      actionsList.push({
        title: "Training Center",
        description: "Manage employee training and compliance",
        icon: GraduationCap,
        onClick: () => navigate('/learning')
      });
    }

    // Payroll module  
    if (canAccessSync('payroll', 'view') && hasModuleAccess('payroll')) {
      actionsList.push({
        title: "Payroll Management",
        description: "Process payroll and manage employee compensation",
        icon: Calculator,
        onClick: () => navigate('/payroll')
      });
    }

    // SB553 module
    if (canAccessSync('compliance', 'view') && hasModuleAccess('sb553')) {
      actionsList.push({
        title: "SB 553 Compliance",
        description: "Workplace violence prevention training",
        icon: Shield,
        onClick: () => navigate('/admin/sb553')
      });
    }

    // HR module
    if (canAccessSync('hr', 'view') && hasModuleAccess('hr')) {
      actionsList.push({
        title: "HR Tools",
        description: "Human resources management and tools",
        icon: Heart,
        onClick: () => navigate('/admin/hr')
      });
    }

    // Billing module
    if (canAccessSync('billing', 'view') && hasModuleAccess('billing')) {
      actionsList.push({
        title: "Billing & Invoicing",
        description: "Manage subscriptions and billing",
        icon: CreditCard,
        onClick: () => navigate('/admin/billing')
      });
    }

    // Help (always show if permission exists)
    if (canAccessSync('help', 'view')) {
      actionsList.push({
        title: "Help & Support",
        description: "Get help and access documentation",
        icon: HelpCircle,
        onClick: () => navigate('/admin/help')
      });
    }

    return actionsList;
  }, [canAccessSync, hasModuleAccess, navigate]);

  // Determine which dashboard to show
  const getDashboardType = () => {
    if (hasModuleAccess('payroll')) {
      return 'Payroll Dashboard';
    }
    return 'EaseLearn LMS Dashboard';
  };

  return (
    <UnifiedLayout>
      <LaunchpadLayout
        title="Launchpad 🚀"
        subtitle="Manage your company's modules and settings"
        badge="Client Admin"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      >
        <div className="space-y-8">
          <LaunchpadGreetingBanner />
          
          {/* Dynamic Metrics */}
          <LaunchpadMetrics metrics={metrics} />

          {/* Available Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Actions</h2>
            {actions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                  <LaunchpadCard
                    key={index}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={action.onClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No actions available with current permissions</p>
              </div>
            )}
          </div>

          {/* Module Status */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Modules</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {companyModules.map((module) => (
                <div key={module} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="capitalize font-medium">{module}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LaunchpadLayout>
    </UnifiedLayout>
  );
};
