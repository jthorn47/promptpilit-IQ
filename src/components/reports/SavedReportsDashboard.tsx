import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  FileText, 
  MoreHorizontal, 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { useReporting } from '@/hooks/useReporting';
import { ReportBuilder } from './ReportBuilder';
import { EnhancedReportExporter } from './EnhancedReportExporter';

export function SavedReportsDashboard() {
  const { savedReports, reportSchedules, reportExecutions, loading, deleteReport, executeReport } = useReporting();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [executingReports, setExecutingReports] = useState<Set<string>>(new Set());

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || report.data_source === filterSource;
    return matchesSearch && matchesFilter;
  });

  const getDataSourceBadge = (source: string) => {
    const colors = {
      payroll: 'bg-blue-100 text-blue-800',
      employees: 'bg-green-100 text-green-800',
      time_tracking: 'bg-purple-100 text-purple-800',
      benefits: 'bg-orange-100 text-orange-800',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getReportSchedule = (reportId: string) => {
    return reportSchedules.find(schedule => schedule.saved_report_id === reportId && schedule.is_active);
  };

  const getLastExecution = (reportId: string) => {
    return reportExecutions
      .filter(exec => exec.saved_report_id === reportId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const handleExecuteReport = async (reportId: string) => {
    setExecutingReports(prev => new Set([...prev, reportId]));
    try {
      await executeReport(reportId);
    } finally {
      setExecutingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleEditReport = (report: any) => {
    setEditingReport(report);
    setShowReportBuilder(true);
  };

  const handleDuplicateReport = async (report: any) => {
    const duplicatedReport = {
      ...report,
      name: `${report.name} (Copy)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
    setEditingReport(duplicatedReport);
    setShowReportBuilder(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showReportBuilder) {
    return (
      <ReportBuilder 
        onClose={() => {
          setShowReportBuilder(false);
          setEditingReport(null);
        }}
        editingReport={editingReport}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Reports
              </CardTitle>
              <CardDescription>
                Manage your saved reports, schedules, and executions
              </CardDescription>
            </div>
            <Button onClick={() => setShowReportBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Sources</option>
                <option value="payroll">Payroll</option>
                <option value="employees">Employees</option>
                <option value="time_tracking">Time Tracking</option>
                <option value="benefits">Benefits</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterSource !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first report to get started'
              }
            </p>
            {!searchTerm && filterSource === 'all' && (
              <Button onClick={() => setShowReportBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const schedule = getReportSchedule(report.id);
            const lastExecution = getLastExecution(report.id);
            const isExecuting = executingReports.has(report.id);

            return (
              <Card key={report.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg line-clamp-1">{report.name}</CardTitle>
                      <Badge className={getDataSourceBadge(report.data_source)}>
                        {report.data_source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExecuteReport(report.id)} disabled={isExecuting}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditReport(report)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Report</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{report.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReport(report.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {report.description && (
                    <CardDescription className="line-clamp-2">
                      {report.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Schedule Status */}
                  {schedule ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">
                        Scheduled {schedule.schedule_frequency}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Manual execution only</span>
                    </div>
                  )}

                  {/* Last Execution */}
                  {lastExecution ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last run: {formatDate(lastExecution.created_at)}
                        {lastExecution.status === 'failed' && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Failed
                          </Badge>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Never executed</span>
                    </div>
                  )}

                  {/* Created By */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Created {formatDate(report.created_at)}</span>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleExecuteReport(report.id)}
                    disabled={isExecuting}
                    className="w-full mt-4"
                    size="sm"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}