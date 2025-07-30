
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
  MessageSquare, 
  FileText, 
  HelpCircle, 
  Calendar, 
  User, 
  Settings,
  Heart,
  Shield
} from 'lucide-react';

export const ClientLaunchpad: React.FC = () => {
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
        description: "All client information has been updated.",
      });
    }, 1000);
  };

  const clientMetrics = [
    {
      title: "Open Cases",
      value: 3,
      icon: MessageSquare,
      description: "Active support cases"
    },
    {
      title: "Documents",
      value: 24,
      icon: FileText,
      description: "Available documents"
    },
    {
      title: "Service Level",
      value: "Premium",
      icon: Shield,
      description: "Current plan"
    },
    {
      title: "Next Meeting",
      value: "Tomorrow",
      icon: Calendar,
      description: "Scheduled check-in"
    }
  ];

  const clientActions = [
    {
      title: "Support Center",
      description: "Get help and support for your services",
      icon: HelpCircle,
      onClick: () => navigate('/client/support')
    },
    {
      title: "Case Management",
      description: "View and manage your support cases",
      icon: MessageSquare,
      onClick: () => navigate('/client/cases')
    },
    {
      title: "Document Library",
      description: "Access your documents and resources",
      icon: FileText,
      onClick: () => navigate('/client/documents')
    },
    {
      title: "Benefits IQ",
      description: "Explore your benefits and coverage options",
      icon: Heart,
      onClick: () => navigate('/client/benefitsiq')
    },
    {
      title: "Account Settings",
      description: "Manage your account preferences",
      icon: Settings,
      onClick: () => navigate('/client/settings')
    },
    {
      title: "Schedule Meeting",
      description: "Book a consultation with your account manager",
      icon: Calendar,
      onClick: () => navigate('/client/schedule')
    }
  ];

  return (
    <UnifiedLayout>
      <LaunchpadLayout
        title={t('launchpads.client.title')}
        subtitle={t('launchpads.client.subtitle')}
        badge="Client"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      >
        <div className="space-y-8">
          <LaunchpadGreetingBanner />
          {/* Client Metrics */}
          <LaunchpadMetrics metrics={clientMetrics} />

          {/* Client Actions Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientActions.map((action, index) => (
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
