import React, { useState } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Filter, 
  Search, 
  Download, 
  Users,
  AlertTriangle,
  History
} from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { WeekNavigator } from './WeekNavigator';
import { TeamTimeRow } from './TeamTimeRow';
import { useTeamTime } from '../hooks/useTeamTime';
import { useTimeSync } from '../hooks/useTimeSync';
import { TeamTimeFilters, BulkTimeAction } from '../types';
import { toast } from 'sonner';

export const TeamTimePage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  
  const [filters, setFilters] = useState<TeamTimeFilters>({
    status: 'all',
    department: '',
    searchTerm: ''
  });
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const {
    teamEntries,
    isLoading,
    error,
    bulkAction,
    isBulkActionPending,
    getAuditLogQuery
  } = useTeamTime(currentWeek, filters);

  // Get all time entry IDs for sync status
  const allTimeEntryIds = teamEntries.flatMap(entry => 
    entry.entries ? entry.entries.map(e => e.id) : []
  );

  const {
    syncApprovedEntries,
    isSyncing,
    getSyncStatusForEntry,
    isEntrySynced,
    hasEntrySyncErrors
  } = useTimeSync(allTimeEntryIds);

  const updateFilters = (newFilters: Partial<TeamTimeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleEmployees = teamEntries
        .filter(entry => entry.status === 'submitted')
        .map(entry => entry.employeeId);
      setSelectedEmployees(eligibleEmployees);
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleBulkApprove = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees to approve');
      return;
    }

    const action: BulkTimeAction = {
      action: 'approve',
      employeeIds: selectedEmployees,
      weekStart: currentWeek
    };

    bulkAction(action);
    
    // After approval, sync to PayrollIQ and ProjectIQ
    const approvedEntryIds = teamEntries
      .filter(entry => selectedEmployees.includes(entry.employeeId))
      .flatMap(entry => entry.entries ? entry.entries.map(e => e.id) : []);
    
    if (approvedEntryIds.length > 0) {
      setTimeout(() => {
        syncApprovedEntries(approvedEntryIds);
      }, 1000); // Slight delay to allow approval to process
    }
    
    setSelectedEmployees([]);
  };

  const handleBulkReject = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees to reject');
      return;
    }

    // In a real implementation, you'd show a modal to collect rejection reason
    const reason = window.prompt('Reason for rejection (optional):');
    
    const action: BulkTimeAction = {
      action: 'reject',
      employeeIds: selectedEmployees,
      weekStart: currentWeek,
      reason: reason || undefined
    };

    bulkAction(action);
    setSelectedEmployees([]);
  };

  const handleApproveEmployee = (employeeId: string) => {
    const action: BulkTimeAction = {
      action: 'approve',
      employeeIds: [employeeId],
      weekStart: currentWeek
    };
    bulkAction(action);
    
    // After approval, sync to PayrollIQ and ProjectIQ
    const employeeEntry = teamEntries.find(entry => entry.employeeId === employeeId);
    if (employeeEntry?.entries) {
      const entryIds = employeeEntry.entries.map(e => e.id);
      setTimeout(() => {
        syncApprovedEntries(entryIds);
      }, 1000); // Slight delay to allow approval to process
    }
  };

  const handleRejectEmployee = (employeeId: string) => {
    // In a real implementation, you'd show a modal to collect rejection reason
    const reason = window.prompt('Reason for rejection (optional):');
    
    const action: BulkTimeAction = {
      action: 'reject',
      employeeIds: [employeeId],
      weekStart: currentWeek,
      reason: reason || undefined
    };
    bulkAction(action);
  };

  const handleEditEmployee = (employeeId: string) => {
    // Navigate to edit view - in a real implementation
    console.log('Edit employee timesheet:', employeeId);
    toast.info('Edit functionality would open employee timesheet');
  };

  const handleViewAudit = (employeeId: string) => {
    // Show audit log modal - in a real implementation
    console.log('View audit log for employee:', employeeId);
    toast.info('Audit log modal would open');
  };

  // Calculate summary stats
  const stats = {
    total: teamEntries.length,
    submitted: teamEntries.filter(e => e.status === 'submitted').length,
    approved: teamEntries.filter(e => e.status === 'approved').length,
    rejected: teamEntries.filter(e => e.status === 'rejected').length,
    draft: teamEntries.filter(e => e.status === 'draft').length,
    withIssues: teamEntries.filter(e => e.complianceIssues.length > 0).length
  };

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Team Time</h1>
              <p className="text-muted-foreground">Review and approve team timesheets</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-destructive">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load team time data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Team Time</h1>
            <p className="text-muted-foreground">Review and approve team timesheets</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Week Navigation and Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <WeekNavigator
                  currentWeek={currentWeek}
                  onWeekChange={setCurrentWeek}
                />
                
                {/* Quick Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{stats.total} employees</span>
                  </div>
                  <Badge variant="secondary">{stats.submitted} submitted</Badge>
                  <Badge variant="default">{stats.approved} approved</Badge>
                  {stats.withIssues > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {stats.withIssues} issues
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex gap-4 pt-4 border-t">
                <div className="flex-1">
                  <Input
                    placeholder="Search employees..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                    className="max-w-sm"
                  />
                </div>
                
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => updateFilters({ status: value as any })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="not_submitted">Not Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Department..."
                  value={filters.department || ''}
                  onChange={(e) => updateFilters({ department: e.target.value })}
                  className="w-40"
                />
              </div>
            )}
          </CardHeader>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="px-6 py-3 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedEmployees.length} employee(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={isBulkActionPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={isBulkActionPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            </div>
          )}

          <CardContent className="p-0">
            {/* Select All Header */}
            <div className="px-6 py-3 border-b bg-muted/20">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length > 0 && selectedEmployees.length === teamEntries.filter(e => e.status === 'submitted').length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Select all submitted timesheets
                </span>
              </div>
            </div>

            {/* Team Entries */}
            <div className="p-6 space-y-4">
              {teamEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No team entries found for this week</p>
                </div>
              ) : (
                teamEntries.map((entry) => (
                  <TeamTimeRow
                    key={entry.id}
                    entry={entry}
                    weekStart={currentWeek}
                    isSelected={selectedEmployees.includes(entry.employeeId)}
                    onSelect={(selected) => handleSelectEmployee(entry.employeeId, selected)}
                    onApprove={handleApproveEmployee}
                    onReject={handleRejectEmployee}
                    onEdit={handleEditEmployee}
                    onViewAudit={handleViewAudit}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};