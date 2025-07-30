import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  BarChart3,
  Eye,
  Download,
  Building2,
  Clock,
  Bell,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  PlayCircle,
  Archive
} from 'lucide-react';

// Comprehensive Payroll Reports Registry
const PAYROLL_REPORTS = [
  {
    id: 'payroll-register',
    name: 'Payroll Register Report',
    description: 'Complete payroll details by pay period with employee breakdown',
    category: 'Core Payroll',
    icon: FileText,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'employee', 'payGroup']
  },
  {
    id: 'employee-pay-statement',
    name: 'Employee Pay Statement Report',
    description: 'Individual pay statements with earnings and deductions',
    category: 'Core Payroll',
    icon: Users,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'employee']
  },
  {
    id: 'payroll-summary',
    name: 'Payroll Summary Report',
    description: 'High-level payroll totals and statistics',
    category: 'Core Payroll',
    icon: BarChart3,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department']
  },
  {
    id: 'tax-liability',
    name: 'Tax Liability Report',
    description: 'Federal, state, and local tax withholdings and liabilities',
    category: 'Tax Reports',
    icon: Shield,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'taxType']
  },
  {
    id: 'deduction-summary',
    name: 'Deduction Summary Report',
    description: 'All pre-tax and post-tax deductions by category',
    category: 'Deductions',
    icon: DollarSign,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'deductionType', 'employee']
  },
  {
    id: 'direct-deposit-register',
    name: 'Direct Deposit Register',
    description: 'ACH and direct deposit transaction details',
    category: 'Payment Methods',
    icon: Building2,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'bankAccount']
  },
  {
    id: 'check-register',
    name: 'Check Register',
    description: 'Physical check payments and void tracking',
    category: 'Payment Methods',
    icon: FileText,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'checkNumber']
  },
  {
    id: 'earnings-by-employee',
    name: 'Earnings by Employee Report',
    description: 'Detailed earnings breakdown per employee',
    category: 'Earnings',
    icon: TrendingUp,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'earningsType']
  },
  {
    id: 'overtime-report',
    name: 'Overtime Report',
    description: 'Overtime hours, rates, and compliance tracking',
    category: 'Time & Attendance',
    icon: Clock,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'employee']
  },
  {
    id: 'pay-rate-change',
    name: 'Pay Rate Change Report',
    description: 'Historical pay rate adjustments and approvals',
    category: 'Audit & Compliance',
    icon: TrendingUp,
    exportFormats: ['pdf', 'csv'],
    scheduleable: false,
    drillDown: true,
    filters: ['dateRange', 'employee', 'approver']
  },
  {
    id: 'retroactive-pay',
    name: 'Retroactive Pay Report',
    description: 'Retro pay adjustments and corrections',
    category: 'Adjustments',
    icon: FileText,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'adjustmentType']
  },
  {
    id: 'timecard-summary',
    name: 'Timecard Summary Report',
    description: 'Employee time tracking and hour summaries',
    category: 'Time & Attendance',
    icon: Clock,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'department']
  },
  {
    id: 'pto-accrual-usage',
    name: 'PTO Accrual & Usage Report',
    description: 'Vacation, sick, and PTO balances and usage',
    category: 'Benefits',
    icon: Calendar,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'ptoType']
  },
  {
    id: 'workers-comp',
    name: 'Workers\' Comp Report',
    description: 'Workers\' compensation codes and premium calculations',
    category: 'Compliance',
    icon: Shield,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'wcCode']
  },
  {
    id: 'garnishment-detail',
    name: 'Garnishment Detail Report',
    description: 'Wage garnishments, child support, and court orders',
    category: 'Deductions',
    icon: FileText,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'garnishmentType']
  },
  {
    id: 'w2-summary',
    name: 'W-2 Summary Report',
    description: 'Year-end W-2 preparation and validation',
    category: 'Year-End',
    icon: FileSpreadsheet,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: false,
    drillDown: true,
    filters: ['taxYear', 'employee']
  },
  {
    id: 'aca-eligibility',
    name: 'ACA Eligibility Report',
    description: 'Affordable Care Act compliance and eligibility tracking',
    category: 'Compliance',
    icon: Shield,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'eligibilityStatus']
  },
  {
    id: 'eeo1-payroll',
    name: 'EEO-1 Payroll Report',
    description: 'Equal Employment Opportunity payroll data',
    category: 'Compliance',
    icon: Users,
    exportFormats: ['pdf', 'csv'],
    scheduleable: false,
    drillDown: false,
    filters: ['dateRange', 'jobCategory']
  },
  {
    id: 'state-unemployment-wage',
    name: 'State Unemployment Wage Report',
    description: 'SUTA wage reporting by state',
    category: 'Tax Reports',
    icon: Building2,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'state']
  },
  {
    id: 'new-hire-report',
    name: 'New Hire Report',
    description: 'New employee onboarding and reporting compliance',
    category: 'Compliance',
    icon: Users,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'department']
  },
  {
    id: 'payroll-journal-entry',
    name: 'Payroll Journal Entry Report',
    description: 'General ledger entries for accounting system export',
    category: 'Accounting',
    icon: FileSpreadsheet,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'glAccount']
  },
  {
    id: 'net-pay-comparison',
    name: 'Net Pay Comparison Report',
    description: 'Period-over-period net pay analysis',
    category: 'Analytics',
    icon: TrendingUp,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'comparisonPeriod']
  },
  {
    id: 'payroll-funding',
    name: 'Payroll Funding Report',
    description: 'Cash flow and funding requirements for payroll',
    category: 'Accounting',
    icon: DollarSign,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'payGroup']
  },
  {
    id: 'audit-trail',
    name: 'Audit Trail Report',
    description: 'All payroll edits, approvals, and system changes',
    category: 'Audit & Compliance',
    icon: Shield,
    exportFormats: ['pdf', 'csv'],
    scheduleable: false,
    drillDown: true,
    filters: ['dateRange', 'user', 'actionType']
  },
  {
    id: 'ytd-summary',
    name: 'YTD Summary Report',
    description: 'Year-to-date earnings, taxes, and deductions by employee',
    category: 'Analytics',
    icon: BarChart3,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['taxYear', 'employee', 'department']
  }
];

const REPORT_CATEGORIES = [
  'Core Payroll',
  'Tax Reports',
  'Time & Attendance',
  'Benefits',
  'Deductions',
  'Payment Methods',
  'Earnings',
  'Adjustments',
  'Compliance',
  'Year-End',
  'Accounting',
  'Analytics',
  'Audit & Compliance'
];

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  company_id: string;
}

interface PayrollSummary {
  total_employees: number;
  total_classes: number;
  total_hours: number;
  total_overtime_hours: number;
  total_gross_pay: number;
  pending_periods: number;
}

interface Company {
  id: string;
  company_name: string;
  subscription_status: string;
}

interface PayrollReportsProps {
  selectedPeriod: PayrollPeriod | null;
  payrollSummary: PayrollSummary | null;
}

export const PayrollReports: React.FC<PayrollReportsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is super admin
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        setUserRole(data.role);
        
        // If super admin, load all companies
        if (data.role === 'super_admin') {
          loadCompanies();
        } else {
          // For company admins, get their company
          loadUserCompany();
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, [user?.id]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name, subscription_status')
        .order('company_name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('company_id, company_settings(id, company_name, subscription_status)')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      if (data.company_settings) {
        setSelectedCompany(data.company_settings.id);
        setCompanies([data.company_settings]);
      }
    } catch (error) {
      console.error('Error loading user company:', error);
    }
  };

  // Filter reports
  const filteredReports = PAYROLL_REPORTS.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateReport = async (reportId: string) => {
    if (!selectedCompany) {
      toast({
        title: 'Company Required',
        description: 'Please select a company first',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-payroll-report', {
        body: {
          reportId,
          companyId: selectedCompany,
          filters: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Report Generated',
        description: 'Report has been generated successfully',
      });
      
      setSelectedReport(reportId);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportId: string, format: string) => {
    if (!selectedCompany) {
      toast({
        title: 'Company Required',
        description: 'Please select a company first',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-payroll-report', {
        body: {
          reportId,
          companyId: selectedCompany,
          format,
          filters: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (error) throw error;

      // Download the file
      if (data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `${reportId}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: 'Export Complete',
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Company Selector */}
      <div className="flex items-center justify-between">
        
        {userRole === 'super_admin' && (
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Select 
                value={selectedCompany || ''} 
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{company.company_name}</span>
                        <Badge 
                          variant={company.subscription_status === 'active' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {company.subscription_status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Company Selection Notice */}
      {!selectedCompany && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-800">
              <Bell className="h-4 w-4" />
              <span className="font-medium">
                {userRole === 'super_admin' 
                  ? 'Please select a company to view payroll reports' 
                  : 'Loading company information...'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Report Library</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{PAYROLL_REPORTS.length}</div>
                <p className="text-xs text-muted-foreground">Available payroll reports</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{REPORT_CATEGORIES.length}</div>
                <p className="text-xs text-muted-foreground">Report categories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduleable</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {PAYROLL_REPORTS.filter(r => r.scheduleable).length}
                </div>
                <p className="text-xs text-muted-foreground">Can be automated</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
                <Download className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">PDF, CSV, XLSX</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search payroll reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories ({PAYROLL_REPORTS.length})</SelectItem>
                  {REPORT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category} ({PAYROLL_REPORTS.filter(r => r.category === category).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Categories */}
          <div className="space-y-8">
            {REPORT_CATEGORIES.map(category => {
              const categoryReports = filteredReports.filter(report => report.category === category);
              
              if (categoryReports.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{category}</h2>
                    <Badge variant="secondary">{categoryReports.length} reports</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryReports.map((report) => {
                      const Icon = report.icon;
                      return (
                        <Card 
                          key={report.id} 
                          className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{report.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {report.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {report.exportFormats.map(format => (
                                  <Badge key={format} variant="outline" className="text-xs">
                                    {format.toUpperCase()}
                                  </Badge>
                                ))}
                                {report.scheduleable && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Schedule
                                  </Badge>
                                )}
                                {report.drillDown && (
                                  <Badge variant="outline" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Drill-down
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleGenerateReport(report.id)}
                                  disabled={!selectedCompany}
                                >
                                  <PlayCircle className="w-4 h-4 mr-1" />
                                  Generate
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleExportReport(report.id, 'pdf')}
                                  disabled={!selectedCompany}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your saved report configurations
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved reports</h3>
                <p className="text-muted-foreground mb-4">
                  Generate and save reports to see them here
                </p>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Saved Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage automatic report delivery schedules
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No scheduled reports</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automatic report delivery schedules
                </p>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all report generation activities and exports
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No execution history</h3>
                <p className="text-muted-foreground">
                  Generate reports to see their execution history here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};