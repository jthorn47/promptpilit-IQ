import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
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
  Users,
  Shield,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  PlayCircle,
  Archive,
  BookOpen,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Activity,
  Star,
  MessageSquare,
  DollarSign,
  History,
  UserPlus,
  XCircle,
  GraduationCap
} from 'lucide-react';

// Comprehensive LMS Reports Registry
const LMS_REPORTS = [
  {
    id: 'training-completion',
    name: 'Training Completion Report',
    description: 'Complete overview of training completion status across all learners',
    category: 'Core Training',
    icon: CheckCircle,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'employee', 'course']
  },
  {
    id: 'incomplete-past-due',
    name: 'Incomplete / Past Due Report',
    description: 'Track overdue training assignments and incomplete courses',
    category: 'Compliance Tracking',
    icon: AlertTriangle,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'employee', 'urgency']
  },
  {
    id: 'course-assignment',
    name: 'Course Assignment Report',
    description: 'Overview of all course assignments and their current status',
    category: 'Core Training',
    icon: Target,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'assignee', 'status']
  },
  {
    id: 'learner-progress',
    name: 'Learner Progress Report',
    description: 'Individual learner progress tracking across all assigned courses',
    category: 'Learner Analytics',
    icon: TrendingUp,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'course', 'progress']
  },
  {
    id: 'certificate-expiry',
    name: 'Certificate Expiry Report',
    description: 'Track upcoming certificate expirations and renewal requirements',
    category: 'Certification Management',
    icon: Award,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'certificationType', 'employee', 'expiryStatus']
  },
  {
    id: 'course-activity-log',
    name: 'Course Activity Log Report',
    description: 'Detailed activity logs for all course interactions and events',
    category: 'Audit & Compliance',
    icon: Activity,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'employee', 'activityType']
  },
  {
    id: 'training-by-department',
    name: 'Training by Department Report',
    description: 'Department-level training statistics and completion rates',
    category: 'Organizational Analytics',
    icon: Building2,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'trainingType']
  },
  {
    id: 'course-score',
    name: 'Course Score Report',
    description: 'Assessment scores and performance analytics for all courses',
    category: 'Performance Analytics',
    icon: Star,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'employee', 'scoreRange']
  },
  {
    id: 'course-access-log',
    name: 'Course Access Log Report',
    description: 'Login and access tracking for course security and compliance',
    category: 'Audit & Compliance',
    icon: Shield,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'employee', 'accessType']
  },
  {
    id: 'assigned-vs-completed',
    name: 'Assigned vs Completed Report',
    description: 'Comparison analysis of training assignments versus completions',
    category: 'Performance Analytics',
    icon: BarChart3,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'department', 'course']
  },
  {
    id: 'annual-recertification',
    name: 'Annual Recertification Report',
    description: 'Track annual recertification requirements and completion status',
    category: 'Certification Management',
    icon: Calendar,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['certificationYear', 'employee', 'certificationType']
  },
  {
    id: 'policy-acknowledgment',
    name: 'Policy Acknowledgment Report',
    description: 'Track policy document acknowledgments and digital signatures',
    category: 'Compliance Tracking',
    icon: FileText,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'policy', 'employee', 'acknowledgmentStatus']
  },
  {
    id: 'custom-legal-compliance',
    name: 'Custom Legal/Compliance Training Report',
    description: 'Specialized compliance training tracking for legal requirements',
    category: 'Compliance Tracking',
    icon: Shield,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'regulationType', 'employee', 'complianceStatus']
  },
  {
    id: 'scorm-tracking',
    name: 'SCORM Tracking Report',
    description: 'SCORM package interaction tracking and completion data',
    category: 'Technical Reports',
    icon: BookOpen,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'scormPackage', 'employee', 'interaction']
  },
  {
    id: 'audit-ready-compliance',
    name: 'Audit-Ready Compliance Report',
    description: 'Comprehensive compliance report ready for external audits',
    category: 'Audit & Compliance',
    icon: FileSpreadsheet,
    exportFormats: ['pdf', 'xlsx'],
    scheduleable: false,
    drillDown: true,
    filters: ['auditPeriod', 'complianceArea', 'regulatoryBody']
  },
  {
    id: 'manager-dashboard',
    name: 'Manager Dashboard Report',
    description: 'Manager-specific view of direct report training progress',
    category: 'Management Reports',
    icon: UserCheck,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'manager', 'team', 'trainingType']
  },
  {
    id: 'user-engagement',
    name: 'User Engagement Report',
    description: 'Learner engagement metrics and platform usage analytics',
    category: 'Learner Analytics',
    icon: Activity,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'employee', 'engagementMetric']
  },
  {
    id: 'bulk-training-status',
    name: 'Bulk Training Status Report',
    description: 'Mass export of training status for all employees and courses',
    category: 'Core Training',
    icon: Users,
    exportFormats: ['csv', 'xlsx'],
    scheduleable: true,
    drillDown: false,
    filters: ['dateRange', 'department', 'trainingCategory']
  },
  {
    id: 'course-feedback',
    name: 'Course Feedback Report',
    description: 'Course evaluation feedback and satisfaction ratings',
    category: 'Quality Assurance',
    icon: MessageSquare,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'rating', 'feedbackType']
  },
  {
    id: 'training-cost',
    name: 'Training Cost Report',
    description: 'Training program costs and ROI analysis',
    category: 'Financial Reports',
    icon: DollarSign,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'costCenter', 'trainingProvider']
  },
  {
    id: 'archived-learner-transcript',
    name: 'Archived Learner Transcript Report',
    description: 'Complete historical training transcripts for terminated employees',
    category: 'Historical Reports',
    icon: Archive,
    exportFormats: ['pdf', 'csv'],
    scheduleable: false,
    drillDown: true,
    filters: ['terminationDate', 'employee', 'department']
  },
  {
    id: 'version-history',
    name: 'Version History Report',
    description: 'Track course version changes and learner completion across versions',
    category: 'Technical Reports',
    icon: History,
    exportFormats: ['pdf', 'csv'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'version']
  },
  {
    id: 'training-assignment-history',
    name: 'Training Assignment History Report',
    description: 'Historical view of all training assignments and modifications',
    category: 'Historical Reports',
    icon: Clock,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'assignedBy', 'employee', 'course']
  },
  {
    id: 'group-enrollment',
    name: 'Group Enrollment Report',
    description: 'Bulk enrollment tracking for groups and cohorts',
    category: 'Organizational Analytics',
    icon: UserPlus,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'group', 'course', 'enrollmentMethod']
  },
  {
    id: 'failed-attempts',
    name: 'Failed Attempts Report',
    description: 'Track failed assessment attempts and remediation needs',
    category: 'Performance Analytics',
    icon: XCircle,
    exportFormats: ['pdf', 'csv', 'xlsx'],
    scheduleable: true,
    drillDown: true,
    filters: ['dateRange', 'course', 'employee', 'attemptCount']
  }
];

const REPORT_CATEGORIES = [
  'Core Training',
  'Compliance Tracking',
  'Certification Management',
  'Learner Analytics',
  'Performance Analytics',
  'Organizational Analytics',
  'Audit & Compliance',
  'Management Reports',
  'Quality Assurance',
  'Financial Reports',
  'Historical Reports',
  'Technical Reports'
];

interface Company {
  id: string;
  company_name: string;
  subscription_status: string;
}

export const LMSReports: React.FC = () => {
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
  const filteredReports = LMS_REPORTS.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateReport = (reportId: string) => {
    if (!selectedCompany) {
      toast({
        title: 'Company Required',
        description: 'Please select a company first',
        variant: 'destructive'
      });
      return;
    }
    
    // TODO: Implement report generation
    toast({
      title: 'Report Generation',
      description: 'Report generation feature coming soon',
    });
  };

  const handleExportReport = (reportId: string, format: string) => {
    if (!selectedCompany) {
      toast({
        title: 'Company Required',
        description: 'Please select a company first',
        variant: 'destructive'
      });
      return;
    }
    
    // TODO: Implement export functionality
    toast({
      title: 'Export Started',
      description: `Exporting report as ${format.toUpperCase()}`,
    });
  };

  const breadcrumbItems = [
    { label: 'Reports', href: '/reports' },
    { label: 'LMS Reports' }
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={breadcrumbItems} />
      
      {/* Header with Company Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LMS Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive learning management system reporting with training analytics
          </p>
        </div>
        
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
                  ? 'Please select a company to view LMS reports' 
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
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{LMS_REPORTS.length}</div>
                <p className="text-xs text-muted-foreground">Available LMS reports</p>
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
                  {LMS_REPORTS.filter(r => r.scheduleable).length}
                </div>
                <p className="text-xs text-muted-foreground">Can be automated</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {LMS_REPORTS.filter(r => r.category.includes('Compliance')).length}
                </div>
                <p className="text-xs text-muted-foreground">Compliance reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search LMS reports..."
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
                  <SelectItem value="all">All Categories ({LMS_REPORTS.length})</SelectItem>
                  {REPORT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category} ({LMS_REPORTS.filter(r => r.category === category).length})
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
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                Manage your saved LMS report configurations
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
                Manage automatic LMS report delivery schedules
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
                Track all LMS report generation activities and exports
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