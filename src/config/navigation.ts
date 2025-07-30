
import {
  Activity,
  AirVent,
  BarChart3,
  Briefcase,
  Building,
  Calculator,
  Calendar,
  CircleUserRound,
  Clock,
  Cog,
  CreditCard,
  Database,
  FileSearch,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Key,
  ListChecks,
  LucideIcon,
  Menu,
  MessageSquare,
  Package,
  PieChart,
  Scale,
  ScrollText,
  Search,
  Settings,
  Shield,
  SquareUserRound,
  Table,
  TrendingUp,
  User,
  User2,
  UserCog,
  Users,
  Vault,
  Bell,
  Zap
} from "lucide-react";

interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  roles?: string[];
  items?: NavItem[];
  defaultOpen?: boolean;
}

export const navigationConfig = [
  {
    title: "SuperAdmin",
    icon: Shield,
    items: [
      {
        title: "Admin",
        url: "/admin",
        icon: Shield,
        roles: ['super_admin']
      },
      {
        title: "Users",
        url: "/superadmin/users",
        icon: Users,
        roles: ['super_admin']
      },
      {
        title: "Companies",
        url: "/superadmin/companies",
        icon: Building,
        roles: ['super_admin']
      },
      {
        title: "Benefits",
        url: "/superadmin/benefits",
        icon: Heart,
        roles: ['super_admin']
      },
      {
        title: "Integrations",
        url: "/superadmin/integrations",
        icon: AirVent,
        roles: ['super_admin']
      },
      {
        title: "Testing",
        url: "/testing",
        icon: HelpCircle,
        roles: ['super_admin']
      },
    ]
  },
  {
    title: "System",
    icon: Settings,
    defaultOpen: true,
    items: [
      { 
        title: "Command Center", 
        url: "/admin/command-center/client-management", 
        icon: Activity,
        roles: ['super_admin']
      },
      { 
        title: "Core Admin", 
        url: "/admin/core-admin", 
        icon: Shield,
        roles: ['super_admin']
      },
      { 
        title: "Companies", 
        url: "/admin/companies", 
        icon: Building,
        roles: ['super_admin']
      },
      { 
        title: "Users", 
        url: "/admin/employees", 
        icon: Users,
        roles: ['super_admin', 'company_admin']
      },
      {
        title: "Contact Search",
        url: "/admin/contact-search",
        icon: Search,
        roles: ['super_admin', 'company_admin']
      },
      { 
        title: "Client Onboarding", 
        url: "/admin/client-onboarding", 
        icon: UserCog,
        roles: ['super_admin']
      },
      {
        title: "Modules",
        url: "/admin/modules",
        icon: Package,
        roles: ['super_admin']
      },
      {
        title: "Roles & Permissions",
        url: "/admin/roles-permissions",
        icon: Users,
        roles: ['super_admin']
      },
      {
        title: "Registry",
        url: "/admin/registry",
        icon: Database,
        roles: ['super_admin']
      },
      {
        title: "Authentication",
        url: "/admin/authentication",
        icon: Key,
        roles: ['super_admin']
      },
      {
        title: "SSO Configuration",
        url: "/admin/sso-configuration",
        icon: Shield,
        roles: ['super_admin']
      },
      {
        title: "Audit Trail",
        url: "/admin/audit-trail",
        icon: FileSearch,
        roles: ['super_admin']
      },
      {
        title: "System Settings",
        url: "/admin/settings",
        icon: Settings,
        roles: ['super_admin']
      },
      {
        title: "Stripe Dashboard",
        url: "/admin/stripe",
        icon: CreditCard,
        roles: ['super_admin']
      },
      {
        title: "Notifications",
        url: "/admin/notifications",
        icon: Bell,
        roles: ['super_admin']
      },
      {
        title: "System Architecture",
        url: "/admin/system-architecture",
        icon: Database,
        roles: ['super_admin']
      }
    ]
  },
  {
    title: "Dashboard IQ",
    icon: BarChart3,
    items: [
      {
        title: "System Settings",
        url: "/admin/settings",
        icon: Activity,
        roles: ['super_admin']
      },
    ]
  },
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
        roles: ['super_admin', 'company_admin', 'admin']
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
        roles: ['super_admin', 'company_admin', 'admin']
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
        roles: ['super_admin', 'company_admin', 'admin']
      },
    ]
  },
  {
    title: "Halo IQ",
    icon: Briefcase,
    defaultOpen: true,
    items: [
      {
        title: "The Vault",
        url: "/halo-iq/vault",
        icon: Vault,
        description: "Secure data storage and management",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "Pulse CMS",
        url: "/halo-iq/pulse",
        icon: Activity,
        description: "Content and case management system",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "VaultPay",
        url: "/halo-iq/vaultpay",
        icon: CreditCard,
        description: "Payment processing module",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "DataBridge",
        url: "/halo-iq/databridge",
        icon: Database,
        description: "Data integrations and ETL functions",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "Connect IQ",
        url: "/halo-iq/connect",
        icon: Zap,
        description: "CRM and contact management",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "Time IQ",
        url: "/halo-iq/timetrack",
        icon: Clock,
        description: "Time & Attendance",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "CompX",
        url: "/halo-iq/compx",
        icon: TrendingUp,
        description: "Compensation and wage management",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "ComplyIQ",
        url: "/halo-iq/comply",
        icon: Shield,
        description: "Compliance and policy management",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "Report IQ",
        url: "/halo-iq/reports",
        icon: BarChart3,
        description: "Analytics and reporting",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "Benefits IQ",
        url: "/halo-iq/benefits",
        icon: Heart,
        description: "Benefits administration",
        roles: ['super_admin', 'company_admin', 'client_admin']
      },
      {
        title: "TaxIQ",
        url: "/halo-iq/tax",
        icon: Calculator,
        description: "Internal tax engine for payroll and finance calculations",
        roles: ['super_admin', 'company_admin', 'client_admin']
      }
    ]
  },
  {
    title: "EaseLearn",
    icon: GraduationCap,
    defaultOpen: true,
    items: [
      {
        title: "Catalog",
        url: "/learning/catalog",
        icon: ScrollText,
        roles: ['learner', 'company_admin', 'super_admin']
      },
      {
        title: "Assignments",
        url: "/learning/assignments",
        icon: ListChecks,
        roles: ['learner', 'company_admin', 'super_admin']
      },
      {
        title: "My Courses",
        url: "/learning/my-courses",
        icon: GraduationCap,
        roles: ['learner', 'company_admin', 'super_admin']
      },
      {
        title: "Admin",
        url: "/learning/admin",
        icon: Cog,
        roles: ['company_admin', 'super_admin']
      },
    ]
  }
];
