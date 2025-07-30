
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedTabNavigation, TabConfig } from '@/components/shared/UnifiedTabNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Clock,
  Settings,
  Package,
  Shield,
  HelpCircle,
  GraduationCap,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

import { HROIQDashboard } from './HROIQDashboard';
import { HROIQClientDashboard } from './HROIQClientDashboard';
import { HROIQRequestCenterEnhanced } from './HROIQRequestCenterEnhanced';
import { HROIQDeliverablesCenter } from './HROIQDeliverablesCenter';
import { HROIQOnboardingToolEnhanced } from './HROIQOnboardingToolEnhanced';
import { HROIQServiceLogWithCSV } from './HROIQServiceLogWithCSV';
import { HROIQAIAssistant } from './HROIQAIAssistant';
import { HROIQSettings } from './HROIQSettings';
import HROIQEmployeeManagementEnhanced from './HROIQEmployeeManagementEnhanced';
import HROIQPolicyBuilder from './HROIQPolicyBuilder';
import HROIQComplianceDashboard from './HROIQComplianceDashboard';
import HROIQAskExpertEnhanced from './HROIQAskExpertEnhanced';
import { HROIQLMSCreditTracker } from './HROIQLMSCreditTracker';
import HROIQOnboardingToolWithLanguage from './HROIQOnboardingToolWithLanguage';
import { HaaLOIQTab } from '../../../components/shared/tabs/HaaLOIQTab';

const HROIQLayout: React.FC = () => {
  console.log('🔍 HRO IQ Layout component is mounting');
  
  const { hasRole, isCompanyAdmin, isSuperAdmin, userRoles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Get the appropriate launchpad route based on user role
  const getLaunchpadRoute = () => {
    if (userRoles?.includes('super_admin')) return '/launchpad/system';
    if (userRoles?.includes('company_admin')) return '/launchpad/company-admin';
    if (userRoles?.includes('client_admin')) return '/launchpad/client-admin';
    if (userRoles?.includes('admin')) return '/launchpad/admin';
    if (userRoles?.includes('learner')) return '/launchpad/learn';
    return '/launchpad/employee';
  };

  console.log('🔍 HRO IQ Layout component is mounting');
  console.log('🔍 HRO IQ Layout current state:', { 
    location: location.pathname, 
    activeTab,
    userRoles: { isCompanyAdmin, isSuperAdmin }
  });
  console.log('🔍 HRO IQ Layout DEBUG - Current URL components:', {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state
  });

  // Set active tab based on current URL
  useEffect(() => {
    const path = location.pathname;
    console.log('🔍 HRO IQ Layout URL Detection:', { path, currentActiveTab: activeTab });
    
    if (path.includes('/client')) {
      setActiveTab('client');
    } else if (path.includes('/service-log')) {
      setActiveTab('service-log');
    } else if (path.includes('/onboarding')) {
      setActiveTab('onboarding');
    } else if (path.includes('/employees')) {
      setActiveTab('employees');
    } else if (path.includes('/policies')) {
      setActiveTab('policies');
    } else if (path.includes('/compliance')) {
      setActiveTab('compliance');
    } else if (path.includes('/ask-expert')) {
      setActiveTab('ask-expert');
    } else if (path.includes('/lms-tracker')) {
      setActiveTab('lms-tracker');
    } else if (path.includes('/dashboard')) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Remove unused handler functions since we're using direct navigation
  const clientId = selectedClientId || 'demo-client-123';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin/hro-iq${tabId === 'dashboard' ? '' : `/${tabId}`}`);
  };

  const tabs: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      component: <HROIQDashboard />
    },
    {
      id: 'client',
      label: 'Client',
      component: (
        <HROIQClientDashboard
          clientId={clientId}
          onRequestSupport={() => setActiveTab('service-log')}
          onSendOnboarding={() => setActiveTab('onboarding')}
          onUploadDocs={() => setActiveTab('deliverables')}
          onViewHistory={() => setActiveTab('service-log')}
        />
      )
    },
    {
      id: 'service-log',
      label: 'Service Log',
      component: <HROIQServiceLogWithCSV />
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      component: <HROIQOnboardingToolWithLanguage />
    },
    {
      id: 'employees',
      label: 'Employees',
      component: <HROIQEmployeeManagementEnhanced />
    },
    {
      id: 'policies',
      label: 'Policies',
      component: <HROIQPolicyBuilder />
    },
    {
      id: 'compliance',
      label: 'Compliance',
      component: <HROIQComplianceDashboard />
    },
    {
      id: 'ask-expert',
      label: 'Ask Expert',
      component: <HROIQAskExpertEnhanced />
    },
    {
      id: 'lms-tracker',
      label: 'LMS Tracker',
      component: <HROIQLMSCreditTracker />
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(getLaunchpadRoute())}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Launchpad
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HRO IQ</h1>
              <p className="text-muted-foreground">Human Resource Outsourcing Intelligence Platform</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Active Retainer
        </Badge>
      </div>

      {/* Custom Tab Navigation for HRO IQ */}
      <div className="space-y-6">
        <div className="w-full">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="space-y-4">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default HROIQLayout;
