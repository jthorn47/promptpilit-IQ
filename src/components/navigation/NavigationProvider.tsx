
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { NavigationSection, NavigationItem } from '@/config/navigationConfig';
import { moduleRegistry } from '@/modules/core/ModuleLoader';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GraduationCap, 
  Calculator, 
  Shield, 
  Heart, 
  CreditCard,
  HelpCircle,
  Settings,
  Briefcase,
  UserCheck,
  FileText,
  BarChart3,
  Mail,
  Megaphone,
  Server,
  Crown,
  Zap,
  DollarSign,
  Activity,
  Archive,
  Database,
  Clock,
  TrendingUp,
  Target,
  PieChart,
  Package,
  GitBranch,
  Workflow,
  Layout,
  BookOpen,
  Monitor,
  Tags,
  Award,
  Brain,
  Medal,
  Plug,
  Smartphone
} from 'lucide-react';

interface NavigationContextType {
  navigation: NavigationSection[];
  openSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  isSectionOpen: (sectionId: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, userRoles, isSuperAdmin, isCompanyAdmin, isAdmin } = useAuth();
  const { canManageUsers, canManageSystem, canViewAnalytics, hasRole, canAccessSync, hasModuleAccess } = usePermissionContext();
  
  // Initialize openSections from localStorage
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('navigation-open-sections');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.warn('Failed to load navigation state from localStorage:', error);
      return new Set();
    }
  });
  
  const [navigation, setNavigation] = useState<NavigationSection[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      
      // Persist to localStorage
      try {
        localStorage.setItem('navigation-open-sections', JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.warn('Failed to save navigation state to localStorage:', error);
      }
      
      return newSet;
    });
  };

  const isSectionOpen = (sectionId: string) => openSections.has(sectionId);

  useEffect(() => {
    if (!userRoles || userRoles.length === 0) return;

    const buildSuperAdminNavigation = (): NavigationSection[] => {
      const sections: NavigationSection[] = [];

      // HALO IQ Section
      const haloIQItems: NavigationItem[] = [
        {
          id: 'vault',
          title: 'The Vault',
          url: '/halo/vault',
          icon: Archive
        },
        {
          id: 'pulse',
          title: 'Pulse CMS',
          url: '/halo/pulse',
          icon: Activity
        },
        {
          id: 'vaultpay',
          title: 'VaultPay',
          url: '/halo/vaultpay',
          icon: DollarSign
        },
        {
          id: 'databridge',
          title: 'DataBridge',
          url: '/halo/integrations',
          icon: Database
        },
        {
          id: 'timetrack',
          title: 'Time IQ',
          url: '/halo/time',
          icon: Clock
        },
        {
          id: 'compx',
          title: 'CompX',
          url: '/halo/comp',
          icon: TrendingUp
        },
        {
          id: 'report-iq',
          title: 'Report IQ',
          url: '/admin/halo/iq',
          icon: PieChart
        },
        {
          id: 'benefits-iq',
          title: 'Benefits IQ',
          url: '/admin/halo/benefitsiq',
          icon: Target
        }
      ];

      sections.push({
        id: 'halo-iq',
        title: 'HALO IQ',
        icon: Zap,
        items: haloIQItems,
        collapsible: true,
        defaultOpen: false
      });

      // Connect IQ Section (CRM) (2nd position)
      const connectIQItems: NavigationItem[] = [
        {
          id: 'connectiq-dashboard',
          title: 'CRM Dashboard',
          url: '/admin/connectiq/dashboard',
          icon: BarChart3,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-companies',
          title: 'Companies',
          url: '/admin/connectiq/companies',
          icon: Building2,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-contacts',
          title: 'Contacts',
          url: '/admin/connectiq/contacts',
          icon: Users,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-opportunities',
          title: 'Opportunities',
          url: '/admin/connectiq/opportunities',
          icon: TrendingUp,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-activities',
          title: 'Activities',
          url: '/admin/connectiq/activities',
          icon: Activity,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-tags',
          title: 'Tags',
          url: '/admin/connectiq/tags',
          icon: Tags,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-notes',
          title: 'Notes',
          url: '/admin/connectiq/notes',
          icon: FileText,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-custom-fields',
          title: 'Custom Fields',
          url: '/admin/connectiq/custom-fields',
          icon: Settings,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-pipelines',
          title: 'Pipelines & Stages',
          url: '/admin/connectiq/pipelines',
          icon: Target,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-contracts',
          title: 'Client Contracts',
          url: '/admin/connectiq/contracts',
          icon: FileText,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-attachments',
          title: 'Attachments',
          url: '/admin/connectiq/attachments',
          icon: Archive,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-communications',
          title: 'Communications Log',
          url: '/admin/connectiq/communications',
          icon: Mail,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-reporting',
          title: 'Deal Value Reporting',
          url: '/admin/connectiq/reporting',
          icon: PieChart,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-lead-sources',
          title: 'Lead Source Attribution',
          url: '/admin/connectiq/lead-sources',
          icon: Users,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-email-templates',
          title: 'Email Templates',
          url: '/admin/connectiq/email-templates',
          icon: Mail,
          roles: ['super_admin', 'company_admin']
        },
        {
          id: 'connectiq-hubspot-integration',
          title: 'HubSpot Integration',
          url: '/admin/integrations/hubspot',
          icon: Database,
          roles: ['super_admin', 'company_admin']
        }
      ];

      sections.push({
        id: 'connect-iq',
        title: 'Connect IQ (CRM)',
        icon: Users,
        items: connectIQItems,
        collapsible: true,
        defaultOpen: false
      });

      // CRM Section (3rd position)
      const crmItems: NavigationItem[] = [
        {
          id: 'crm-dashboard',
          title: 'Dashboard', 
          url: '/admin/crm/dashboard',
          icon: BarChart3,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-companies',
          title: 'Companies',
          url: '/admin/crm/companies',
          icon: Building2,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-contacts',
          title: 'Contacts',
          url: '/admin/crm/contacts',
          icon: Users,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-opportunities',
          title: 'Opportunities',
          url: '/admin/crm/deals',
          icon: TrendingUp,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-navigator',
          title: 'Navigator',
          url: '/admin/crm/pipeline',
          icon: Target,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-assessments',
          title: 'Risk Assessments',
          url: '/admin/crm/assessments',
          icon: Shield,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-proposals',
          title: 'Proposals',
          url: '/admin/crm/proposals',
          icon: FileText,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-activities',
          title: 'Tasks & Follow-Ups',
          url: '/admin/crm/activities',
          icon: Activity,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-automations',
          title: 'Automations',
          url: '/admin/crm/email-campaigns',
          icon: Workflow,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-forecasting',
          title: 'Forecasting',
          url: '/admin/crm/forecasting',
          icon: PieChart,
          roles: ['admin', 'super_admin']
        },
        {
          id: 'crm-settings',
          title: 'Settings',
          url: '/admin/crm/settings',
          icon: Settings,
          roles: ['admin', 'super_admin']
        }
      ];

      sections.push({
        id: 'crm',
        title: 'CRM',
        icon: Users,
        items: crmItems,
        collapsible: true,
        defaultOpen: false
      });


      // Payroll IQ Section (3rd position)
      const payrollItems: NavigationItem[] = [
        {
          id: 'payroll-dashboard',
          title: 'Payroll Dashboard',
          url: '/payroll',
          icon: Layout
        },
        {
          id: 'payroll-processing',
          title: 'Payroll Processing',
          url: '/admin/payroll/processing',
          icon: Workflow
        },
        {
          id: 'pay-types',
          title: 'Pay Types',
          url: '/payroll/pay-types',
          icon: Package
        },
        {
          id: 'benefits-management',
          title: 'Benefits Management',
          url: '/payroll/super-admin-benefits',
          icon: Shield
        },
        {
          id: 'ach-processing',
          title: 'ACH Processing',
          url: '/payroll/ach',
          icon: GitBranch
        },
        {
          id: 'payroll-reports',
          title: 'Payroll Reports',
          url: '/payroll/reports',
          icon: FileText
        },
        {
          id: 'f45-payroll',
          title: 'F45 Payroll',
          url: '/payroll/f45-dashboard',
          icon: Activity
        },
        {
          id: 'employees',
          title: 'Employees',
          url: '/admin/employees',
          icon: Users
        }
      ];

      sections.push({
        id: 'halo-payroll',
        title: 'Payroll IQ',
        icon: DollarSign,
        items: payrollItems,
        collapsible: true,
        defaultOpen: false
      });

      // HRO IQ Section (3rd position)
      const hroIQItems: NavigationItem[] = [
        {
          id: 'hroiq-dashboard',
          title: 'Dashboard',
          url: '/admin/hro-iq/dashboard',
          icon: TrendingUp,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-client',
          title: 'Client Dashboard',
          url: '/admin/hro-iq/client',
          icon: Users,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-requests',
          title: 'Request Center',
          url: '/admin/hro-iq/requests',
          icon: Mail,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-deliverables',
          title: 'Deliverables',
          url: '/admin/hro-iq/deliverables',
          icon: FileText,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-onboarding',
          title: 'Onboarding',
          url: '/admin/hro-iq/onboarding',
          icon: Package,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-service-log',
          title: 'Service Log',
          url: '/admin/hro-iq/service-log',
          icon: Clock,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        },
        {
          id: 'hroiq-settings',
          title: 'Settings',
          url: '/admin/hro-iq/settings',
          icon: Settings,
          roles: ['admin', 'super_admin', 'company_admin', 'client_admin']
        }
      ];

      sections.push({
        id: 'hro-iq',
        title: 'HRO IQ',
        icon: Briefcase,
        items: hroIQItems,
        collapsible: true,
        defaultOpen: false
      });

      // Finance IQ Section (3rd position)
      const financeItems: NavigationItem[] = [
        {
          id: 'finance-dashboard',
          title: 'Finance Dashboard', 
          url: '/halo/finance',
          icon: BarChart3
        },
        {
          id: 'general-ledger',
          title: 'General Ledger',
          url: '/finance/general-ledger',
          icon: FileText
        },
        {
          id: 'chart-of-accounts',
          title: 'Chart of Accounts',
          url: '/halo/finance#chart-of-accounts',
          icon: FileText
        },
        {
          id: 'trial-balance',
          title: 'Trial Balance',
          url: '/halo/finance#trial-balance',
          icon: PieChart
        }
      ];

      sections.push({
        id: 'finance-iq',
        title: 'Finance IQ',
        icon: BarChart3,
        items: financeItems,
        collapsible: true,
        defaultOpen: false
      });

      // Client IQ Section (4th position)
      const clientItems: NavigationItem[] = [
        {
          id: 'clients',
          title: 'Clients',
          url: '/admin/clients',
          icon: Building2
        },
        {
          id: 'client-onboarding',
          title: 'Client Onboarding',
          url: '/admin/clients/onboarding',
          icon: UserCheck
        },
        {
          id: 'client-settings',
          title: 'Client Settings',
          url: '/admin/clients/settings',
          icon: Settings
        },
        {
          id: 'client-support',
          title: 'Client Support',
          url: '/admin/clients/support',
          icon: HelpCircle
        }
      ];

      sections.push({
        id: 'client-iq',
        title: 'Client IQ',
        icon: Building2,
        items: clientItems,
        collapsible: true,
        defaultOpen: false
      });

      // Learn IQ Section  
      const learnItems: NavigationItem[] = [
        {
          id: 'gamification',
          title: 'Gamification',
          url: '/admin/haalo-learn/gamification',
          icon: Award
        },
        {
          id: 'adaptive-quiz',
          title: 'Adaptive Quiz',
          url: '/admin/haalo-learn/adaptive-quiz',
          icon: Brain
        },
        {
          id: 'micro-learning',
          title: 'Micro Learning',
          url: '/admin/haalo-learn/micro-learning',
          icon: Zap
        },
        {
          id: 'learning-paths-advanced',
          title: 'Learning Paths',
          url: '/admin/haalo-learn/learning-paths',
          icon: GitBranch
        },
        {
          id: 'ai-assessments',
          title: 'AI Assessments',
          url: '/admin/haalo-learn/ai-assessments',
          icon: Brain
        },
        {
          id: 'social-learning',
          title: 'Social Learning',
          url: '/admin/haalo-learn/social-learning',
          icon: Users
        },
        {
          id: 'badges-achievements',
          title: 'Badges & Achievements',
          url: '/admin/haalo-learn/badges',
          icon: Medal
        },
        {
          id: 'analytics-insights',
          title: 'Analytics & Insights',
          url: '/admin/haalo-learn/learning-analytics',
          icon: TrendingUp
        }
      ];

      sections.push({
        id: 'learn-iq',
        title: 'Learn IQ',
        icon: Brain,
        items: learnItems,
        collapsible: true,
        defaultOpen: false
      });

      // EaseLearn LMS Section
      const easeLearnItems: NavigationItem[] = [
        {
          id: 'easelearn-dashboard',
          title: 'LMS Dashboard',
          url: '/admin/easelearn/dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'easelearn-admin',
          title: 'LMS Admin',
          url: '/admin/easelearn/admin',
          icon: Settings
        },
        {
          id: 'training-modules',
          title: 'Training Modules',
          url: '/admin/training-modules',
          icon: GraduationCap
        },
        {
          id: 'courses',
          title: 'Courses',
          url: '/admin/easelearn/courses',
          icon: BookOpen
        },
        {
          id: 'certificates',
          title: 'Certificates',
          url: '/admin/certificates',
          icon: Shield
        },
        {
          id: 'lms-reports',
          title: 'LMS Reports',
          url: '/admin/lms-reports',
          icon: BarChart3
        },
        {
          id: 'media-library',
          title: 'Media Library',
          url: '/admin/easelearn/media',
          icon: FileText
        },
        {
          id: 'learning-paths',
          title: 'Learning Paths',
          url: '/admin/easelearn/paths',
          icon: Target
        }
      ];

      sections.push({
        id: 'easelearn-lms',
        title: 'EaseLearn LMS',
        icon: GraduationCap,
        items: easeLearnItems,
        collapsible: true,
        defaultOpen: true
      });

      // Consulting Services Section
      const consultingItems: NavigationItem[] = [
        {
          id: 'consulting-dashboard',
          title: 'Consulting Dashboard',
          url: '/admin/consulting/dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'risk-assessment',
          title: 'Risk Assessment',
          url: '/admin/consulting/assessment',
          icon: Target
        },
        {
          id: 'client-projects',
          title: 'Client Projects',
          url: '/admin/consulting/projects',
          icon: Briefcase
        },
        {
          id: 'deliverables',
          title: 'Deliverables',
          url: '/admin/consulting/deliverables',
          icon: FileText
        },
        {
          id: 'time-tracking',
          title: 'Time Tracking',
          url: '/admin/consulting/time',
          icon: Clock
        },
        {
          id: 'consulting-reports',
          title: 'Consulting Reports',
          url: '/admin/consulting/reports',
          icon: BarChart3
        }
      ];

      sections.push({
        id: 'consulting-services',
        title: 'Consulting Services',
        icon: Briefcase,
        items: consultingItems,
        collapsible: true,
        defaultOpen: false
      });

      // Marketing IQ Section
      const marketingItems: NavigationItem[] = [
        {
          id: 'marketing-dashboard',
          title: 'Marketing Dashboard',
          url: '/admin/marketing/dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'email-templates',
          title: 'Email Templates',
          url: '/admin/email/templates',
          icon: FileText
        },
        {
          id: 'email-campaigns',
          title: 'Email Campaigns',
          url: '/admin/email/campaigns',
          icon: Mail
        },
        {
          id: 'lead-management',
          title: 'Lead Management',
          url: '/admin/marketing/leads',
          icon: Users
        },
        {
          id: 'marketing-automation',
          title: 'Marketing Automation',
          url: '/admin/marketing/automation',
          icon: Zap
        },
        {
          id: 'social-media',
          title: 'Social Media',
          url: '/admin/marketing/social',
          icon: Megaphone
        },
        {
          id: 'email-analytics',
          title: 'Email Analytics',
          url: '/admin/email/analytics',
          icon: BarChart3
        }
      ];

      sections.push({
        id: 'marketing-iq',
        title: 'Marketing IQ',
        icon: Megaphone,
        items: marketingItems,
        collapsible: true,
        defaultOpen: false
      });

      // Reports IQ Section
      const reportsItems: NavigationItem[] = [
        {
          id: 'executive-reports',
          title: 'Executive Reports',
          url: '/admin/reports/executive',
          icon: PieChart
        },
        {
          id: 'operational-reports',
          title: 'Operational Reports',
          url: '/admin/reports/operational',
          icon: BarChart3
        },
        {
          id: 'compliance-reports',
          title: 'Compliance Reports',
          url: '/admin/reports/compliance',
          icon: Shield
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          url: '/admin/reports/custom',
          icon: FileText
        },
        {
          id: 'business-intelligence',
          title: 'Business Intelligence',
          url: '/admin/analytics/bi',
          icon: TrendingUp
        },
        {
          id: 'performance-metrics',
          title: 'Performance Metrics',
          url: '/admin/analytics/metrics',
          icon: Activity
        },
        {
          id: 'predictive-analytics',
          title: 'Predictive Analytics',
          url: '/admin/analytics/predictive',
          icon: Brain
        },
        {
          id: 'real-time-dashboard',
          title: 'Real-time Dashboard',
          url: '/admin/analytics/realtime',
          icon: Monitor
        }
      ];

      sections.push({
        id: 'reports-iq',
        title: 'Reports IQ',
        icon: BarChart3,
        items: reportsItems,
        collapsible: true,
        defaultOpen: false
      });

      // Additional Tools Section
      const toolsItems: NavigationItem[] = [
        {
          id: 'bulk-operations',
          title: 'Bulk Operations',
          url: '/admin/tools/bulk',
          icon: Package
        },
        {
          id: 'api-management',
          title: 'API Management',
          url: '/admin/tools/api',
          icon: Workflow
        }
      ];

      sections.push({
        id: 'additional-tools',
        title: 'Additional Tools',
        icon: Package,
        items: toolsItems,
        collapsible: true,
        defaultOpen: false
      });

      // System Section
      const systemItems: NavigationItem[] = [
        {
          id: 'system-dashboard',
          title: 'System Dashboard',
          url: '/admin/system/dashboard',
          icon: Monitor
        },
        {
          id: 'system-email-templates',
          title: 'System Email Templates',
          url: '/admin/system/email-templates',
          icon: Mail,
          roles: ['super_admin']
        },
        {
          id: 'user-management',
          title: 'User Management',
          url: '/admin/users',
          icon: Users
        },
        {
          id: 'permissions',
          title: 'Permissions & Roles',
          url: '/admin/permissions',
          icon: Shield
        },
        {
          id: 'system-config',
          title: 'System Configuration',
          url: '/admin/config',
          icon: Settings
        },
        {
          id: 'integration-hub',
          title: 'Integration Hub',
          url: '/admin/integrations',
          icon: Plug
        },
        {
          id: 'system-logs',
          title: 'System Logs',
          url: '/admin/system/logs',
          icon: FileText
        },
        {
          id: '2fa-management',
          title: '2FA Management',
          url: '/admin/2fa',
          icon: Smartphone
        },
        {
          id: 'backup-restore',
          title: 'Backup & Restore',
          url: '/admin/system/backup',
          icon: Archive
        }
      ];

      sections.push({
        id: 'system',
        title: 'System',
        icon: Settings,
        items: systemItems,
        collapsible: true,
        defaultOpen: false
      });

      // Get dynamic modules from registry for logging only
      const accessibleModules = moduleRegistry.getAccessibleModules();
      const dynamicMenuItems = moduleRegistry.getAllMenuItems();

      logger.ui.debug('NavigationProvider: Module integration check', {
        accessibleModulesCount: accessibleModules.length,
        dynamicMenuItemsCount: dynamicMenuItems.length,
        moduleRegistryReady: moduleRegistry.isReady(),
        moduleAccessEntries: dynamicMenuItems.map(item => ({ id: item.id, label: item.label, path: item.path }))
      });

      return sections;
    };

    const buildCompanyAdminNavigation = (): NavigationSection[] => {
      const sections: NavigationSection[] = [];

      // Main section
      sections.push({
        id: 'main',
        title: 'Main',
        items: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutDashboard,
            exact: true
          },
          {
            id: 'company',
            title: 'Company',
            url: '/company',
            icon: Building2
          }
        ],
        collapsible: false
      });

      // Learning & Development section
      const learningItems: NavigationItem[] = [
        {
          id: 'training',
          title: 'Training',
          url: '/training',
          icon: GraduationCap
        },
        {
          id: 'learning',
          title: 'Learning',
          url: '/learning',
          icon: GraduationCap
        },
        {
          id: 'compliance',
          title: 'Compliance',
          url: '/compliance',
          icon: Shield
        },
        {
          id: 'assessments',
          title: 'Assessments',
          url: '/assessments',
          icon: UserCheck
        }
      ];

      sections.push({
        id: 'learning',
        title: 'Learning & Development',
        icon: GraduationCap,
        items: learningItems,
        collapsible: true,
        defaultOpen: true
      });

      return sections;
    };

    const buildClientAdminNavigation = (): NavigationSection[] => {
      const sections: NavigationSection[] = [];
      const mainItems: NavigationItem[] = [];

      // Always show Dashboard
      if (canAccessSync('dashboard', 'view')) {
        mainItems.push({
          id: 'dashboard',
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
          exact: false
        });
      }

      // Users management
      if (canAccessSync('users', 'view')) {
        mainItems.push({
          id: 'users',
          title: 'Users',
          url: '/users',
          icon: Users,
          exact: false
        });
      }

      // Company profile
      if (canAccessSync('company', 'view')) {
        mainItems.push({
          id: 'company',
          title: 'Company Profile',
          url: '/company',
          icon: Building2,
          exact: false
        });
      }

      if (mainItems.length > 0) {
        sections.push({
          id: 'main',
          title: 'Main',
          items: mainItems,
          collapsible: false
        });
      }

      return sections;
    };

    const buildDefaultNavigation = (): NavigationSection[] => {
      return [
        {
          id: 'main',
          title: 'Main',
          items: [
            {
              id: 'dashboard',
              title: 'Dashboard',
              url: '/launchpad',
              icon: LayoutDashboard,
              exact: false
            }
          ],
          collapsible: false
        }
      ];
    };

    let newNavigation: NavigationSection[] = [];

    // Build navigation based on user role
    if (isSuperAdmin) {
      newNavigation = buildSuperAdminNavigation();
    } else if (isCompanyAdmin) {
      newNavigation = buildCompanyAdminNavigation();
    } else if (userRole === 'client_admin') {
      newNavigation = buildClientAdminNavigation();
    } else {
      newNavigation = buildDefaultNavigation();
    }

    logger.ui.debug('NavigationProvider: Built navigation for role', { 
      userRole, 
      userRoles, 
      isSuperAdmin, 
      isCompanyAdmin, 
      navigationCount: newNavigation.length,
      sectionCount: newNavigation.map(s => s.items?.length || 0).reduce((a, b) => a + b, 0)
    });
    
    setNavigation(newNavigation);
  }, [userRole, userRoles, isSuperAdmin, isCompanyAdmin, isAdmin, canAccessSync, hasModuleAccess]);

  const value = {
    navigation,
    openSections,
    toggleSection,
    isSectionOpen,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
