import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Building2, Clock, Users, Settings, Scale, BarChart3, Vault, Shield, LayoutDashboard } from 'lucide-react';

const PayrollLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getPageInfo = (path: string) => {
    const pathSegments = path.split('/').filter(Boolean);
    const section = pathSegments[1] || 'dashboard';
    const subsection = pathSegments[2];
    
    const sectionConfig = {
      dashboard: { title: 'Payroll Dashboard', icon: LayoutDashboard, description: 'Overview of payroll operations and metrics' },
      runs: { title: 'Payroll Runs', icon: Calculator, description: 'Manage payroll processing and history' },
      employees: { title: 'Employee Management', icon: Users, description: 'Manage employee payroll information' },
      time: { title: 'Time & Attendance', icon: Clock, description: 'Track time entries and attendance' },
      settings: { title: 'Payroll Settings', icon: Settings, description: 'Configure payroll system settings' },
      compliance: { title: 'Tax & Compliance', icon: Scale, description: 'Manage tax filings and compliance' },
      reports: { title: 'Payroll Reports', icon: BarChart3, description: 'Generate and view payroll reports' },
      accounting: { title: 'General Ledger / Accounting', icon: Building2, description: 'Manage GL exports and integrations' },
      vault: { title: 'HaaLOvault', icon: Vault, description: 'Secure document storage and management' },
      admin: { title: 'Payroll Administration', icon: Shield, description: 'Administrative settings and permissions' }
    };

    const config = sectionConfig[section as keyof typeof sectionConfig] || sectionConfig.dashboard;
    return {
      ...config,
      subsection: subsection ? subsection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : undefined
    };
  };

  const pageInfo = getPageInfo(currentPath);
  const IconComponent = pageInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {pageInfo.title}
                </h1>
                {pageInfo.subsection && (
                  <p className="text-lg text-muted-foreground">
                    {pageInfo.subsection}
                  </p>
                )}
              </div>
            </div>
            <p className="text-muted-foreground">
              {pageInfo.description}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            HaaLO Payroll
          </Badge>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {pageInfo.title}
              {pageInfo.subsection && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-base font-medium">{pageInfo.subsection}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Development Notice */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Module Under Development
                  </p>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This HaaLO Payroll module is currently being developed. Features will be implemented incrementally.
                </p>
              </div>

              {/* Current Route Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Current Route</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded border">
                    {currentPath}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Module Status</label>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                    Registered & Active
                  </Badge>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Coming Soon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Payroll Processing Engine',
                    'Employee Self-Service Portal',
                    'Time Clock Integration',
                    'Tax Calculation & Filing',
                    'Benefits Administration',
                    'Custom Report Builder',
                    'Multi-State Tax Support',
                    'Direct Deposit Management',
                    'Compliance Monitoring',
                    'API Integrations'
                  ].map((feature, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-sm font-medium">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollLayout;