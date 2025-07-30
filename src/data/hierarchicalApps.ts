import {
  Archive,
  Timer,
  DollarSign,
  FileSpreadsheet,
  Shield,
  BookOpen,
  Settings,
  Folder,
  BarChart3,
  TrendingUp,
  PieChart,
  Calculator,
  CreditCard,
  Heart,
  Clock,
  UserCheck,
  FileText,
  Database,
  Cog,
  Bell,
  Lock,
  Users,
  GraduationCap,
  Brain,
  Zap,
  Building2,
  Target,
  Award,
  Activity,
  AlertTriangle,
  Vault as VaultIcon,
  Megaphone,
  Mail,
  LayoutDashboard,
  Monitor
} from 'lucide-react';

// HALO IQ Children - Updated with 9 core modules as specified
export const haloIQChildren = [
  {
    id: 'vault',
    title: 'The Vault',
    description: 'Secure data storage and management',
    url: '/halo-iq/vault',
    icon: VaultIcon,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'Automated business process workflows',
    url: '/halo-iq/workflow-automation',
    icon: Zap,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'training-iq',
    title: 'Training IQ',
    description: 'Employee training and development',
    url: '/halo-iq/training-iq',
    icon: GraduationCap,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'tax-iq',
    title: 'Tax IQ',
    description: 'Internal tax engine for payroll and finance calculations',
    url: '/halo-iq/tax',
    icon: Calculator,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'hro-iq-u',
    title: 'HRO IQ-U',
    description: 'HR outsourcing university and knowledge base',
    url: '/halo-iq/hro-iq-u',
    icon: BookOpen,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'compliance-engine',
    title: 'Compliance Engine',
    description: 'Automated compliance monitoring and reporting',
    url: '/halo-iq/compliance-engine',
    icon: Shield,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs',
    description: 'System audit trails and security logging',
    url: '/halo-iq/audit-logs',
    icon: FileText,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'analytics-forecasting',
    title: 'Analytics & Forecasting',
    description: 'Predictive analytics and business forecasting',
    url: '/halo-iq/analytics-forecasting',
    icon: TrendingUp,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'identity-permissions',
    title: 'Identity & Permissions',
    description: 'User identity management and access control',
    url: '/halo-iq/identity-permissions',
    icon: Lock,
    roles: ['super_admin', 'company_admin', 'client_admin']
  }
];

// Pulse CMS Children - Now a standalone parent module
export const pulseCMSChildren = [
  {
    id: 'pulse-reports',
    title: 'Reports',
    description: 'Comprehensive case management reports and analytics',
    url: '/pulse-cms/reports',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin', 'case_manager'],
    children: [
      {
        id: 'case-resolution-trends',
        title: 'Case Resolution Trends',
        description: 'Track resolution time trends, SLA compliance, and performance',
        url: '/pulse-cms/reports/case-resolution-trends',
        icon: TrendingUp,
        roles: ['super_admin', 'company_admin', 'case_manager']
      },
      {
        id: 'compliance-dashboard',
        title: 'Compliance Dashboard',
        description: 'Monitor adherence to policies and legal mandates',
        url: '/pulse-cms/reports/compliance-dashboard',
        icon: Shield,
        roles: ['super_admin', 'company_admin', 'case_manager']
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment Report',
        description: 'Surface high-risk cases and systemic issues',
        url: '/pulse-cms/reports/risk-assessment',
        icon: AlertTriangle,
        roles: ['super_admin', 'company_admin', 'case_manager']
      },
      {
        id: 'performance-analytics',
        title: 'Performance Analytics',
        description: 'Evaluate team efficiency and task completion',
        url: '/pulse-cms/reports/performance-analytics',
        icon: Target,
        roles: ['super_admin', 'company_admin', 'case_manager']
      },
      {
        id: 'resource-utilization',
        title: 'Resource Utilization',
        description: 'Measure workload distribution and time investment',
        url: '/pulse-cms/reports/resource-utilization',
        icon: Clock,
        roles: ['super_admin', 'company_admin', 'case_manager']
      }
    ]
  }
];

// VaultPay Children - Now a standalone parent module
export const vaultPayChildren = [
  {
    id: 'payment-processing',
    title: 'Payment Processing',
    description: 'Process payments and transactions',
    url: '/vaultpay/processing',
    icon: CreditCard,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'payment-reports',
    title: 'Payment Reports',
    description: 'Generate payment analytics and reports',
    url: '/vaultpay/reports',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  }
];

// CompX Children - Now a standalone parent module
export const compXChildren = [
  {
    id: 'compensation-analysis',
    title: 'Compensation Analysis',
    description: 'Analyze compensation structures and trends',
    url: '/compx/analysis',
    icon: TrendingUp,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'wage-management',
    title: 'Wage Management',
    description: 'Manage employee wages and salary structures',
    url: '/compx/wages',
    icon: DollarSign,
    roles: ['super_admin', 'company_admin']
  }
];

// ComplyIQ Children - Now a standalone parent module
export const complyIQChildren = [
  {
    id: 'compliance-monitoring',
    title: 'Compliance Monitoring',
    description: 'Monitor regulatory compliance',
    url: '/complyiq/monitoring',
    icon: Shield,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'policy-management',
    title: 'Policy Management',
    description: 'Manage company policies and procedures',
    url: '/complyiq/policies',
    icon: BookOpen,
    roles: ['super_admin', 'company_admin']
  }
];

// Report IQ Children - Now a standalone parent module
export const reportIQChildren = [
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Comprehensive business analytics',
    url: '/reportiq/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'custom-reports',
    title: 'Custom Reports',
    description: 'Create and manage custom reports',
    url: '/reportiq/custom',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  }
];

// DataBridge IQ Children
export const dataBridgeIQChildren = [
  {
    id: 'data-integration',
    title: 'DataBridge',
    description: 'Connect and sync data across systems',
    url: '/admin/databridge/integration',
    icon: Database,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Unified analytics and reporting',
    url: '/admin/databridge/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'Automate business processes',
    url: '/admin/databridge/workflows',
    icon: Zap,
    roles: ['super_admin', 'company_admin']
  }
];

// Connect IQ CRM Children
export const connectIQCRMChildren = [
  {
    id: 'crm-dashboard',
    title: 'CRM Dashboard',
    description: 'Customer relationship management overview',
    url: '/admin/connectiq/dashboard',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'companies',
    title: 'Companies',
    description: 'Manage company accounts and contacts',
    url: '/admin/connectiq/companies',
    icon: Database,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Manage customer contacts and relationships',
    url: '/admin/connectiq/contacts',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    description: 'Manage deals and sales opportunities',
    url: '/admin/connectiq/opportunities',
    icon: TrendingUp,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'activities',
    title: 'Activities',
    description: 'Manage tasks, calls, and notes',
    url: '/admin/connectiq/activities',
    icon: Activity,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'tags',
    title: 'Tags',
    description: 'Organize contacts and deals with custom tags',
    url: '/admin/connectiq/tags',
    icon: Target,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Customer interaction notes and communications',
    url: '/admin/connectiq/notes',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'custom-fields',
    title: 'Custom Fields',
    description: 'Create and manage custom fields',
    url: '/admin/connectiq/custom-fields',
    icon: Settings,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'pipelines',
    title: 'Pipelines & Stages',
    description: 'Manage sales pipelines and deal stages',
    url: '/admin/connectiq/pipelines',
    icon: Target,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'contracts',
    title: 'Client Contracts',
    description: 'Manage client contracts and agreements',
    url: '/admin/connectiq/contracts',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'attachments',
    title: 'Attachments',
    description: 'Manage files and documents',
    url: '/admin/connectiq/attachments',
    icon: Archive,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'communications',
    title: 'Communications Log',
    description: 'Track all customer communications',
    url: '/admin/connectiq/communications',
    icon: Bell,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'reporting',
    title: 'Deal Value Reporting',
    description: 'Analyze deal values and revenue metrics',
    url: '/admin/connectiq/reporting',
    icon: PieChart,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'lead-sources',
    title: 'Lead Source Attribution',
    description: 'Track and analyze lead source performance',
    url: '/admin/connectiq/lead-sources',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'email-templates',
    title: 'Email Templates',
    description: 'Create and manage CRM email templates',
    url: '/admin/connectiq/email-templates',
    icon: Bell,
    roles: ['super_admin', 'company_admin']
  }
];

// Communications IQ Children
export const communicationsIQChildren = [
  {
    id: 'email-client',
    title: 'Email Client',
    description: 'Unified inbox for all email communications',
    url: '/admin/crm/email-client',
    icon: Mail,
    roles: ['super_admin', 'company_admin', 'internal_staff']
  },
  {
    id: 'email-templates',
    title: 'Email Templates',
    description: 'Create and manage reusable email templates',
    url: '/admin/crm/email-templates',
    icon: FileText,
    roles: ['super_admin', 'company_admin', 'internal_staff']
  },
  {
    id: 'email-campaigns',
    title: 'Email Campaigns',
    description: 'Send bulk emails and track performance',
    url: '/admin/crm/email-campaigns',
    icon: Megaphone,
    roles: ['super_admin', 'company_admin', 'internal_staff']
  },
  {
    id: 'communications-log',
    title: 'Communications Log',
    description: 'Track all communications with clients',
    url: '/admin/crm/activities',
    icon: Bell,
    roles: ['super_admin', 'company_admin', 'internal_staff']
  }
];

// BenefitsIQ Children
export const benefitsIQChildren = [
  {
    id: 'benefits-enrollment',
    title: 'Benefits Enrollment',
    description: 'Manage employee benefits enrollment',
    url: '/benefits-iq/enrollment',
    icon: Heart,
    roles: ['super_admin', 'company_admin', 'employee']
  },
  {
    id: 'benefits-administration',
    title: 'Benefits Administration',
    description: 'Administer employee benefits programs',
    url: '/benefits-iq/administration',
    icon: Settings,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'benefits-analytics',
    title: 'Benefits Analytics',
    description: 'Analyze benefits usage and costs',
    url: '/benefits-iq/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  }
];

// CompIQ Children
export const compIQChildren = [
  {
    id: 'salary-benchmarking',
    title: 'Salary Benchmarking',
    description: 'Compare salaries against market data',
    url: '/comp-iq/benchmarking',
    icon: TrendingUp,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'compensation-planning',
    title: 'Compensation Planning',
    description: 'Plan and model compensation changes',
    url: '/comp-iq/planning',
    icon: Calculator,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'equity-management',
    title: 'Equity Management',
    description: 'Manage stock options and equity plans',
    url: '/comp-iq/equity',
    icon: PieChart,
    roles: ['super_admin', 'company_admin']
  }
];

// PayrollIQ Children - Now includes Benefits IQ, CompX, Report IQ, and Comp IQ
export const payrollIQChildren = [
  {
    id: 'payroll-processing',
    title: 'Payroll Processing',
    description: 'Process employee payroll and taxes',
    url: '/payroll-iq/processing',
    icon: Calculator,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'tax-management',
    title: 'Tax Management',
    description: 'Manage payroll taxes and compliance',
    url: '/payroll-iq/taxes',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'payroll-reports',
    title: 'Payroll Reports',
    description: 'Generate payroll reports and analytics',
    url: '/payroll-iq/reports',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'direct-deposit',
    title: 'Direct Deposit',
    description: 'Manage employee direct deposit settings',
    url: '/payroll-iq/direct-deposit',
    icon: CreditCard,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'benefits-iq',
    title: 'Benefits IQ',
    description: 'Benefits administration and management',
    icon: Heart,
    roles: ['super_admin', 'company_admin'],
    children: benefitsIQChildren
  },
  {
    id: 'comp-x',
    title: 'CompX',
    description: 'Compensation and wage management',
    icon: TrendingUp,
    roles: ['super_admin', 'company_admin'],
    children: compXChildren
  },
  {
    id: 'report-iq',
    title: 'Report IQ',
    description: 'Analytics and reporting platform',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin'],
    children: reportIQChildren
  },
  {
    id: 'comp-iq',
    title: 'Comp IQ',
    description: 'Compensation planning and analytics',
    icon: DollarSign,
    roles: ['super_admin', 'company_admin'],
    children: compIQChildren
  }
];


// Case Management Children
export const caseManagementChildren = [
  {
    id: 'case-tracker',
    title: 'Case Tracker',
    description: 'Track and manage HR cases',
    url: '/cms/tracker',
    icon: Folder,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'case-reports',
    title: 'Case Reports',
    description: 'Generate case analytics and reports',
    url: '/cms/reports',
    icon: FileText,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'case-workflow',
    title: 'Case Workflow',
    description: 'Manage case workflows and processes',
    url: '/cms/workflow',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  }
];

// Vault Children
export const vaultChildren = [
  {
    id: 'document-storage',
    title: 'Document Storage',
    description: 'Secure document storage and management',
    url: '/vault/storage',
    icon: Archive,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'document-sharing',
    title: 'Document Sharing',
    description: 'Share documents securely with teams',
    url: '/vault/sharing',
    icon: Users,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'document-templates',
    title: 'Document Templates',
    description: 'Manage document templates and forms',
    url: '/vault/templates',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  }
];

// Time IQ Children
export const timeTrackChildren = [
  {
    id: 'time-clock',
    title: 'Time Clock',
    description: 'Employee time tracking and attendance',
    url: '/time-track/clock',
    icon: Clock,
    roles: ['super_admin', 'company_admin', 'employee']
  },
  {
    id: 'time-reports',
    title: 'Time Reports',
    description: 'Generate timesheets and reports',
    url: '/time-track/reports',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'time-approval',
    title: 'Time Approval',
    description: 'Review and approve employee timesheets',
    url: '/time-track/approval',
    icon: UserCheck,
    roles: ['super_admin', 'company_admin']
  }
];

// Policies Children
export const policiesChildren = [
  {
    id: 'policy-library',
    title: 'Policy Library',
    description: 'Manage company policies and procedures',
    url: '/admin/policies/library',
    icon: BookOpen,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'policy-distribution',
    title: 'Policy Distribution',
    description: 'Distribute policies to employees',
    url: '/admin/policies/distribution',
    icon: Bell,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'policy-tracking',
    title: 'Policy Tracking',
    description: 'Track policy acknowledgments',
    url: '/admin/policies/tracking',
    icon: FileText,
    roles: ['super_admin', 'company_admin', 'client_admin']
  }
];

// Settings Children
export const settingsChildren = [
  {
    id: 'system-config',
    title: 'System Configuration',
    description: 'Configure system settings and preferences',
    url: '/admin/settings/system',
    icon: Cog,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage users and permissions',
    url: '/admin/settings/users',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'security-settings',
    title: 'Security Settings',
    description: 'Configure security and access controls',
    url: '/admin/settings/security',
    icon: Lock,
    roles: ['super_admin']
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Manage third-party integrations',
    url: '/admin/settings/integrations',
    icon: Database,
    roles: ['super_admin', 'company_admin']
  }
];

// Marketing IQ Children
export const marketingIQChildren = [
  {
    id: 'marketing-dashboard',
    title: 'Marketing Dashboard',
    description: 'Comprehensive marketing analytics and performance metrics',
    url: '/admin/marketing/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'email-templates',
    title: 'Email Templates',
    description: 'Create and manage email marketing templates',
    url: '/admin/email/templates',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'email-campaigns',
    title: 'Email Campaigns',
    description: 'Manage and track email marketing campaigns',
    url: '/admin/email/campaigns',
    icon: Mail,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'lead-management',
    title: 'Lead Management',
    description: 'Track and nurture leads through the sales funnel',
    url: '/admin/marketing/leads',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'marketing-automation',
    title: 'Marketing Automation',
    description: 'Automate marketing workflows and campaigns',
    url: '/admin/marketing/automation',
    icon: Zap,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Manage social media marketing and content',
    url: '/admin/marketing/social',
    icon: Megaphone,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'email-analytics',
    title: 'Email Analytics',
    description: 'Analyze email campaign performance and engagement',
    url: '/admin/email/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  }
];

// Client Management Children
export const clientManagementChildren = [
  {
    id: 'client-directory',
    title: 'Client Directory',
    description: 'View and manage all client accounts',
    url: '/client-management/list',
    icon: Building2,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'client-onboarding',
    title: 'Client Onboarding',
    description: 'Streamlined client setup and configuration',
    url: '/client-management/onboarding',
    icon: Users,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-settings',
    title: 'Client Settings',
    description: 'Configure client-specific settings and preferences',
    url: '/client-management/settings',
    icon: Settings,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-billing',
    title: 'Client Billing',
    description: 'Manage client contracts and billing information',
    url: '/client-management/billing',
    icon: CreditCard,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-communication',
    title: 'Communication Hub',
    description: 'Client communication and support center',
    url: '/client-management/communication',
    icon: Mail,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'client-analytics',
    title: 'Client Analytics',
    description: 'Client performance metrics and reporting',
    url: '/client-management/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-support',
    title: 'Support & Help Desk',
    description: 'Client support ticket management',
    url: '/client-management/support',
    icon: Users,
    roles: ['super_admin', 'company_admin', 'client_admin']
  }
];

// Parent modules - each as separate top-level apps
export const parentModules = [
  {
    id: 'client-management',
    title: 'Client Management',
    description: 'Comprehensive client lifecycle management',
    icon: Building2,
    category: 'Client Services',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: clientManagementChildren
  },
  {
    id: 'halo-iq',
    title: 'HALO IQ',
    description: 'Core intelligence suite powering data and compliance',
    icon: Brain,
    category: 'Core Intelligence',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: haloIQChildren
  },
  {
    id: 'pulse-cms',
    title: 'Pulse CMS',
    description: 'Content and case management system',
    icon: Activity,
    category: 'Case Management',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: pulseCMSChildren
  },
  {
    id: 'connect-iq',
    title: 'Connect IQ',
    description: 'Customer relationship management system',
    icon: Users,
    category: 'CRM',
    roles: ['super_admin', 'company_admin'],
    children: connectIQCRMChildren
  },
  {
    id: 'communications-iq',
    title: 'Communications IQ',
    description: 'Unified communication management for CRM',
    icon: Mail,
    category: 'Communications',
    roles: ['super_admin', 'company_admin', 'internal_staff'],
    children: communicationsIQChildren
  },
  {
    id: 'time-track',
    title: 'Time IQ',
    description: 'Time & Attendance',
    icon: Timer,
    category: 'Time Management',
    roles: ['super_admin', 'company_admin', 'employee'],
    children: timeTrackChildren
  },
  {
    id: 'databridge',
    title: 'DataBridge',
    description: 'Data integration and analytics platform',
    icon: Database,
    category: 'Data Integration',
    roles: ['super_admin', 'company_admin'],
    children: dataBridgeIQChildren
  },
  {
    id: 'vaultpay',
    title: 'VaultPay',
    description: 'Payment processing and financial transactions',
    icon: CreditCard,
    category: 'Finance',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: vaultPayChildren
  },
  {
    id: 'compx',
    title: 'CompX',
    description: 'Compensation and wage management',
    icon: TrendingUp,
    category: 'Compensation',
    roles: ['super_admin', 'company_admin'],
    children: compXChildren
  },
  {
    id: 'complyiq',
    title: 'ComplyIQ',
    description: 'Compliance and policy management',
    icon: Shield,
    category: 'Compliance',
    roles: ['super_admin', 'company_admin'],
    children: complyIQChildren
  },
  {
    id: 'reportiq',
    title: 'Report IQ',
    description: 'Analytics and reporting platform',
    icon: BarChart3,
    category: 'Analytics',
    roles: ['super_admin', 'company_admin'],
    children: reportIQChildren
  },
  {
    id: 'marketing-iq',
    title: 'Marketing IQ',
    description: 'Comprehensive marketing automation and analytics platform',
    icon: Megaphone,
    category: 'Marketing',
    roles: ['super_admin', 'company_admin'],
    children: marketingIQChildren
  },
  {
    id: 'payroll-iq',
    title: 'Payroll IQ',
    description: 'Comprehensive payroll management system including Benefits, Compensation, and Reporting',
    icon: FileSpreadsheet,
    category: 'Payroll',
    roles: ['super_admin', 'company_admin'],
    children: payrollIQChildren
  },
  {
    id: 'case-management',
    title: 'Case Management',
    description: 'HR case tracking and resolution platform',
    icon: Folder,
    category: 'HR Operations',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: caseManagementChildren
  },
  {
    id: 'vault',
    title: 'Vault',
    description: 'Secure document management and storage',
    icon: Archive,
    category: 'Documents',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: vaultChildren
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'Policy management and compliance tracking',
    icon: BookOpen,
    category: 'Compliance',
    roles: ['super_admin', 'company_admin', 'client_admin'],
    children: policiesChildren
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System configuration and administration',
    icon: Settings,
    category: 'Administration',
    roles: ['super_admin', 'company_admin'],
    children: settingsChildren
  }
];