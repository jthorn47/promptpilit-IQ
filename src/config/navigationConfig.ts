import { LucideIcon } from 'lucide-react';
import { 
  Crown, BarChart3, Tags, Home, Settings, Users, FileText, 
  Calendar, MessageSquare, Shield, Briefcase, DollarSign,
  TrendingUp, Activity, Bell, Eye, CheckSquare, Clock,
  Archive, Database, Zap, Layout, PieChart, Target,
  Workflow, GitBranch, Package, Server, Monitor,
  AlertTriangle, Mail, Phone, Video, MapPin, Building,
  BookOpen, GraduationCap
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: string[];
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationSection {
  id: string;
  title: string;
  icon?: LucideIcon;
  roles?: string[];
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// SuperAdmin Navigation Configuration
export const superAdminNavigation: NavigationSection[] = [
  {
    id: 'superadmin-core',
    title: 'SuperAdmin',
    icon: Crown,
    roles: ['super_admin'],
    collapsible: false,
    items: [
      {
        id: 'control-center',
        title: 'Control Center',
        url: '/system/dashboard',
        icon: Crown,
        exact: true,
        roles: ['super_admin']
      }
    ]
  }
];

// HaaLO IQ Navigation Configuration
export const haloIQNavigation: NavigationSection = {
  id: 'halo-iq',
  title: 'HaaLO IQ',
  icon: Zap,
  roles: ['super_admin', 'company_admin'],
  collapsible: true,
  defaultOpen: false,
  items: [
    {
      id: 'vault',
      title: 'The Vault',
      url: '/halo/vault',
      icon: Database,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'pulse',
      title: 'Pulse CMS',
      url: '/halo/pulse',
      icon: Activity,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      id: 'vaultpay',
      title: 'VaultPay',
      url: '/halo/vaultpay',
      icon: DollarSign,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'integrations',
      title: 'DataBridge',
      url: '/halo/integrations',
      icon: Database,
      roles: ['super_admin']
    },
    {
      id: 'haalo-crm',
      title: 'Connect IQ',
      url: '/admin/crm/companies',
      icon: Briefcase,
      roles: ['admin', 'super_admin']
    },
    {
      id: 'timetrack',
      title: 'Time IQ',
      url: '/halo/time',
      icon: Clock,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'compx',
      title: 'CompX',
      url: '/halo/comp',
      icon: TrendingUp,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'complyiq',
      title: 'ComplyIQ',
      url: '/halo/comply',
      icon: Shield,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'reportiq',
      title: 'Report IQ',
      url: '/admin/halo/iq',
      icon: PieChart,
      roles: ['company_admin', 'super_admin']
    },
    {
      id: 'benefitsiq',
      title: 'Benefits IQ',
      url: '/admin/halo/benefitsiq',
      icon: Target,
      roles: ['company_admin', 'super_admin']
    },
    {
      id: 'conversation-analytics',
      title: 'Conversation Analytics',
      url: '/halo-iq/conversation-analytics',
      icon: BarChart3,
      roles: ['super_admin', 'company_admin']
    }
  ]
};

// Halo Payroll Navigation Configuration
export const haloPayrollNavigation: NavigationSection = {
  id: 'halo-payroll',
  title: 'Halo Payroll',
  icon: DollarSign,
  roles: ['super_admin', 'company_admin', 'payroll_admin'],
  collapsible: true,
  defaultOpen: false,
  items: [
    {
      id: 'payroll-dashboard',
      title: 'Payroll Dashboard',
      url: '/payroll',
      icon: Layout,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'payroll-processing',
      title: 'Payroll Processing',
      url: '/admin/payroll/processing',
      icon: Workflow,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'pay-types',
      title: 'Pay Types',
      url: '/payroll/pay-types',
      icon: Package,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'benefits-management',
      title: 'Benefits Management',
      url: '/payroll/super-admin-benefits',
      icon: Shield,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'ach-processing',
      title: 'ACH Processing',
      url: '/payroll/ach',
      icon: GitBranch,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'payroll-reports',
      title: 'Payroll Reports',
      url: '/payroll/reports',
      icon: FileText,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'f45-payroll',
      title: 'F45 Payroll',
      url: '/payroll/f45-dashboard',
      icon: Activity,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'employees',
      title: 'Employees',
      url: '/employees',
      icon: Users,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'timetrack-payroll',
      title: 'Time IQ',
      url: '/halo/time',
      icon: Clock,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'vaultpay-payroll',
      title: 'VaultPay',
      url: '/halo/vaultpay',
      icon: DollarSign,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'client-settings',
      title: 'Client Settings',
      url: '/payroll/client-settings',
      icon: Settings,
      roles: ['super_admin', 'company_admin']
    },
    {
      id: 'compx-payroll',
      title: 'CompX',
      url: '/halo/comp',
      icon: TrendingUp,
      roles: ['super_admin', 'company_admin']
    }
  ]
};

// Company Navigation Configuration
export const companyNavigation: NavigationSection[] = [
  {
    id: 'company-overview',
    title: 'Overview',
    icon: Home,
    roles: ['company_admin', 'learner'],
    collapsible: false,
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
        exact: true,
        roles: ['company_admin', 'learner']
      },
      {
        id: 'company-settings',
        title: 'Company',
        url: '/company',
        icon: Building,
        roles: ['company_admin']
      }
    ]
  },
  {
    id: 'learning-management',
    title: 'Learning & Development',
    icon: BookOpen,
    roles: ['company_admin', 'learner'],
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        id: 'training',
        title: 'Training',
        url: '/training',
        icon: BookOpen,
        roles: ['company_admin', 'learner']
      },
      {
        id: 'learning',
        title: 'Learning',
        url: '/learning',
        icon: GraduationCap,
        roles: ['company_admin', 'learner']
      },
      {
        id: 'compliance',
        title: 'Compliance',
        url: '/compliance',
        icon: Shield,
        roles: ['company_admin', 'learner']
      },
      {
        id: 'assessments',
        title: 'Assessments',
        url: '/assessments',
        icon: CheckSquare,
        roles: ['company_admin', 'learner']
      }
    ]
  }
];

// Helper function to get navigation for user role
export const getNavigationForRole = (userRoles: string[]): NavigationSection[] => {
  const navigation: NavigationSection[] = [];

  // Add SuperAdmin navigation if user is super admin
  if (userRoles.includes('super_admin')) {
    navigation.push(...superAdminNavigation);
    navigation.push(haloIQNavigation);
    navigation.push(haloPayrollNavigation);
  }

  // Add Company navigation for company users
  if (userRoles.some(role => ['company_admin', 'learner'].includes(role))) {
    navigation.push(...companyNavigation);
  }

  return navigation;
};

// Helper function to check if user can access item
export const canAccessItem = (item: NavigationItem, userRoles: string[]): boolean => {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.some(role => userRoles.includes(role));
};