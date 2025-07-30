import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Clock, FileText, AlertCircle, BarChart3, Play } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { CaseFormDialog } from './components/CaseFormDialog';
import { CaseDetailDialog } from './components/CaseDetailDialog';
import { CaseAnalyticsDashboard } from './components/CaseAnalyticsDashboard';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTour } from '@/components/tour/TourProvider';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const CasesPage = () => {
  const { cases, loading } = useCases();
  const { startTour } = useTour();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // Filter cases based on search and filters
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesType = typeFilter === 'all' || case_.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      waiting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priority as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const handleRefresh = () => {
    // Add refresh functionality if needed
    window.location.reload();
  };

  const handleStartCasesTour = () => {
    startTour('case-management');
  };

  const tourButton = (
    <Button
      onClick={handleStartCasesTour}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      title="Start Product Tour"
    >
      <Play className="h-4 w-4" />
    </Button>
  );

  return (
    <StandardPageLayout
      title="Case Management"
      subtitle="Track and manage client cases efficiently"
    >
        <Tabs defaultValue="cases" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="analytics" data-tour="analytics-tab">Analytics</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setShowCreateDialog(true)} data-tour="new-case-button">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>

          <TabsContent value="cases" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-tour="case-overview">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                      <p className="text-2xl font-bold">{cases.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Cases</p>
                    <p className="text-2xl font-bold">{cases.filter(c => c.status === 'open').length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{cases.filter(c => c.status === 'in_progress').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">
                      {cases.reduce((sum, c) => sum + (c.actual_hours || 0), 0).toFixed(1)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card data-tour="case-filters">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="general_support">General Support</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card data-tour="cases-table">
            <CardHeader>
              <CardTitle>Cases ({filteredCases.length})</CardTitle>
              <CardDescription>
                Manage and track all client support cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((case_) => (
                      <TableRow 
                        key={case_.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedCase(case_);
                          setShowDetailDialog(true);
                        }}
                      >
                        <TableCell className="font-mono text-sm">
                          #{case_.id.slice(-8)}
                        </TableCell>
                        <TableCell className="font-medium">{case_.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {case_.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(case_.status)}>
                            {case_.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(case_.priority)}>
                            {case_.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{case_.assigned_to || 'Unassigned'}</TableCell>
                        <TableCell>{format(new Date(case_.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{case_.actual_hours?.toFixed(1) || '0.0'}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <CaseAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CaseFormDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        case_={selectedCase}
      />
      
      {selectedCase && (
        <CaseDetailDialog 
          caseId={selectedCase.id}
          open={showDetailDialog} 
          onOpenChange={setShowDetailDialog}
        />
      )}
    </StandardPageLayout>
  );
};