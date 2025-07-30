import React, { useState, useEffect } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, Clock, AlertTriangle, Smartphone, Table, Plus } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { useBreakpoint } from '@/hooks/use-mobile';
import { WeekNavigator } from './WeekNavigator';
import { TimesheetGrid } from './TimesheetGrid';
import { TimeScoreCard } from './TimeScoreCard';
import { QuickEntry } from './QuickEntry';
import { useWeeklyTimesheet } from '../hooks/useWeeklyTimesheet';
import { useTimeScore } from '../hooks/useTimeScore';
import { useAutoSave } from '../hooks/useAutoSave';
import { TimeTrackService } from '../services/TimeTrackService';
import { CreateTimeEntryRequest } from '../types';

type ViewMode = 'table' | 'quick';

export const MyTimePage: React.FC = () => {
  const { isMobile } = useBreakpoint();
  const [currentWeek, setCurrentWeek] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  // Auto-detect mobile and set quick entry as default
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('quick');
    }
  }, [isMobile, viewMode]);

  const {
    timesheet,
    isLoading,
    error,
    updateRow,
    addRow,
    deleteRow,
    copyLastWeek,
    submitTimesheet,
    isUpdating,
    isAdding,
    isDeleting,
    isCopying,
    isSubmitting,
  } = useWeeklyTimesheet(currentWeek);

  // Mock data for projects and time codes
  const mockProjects = [
    { id: 'project-1', name: 'Website Redesign', company_id: '', client_name: 'Client A', is_billable: true, is_active: true, created_by: '', created_at: '', updated_at: '' },
    { id: 'project-2', name: 'Mobile App', company_id: '', client_name: 'Client B', is_billable: true, is_active: true, created_by: '', created_at: '', updated_at: '' },
  ];

  const mockTimeCodes = [
    { id: 'regular', name: 'Regular Time', code: 'REG', category: 'work' as const, is_paid: true, is_billable: true, is_active: true, requires_approval: false, sort_order: 1, company_id: '', created_at: '', updated_at: '' },
    { id: 'overtime', name: 'Overtime', code: 'OT', category: 'work' as const, is_paid: true, is_billable: true, is_active: true, requires_approval: true, sort_order: 2, company_id: '', created_at: '', updated_at: '' },
    { id: 'pto', name: 'PTO', code: 'PTO', category: 'pto' as const, is_paid: true, is_billable: false, is_active: true, requires_approval: true, sort_order: 3, company_id: '', created_at: '', updated_at: '' },
    { id: 'sick', name: 'Sick Leave', code: 'SICK', category: 'pto' as const, is_paid: true, is_billable: false, is_active: true, requires_approval: true, sort_order: 4, company_id: '', created_at: '', updated_at: '' },
  ];

  const { isSaving, hasUnsavedChanges } = useAutoSave({
    data: timesheet,
    onSave: (data) => {
      // Auto-save logic would go here
      console.log('Auto-saving timesheet:', data);
    },
    enabled: !!timesheet && timesheet.status === 'draft'
  });

  const totalHours = timesheet?.totalHours || 0;
  const isSubmitted = timesheet?.status === 'submitted';
  const isApproved = timesheet?.status === 'approved';
  const canEdit = timesheet?.status === 'draft';

  const handleCopyLastWeek = () => {
    copyLastWeek();
  };

  const handleSubmit = () => {
    if (timesheet?.complianceIssues?.some(issue => issue.severity === 'error')) {
      return; // Don't submit if there are errors
    }
    submitTimesheet();
  };

  const handleQuickEntrySave = async (entryData: CreateTimeEntryRequest) => {
    try {
      // In real implementation, this would call TimeTrackService.createTimeEntry
      console.log('Quick entry saved:', entryData);
      
      // Refresh timesheet data after save
      // The hook should be updated to support individual entry creation
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving quick entry:', error);
      throw error;
    }
  };

  const handleToggleView = () => {
    setViewMode(prev => prev === 'table' ? 'quick' : 'table');
  };

  // If showing quick entry overlay
  if (showQuickEntry) {
    return (
      <QuickEntry
        projects={mockProjects}
        timeCodes={mockTimeCodes}
        onSaveEntry={handleQuickEntrySave}
        onCancel={() => setShowQuickEntry(false)}
      />
    );
  }

  // If mobile and quick mode, show QuickEntry as main view
  if (viewMode === 'quick') {
    return (
      <UnifiedLayout>
        <div className="relative">
          {/* Mobile Header with Toggle */}
          <div className="sticky top-0 z-10 bg-background border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">My Time</h1>
                <p className="text-sm text-muted-foreground">Quick Entry</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleView}
                  className="gap-2"
                >
                  <Table className="h-4 w-4" />
                  Table View
                </Button>
                <Badge variant={
                  isApproved ? 'default' :
                  isSubmitted ? 'secondary' : 
                  'outline'
                }>
                  {timesheet?.status || 'draft'}
                </Badge>
              </div>
            </div>
          </div>

          <QuickEntry
            projects={mockProjects}
            timeCodes={mockTimeCodes}
            onSaveEntry={handleQuickEntrySave}
            onCancel={() => setViewMode('table')}
            className="pt-0"
          />
        </div>
      </UnifiedLayout>
    );
  }

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">My Timesheet</h1>
              <p className="text-muted-foreground">Track your weekly hours</p>
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
                <p>Failed to load timesheet</p>
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
            <h1 className="text-2xl font-semibold">My Timesheet</h1>
            <p className="text-muted-foreground">Track your weekly hours</p>
          </div>
          
          {/* Status and Controls */}
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <Table className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === ('quick' as ViewMode) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('quick' as ViewMode)}
                className="gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Quick Entry
              </Button>
            </div>

            {/* Mobile Quick Entry Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickEntry(true)}
              className="sm:hidden gap-2"
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>

            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
            
            {hasUnsavedChanges && !isSaving && (
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                Unsaved changes
              </div>
            )}

            <Badge variant={
              isApproved ? 'default' :
              isSubmitted ? 'secondary' : 
              'outline'
            }>
              {timesheet?.status || 'draft'}
            </Badge>
          </div>
        </div>

        {/* Week Navigation and Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <WeekNavigator
                  currentWeek={currentWeek}
                  onWeekChange={setCurrentWeek}
                />
                <div className="flex items-center gap-4 text-sm">
                  <span>Total Hours: <span className="font-semibold">{totalHours.toFixed(2)}</span></span>
                  {timesheet?.complianceIssues && timesheet.complianceIssues.length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {timesheet.complianceIssues.length} issues
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLastWeek}
                  disabled={!canEdit || isCopying}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {isCopying ? 'Copying...' : 'Copy Last Week'}
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!canEdit || isSubmitting || timesheet?.complianceIssues?.some(issue => issue.severity === 'error')}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <TimesheetGrid
              weekStart={currentWeek}
              rows={timesheet?.rows || []}
              projects={mockProjects}
              timeCodes={mockTimeCodes}
              complianceIssues={timesheet?.complianceIssues || []}
              onRowUpdate={updateRow}
              onRowAdd={addRow}
              onRowDelete={deleteRow}
              isUpdating={isUpdating || isAdding || isDeleting}
            />
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};