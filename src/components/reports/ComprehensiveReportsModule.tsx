import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  BarChart3,
  Eye,
  Download,
  Settings,
  Clock,
  Bell
} from 'lucide-react';
import { 
  REPORT_REGISTRY, 
  REPORT_CATEGORIES, 
  getReportsByCategory,
  getCategoriesWithCounts,
  ReportConfig 
} from './ReportRegistry';
import { ComprehensiveReportViewer } from './ComprehensiveReportViewer';
import { SavedReportsDashboard } from './SavedReportsDashboard';
import { useReporting } from '@/hooks/useReporting';

export function ComprehensiveReportsModule() {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { savedReports, reportSchedules, reportExecutions, loading } = useReporting();

  // Filter reports based on search and category
  const filteredReports = REPORT_REGISTRY.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesWithCounts = getCategoriesWithCounts();

  // Statistics for dashboard
  const stats = [
    {
      title: 'Available Reports',
      value: REPORT_REGISTRY.length,
      description: 'Ready to generate',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Report Categories',
      value: Object.keys(REPORT_CATEGORIES).length,
      description: 'Organized collections',
      icon: BarChart3,
      color: 'text-green-600',
    },
    {
      title: 'Saved Reports',
      value: savedReports.length,
      description: 'Custom configurations',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Scheduled Reports',
      value: reportSchedules.filter(s => s.is_active).length,
      description: 'Automated delivery',
      icon: Clock,
      color: 'text-orange-600',
    },
  ];

  if (selectedReport) {
    return (
      <ComprehensiveReportViewer
        reportId={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Reports</h1>
          <p className="text-muted-foreground">
            Complete HR and payroll reporting library with filtering, export, and scheduling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Production Ready
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="library">Report Library</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search reports by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories ({REPORT_REGISTRY.length})</option>
                {categoriesWithCounts.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Categories */}
          <div className="space-y-8">
            {Object.values(REPORT_CATEGORIES).map(category => {
              const categoryReports = getReportsByCategory(category).filter(report =>
                selectedCategory === 'all' || selectedCategory === category
              ).filter(report =>
                report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase())
              );

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
                          onClick={() => setSelectedReport(report.id)}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {report.exportFormats.map(format => (
                                  <Badge key={format} variant="outline" className="text-xs">
                                    {format.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {report.scheduleable && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Scheduleable
                                  </Badge>
                                )}
                                {report.drillDownEnabled && (
                                  <Badge variant="outline" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Drill-down
                                  </Badge>
                                )}
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

        <TabsContent value="saved">
          <SavedReportsDashboard />
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading schedules...</p>
                </div>
              ) : reportSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scheduled reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate reports and schedule them for automatic delivery
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {schedule.saved_reports?.name || 'Unknown Report'}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{schedule.schedule_frequency} at {schedule.schedule_time}</span>
                          <span>{schedule.email_recipients?.length || 0} recipients</span>
                          <span>Format: {schedule.export_format}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={schedule.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all report generation activities
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading history...</p>
                </div>
              ) : reportExecutions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No execution history</h3>
                  <p className="text-muted-foreground">
                    Generate reports to see their execution history here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportExecutions.map((execution) => {
                    const report = savedReports.find(r => r.id === execution.saved_report_id);
                    return (
                      <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {report?.name || 'Unknown Report'}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {new Date(execution.created_at).toLocaleDateString()} at{' '}
                              {new Date(execution.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {execution.record_count && (
                              <span>{execution.record_count} records</span>
                            )}
                            {execution.execution_time_ms && (
                              <span>{execution.execution_time_ms}ms</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              execution.status === 'completed' 
                                ? "bg-green-100 text-green-800"
                                : execution.status === 'failed'
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {execution.status}
                          </Badge>
                          <Badge variant="secondary">
                            {execution.execution_type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}