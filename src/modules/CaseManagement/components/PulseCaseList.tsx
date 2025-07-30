import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Users, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePulseCases } from '../hooks/usePulseCases';
import { Case, CaseStatus, CaseType, CasePriority } from '../types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PulseCaseListProps {
  onCreateCase?: () => void;
  onViewCase?: (case_: Case) => void;
}

export const PulseCaseList = ({ onCreateCase, onViewCase }: PulseCaseListProps) => {
  const navigate = useNavigate();
  const { cases, loading, updateCase, assignCase, refetch } = usePulseCases();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'all'>('all');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    return cases.filter(case_ => {
      const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
      const matchesType = typeFilter === 'all' || case_.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [cases, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const getStatusBadge = useCallback((status: CaseStatus) => {
    const variants = {
      open: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return variants[status] || variants.open;
  }, []);

  const getPriorityBadge = useCallback((priority: CasePriority) => {
    const variants = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return variants[priority] || variants.low;
  }, []);

  const handleSelectCase = useCallback((caseId: string, checked: boolean) => {
    setSelectedCases(prev => 
      checked ? [...prev, caseId] : prev.filter(id => id !== caseId)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedCases(checked ? filteredCases.map(c => c.id) : []);
  }, [filteredCases]);

  const handleStatusChange = useCallback(async (caseId: string, newStatus: CaseStatus) => {
    try {
      await updateCase(caseId, { status: newStatus });
      toast.success('Case status updated successfully');
    } catch (error) {
      toast.error('Failed to update case status');
    }
  }, [updateCase]);

  const handleBulkStatusChange = useCallback(async (newStatus: CaseStatus) => {
    try {
      await Promise.all(selectedCases.map(caseId => updateCase(caseId, { status: newStatus })));
      setSelectedCases([]);
      toast.success(`${selectedCases.length} cases updated successfully`);
    } catch (error) {
      toast.error('Failed to update cases');
    }
  }, [selectedCases, updateCase]);

  const exportCases = useCallback(() => {
    const exportData = filteredCases.map(case_ => ({
      'Case ID': case_.id.slice(0, 8),
      'Title': case_.title,
      'Type': case_.type,
      'Status': case_.status,
      'Priority': case_.priority,
      'Assigned To': case_.assigned_to || 'Unassigned',
      'Hours': case_.actual_hours.toFixed(1),
      'Created': format(new Date(case_.created_at), 'MMM d, yyyy'),
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-cases-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredCases]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">All Cases</h1>
          <p className="text-muted-foreground">
            Showing {filteredCases.length} of {cases.length} cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCases}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateCase}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CaseStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CaseType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="benefits">Benefits</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as CasePriority | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCases.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedCases.length} case{selectedCases.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('open')}>
                      Set to Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('in_progress')}>
                      Set to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('waiting')}>
                      Set to Waiting
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('closed')}>
                      Set to Closed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={() => setSelectedCases([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
          <CardDescription>
            Manage and track all cases across your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Case ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCases.includes(case_.id)}
                      onCheckedChange={(checked) => handleSelectCase(case_.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {case_.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {case_.title}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className={`h-6 ${getStatusBadge(case_.status)}`}>
                          {case_.status.replace('_', ' ').toUpperCase()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(case_.id, 'open')}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(case_.id, 'in_progress')}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(case_.id, 'waiting')}>
                          Waiting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(case_.id, 'closed')}>
                          Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(case_.priority)}>
                      {case_.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {case_.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{case_.assigned_to || 'Unassigned'}</TableCell>
                  <TableCell>{case_.actual_hours.toFixed(1)}h</TableCell>
                  <TableCell>{format(new Date(case_.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onViewCase?.(case_)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/pulse/cases/${case_.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Case
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Reassign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};