import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  DollarSign, 
  Heart, 
  CalendarDays, 
  HardHat, 
  Building, 
  BookOpen, 
  FileText, 
  MapPin, 
  Landmark 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  requiredRoles: string[];
}

const settingsOptions: SettingsOption[] = [
  {
    id: 'payroll-settings-schedules',
    title: 'Pay Schedules',
    description: 'Configure payroll processing schedules and timing',
    icon: CalendarDays,
    path: '/admin/payroll/settings/schedules',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-earnings',
    title: 'Earning Types',
    description: 'Manage pay types, rates, and earning calculations',
    icon: DollarSign,
    path: '/admin/payroll/settings/earnings',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-deductions',
    title: 'Deductions & Benefits',
    description: 'Configure deduction types, benefits, and withholdings',
    icon: Heart,
    path: '/admin/payroll/settings/deductions',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-wc-codes',
    title: 'Workers\' Compensation Codes',
    description: 'Set up and manage workers\' compensation classifications',
    icon: HardHat,
    path: '/admin/payroll/settings/wc-codes',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-structure',
    title: 'Departments & Locations',
    description: 'Define organizational structure for payroll reporting',
    icon: Building,
    path: '/admin/payroll/settings/structure',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-gl',
    title: 'Default GL Codes',
    description: 'Configure general ledger account mappings',
    icon: BookOpen,
    path: '/admin/payroll/settings/gl',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-stub-template',
    title: 'Pay Stub Template',
    description: 'Customize pay stub layout and information display',
    icon: FileText,
    path: '/admin/payroll/settings/stub-template',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-tax',
    title: 'Payroll Tax Jurisdictions',
    description: 'Configure tax jurisdictions and requirements',
    icon: MapPin,
    path: '/admin/payroll/settings/tax',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-banking',
    title: 'Client Bank Account Setup',
    description: 'Manage client banking information for direct deposits',
    icon: Landmark,
    path: '/admin/payroll/settings/banking',
    requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
  },
  {
    id: 'payroll-settings-setup-fee',
    title: 'Setup Fee',
    description: 'Configure setup fees and pricing structure',
    icon: DollarSign,
    path: '/admin/payroll/settings/setup-fee',
    requiredRoles: ['super_admin', 'sales_admin']
  }
];

export const PayrollSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSettingClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Payroll Settings ⚙️
          </h1>
          <p className="text-muted-foreground">Configure payroll system settings and parameters</p>
        </div>
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Settings</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card 
              key={option.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSettingClick(option.path)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Click to configure
                  </span>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    Settings
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};