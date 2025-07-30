
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LaunchpadLayout } from './components/LaunchpadLayout';
import { LaunchpadGreetingBanner } from './components/LaunchpadGreetingBanner';
import { LaunchpadCard } from './components/LaunchpadCard';
import { LaunchpadMetrics } from './components/LaunchpadMetrics';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeLaunchpad } from './EmployeeLaunchpad';
import { LoadingState } from '@/components/performance/LoadingState';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  GraduationCap, 
  Award,
  TrendingUp
} from 'lucide-react';

export const LearnerLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { hasModuleAccess, loading, companyModules } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show loading state while auth context loads
  if (loading) {
    return <LoadingState message="Loading your dashboard..." variant="page" />;
  }

  // Check if company has purchased the payroll module
  const hasPayrollModule = hasModuleAccess('payroll');

  console.log('🎓 LearnerLaunchpad: Dual dashboard logic', {
    hasPayrollModule,
    companyModules,
    dashboardType: hasPayrollModule ? 'Employee Dashboard' : 'LMS-Only Dashboard'
  });

  // If company has payroll, show rich Employee Dashboard
  if (hasPayrollModule) {
    return <EmployeeLaunchpad />;
  }

  // Otherwise, show LMS-focused learner experience
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Progress Updated",
        description: "Your learning progress has been refreshed.",
      });
    }, 1000);
  };

  const learningMetrics = [
    {
      title: "Courses Completed",
      value: 12,
      icon: GraduationCap,
      trend: { direction: 'up' as const, percentage: 20 },
      description: "This quarter"
    },
    {
      title: "Learning Hours",
      value: "24.5h",
      icon: Clock,
      trend: { direction: 'up' as const, percentage: 15 },
      description: "Total time invested"
    },
    {
      title: "Certificates Earned",
      value: 8,
      icon: Award,
      description: "Valid certifications"
    },
    {
      title: "Progress Score",
      value: "92%",
      icon: TrendingUp,
      trend: { direction: 'up' as const, percentage: 8 },
      description: "Overall performance"
    }
  ];

  const learningActions = [
    {
      title: "Course Catalog",
      description: "Browse available courses and training materials",
      icon: BookOpen,
      onClick: () => navigate('/learning/modules')
    },
    {
      title: "My Courses",
      description: "Continue your enrolled courses and track progress",
      icon: GraduationCap,
      onClick: () => navigate('/learning/my-courses')
    },
    {
      title: "Assignments",
      description: "View and complete assigned training modules",
      icon: Target,
      onClick: () => navigate('/learning/assignments')
    },
    {
      title: "My Certificates",
      description: "View your certificates and accomplishments",
      icon: Award,
      onClick: () => navigate('/learning/my-certificates')
    },
    {
      title: "Progress Tracking",
      description: "Track your learning progress and performance",
      icon: TrendingUp,
      onClick: () => navigate('/learning/progress')
    }
  ];

  return (
    <UnifiedLayout>
      <LaunchpadLayout
        title="Launchpad 🚀" 
        subtitle="Track your learning progress and complete training modules"
        badge="Learner"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      >
        <div className="space-y-8">
          <LaunchpadGreetingBanner />
          {/* Learning Metrics */}
          <LaunchpadMetrics metrics={learningMetrics} />

          {/* Learning Actions Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningActions.map((action, index) => (
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
