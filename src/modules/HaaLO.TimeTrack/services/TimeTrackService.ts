import { supabase } from '@/integrations/supabase/client';
import { 
  TimeEntry, 
  TimeProject, 
  TimeCode, 
  TimeSettings,
  WeeklyTimesheetData,
  TimesheetRow,
  TeamTimeEntry,
  TeamTimeFilters,
  BulkTimeAction,
  TimeSummaryData,
  TimeCodeSummary,
  DailySummary,
  ComplianceFlag,
  ReportType,
  ReportConfig,
  ReportFilters,
  ReportData,
  ReportExportOptions,
  TimePolicy,
  TimePolicyCreateRequest,
  TimePolicyUpdateRequest,
  TimeComplianceViolation,
  CustomTimeRule,
  OvertimeCalculationResult
} from '../types';

export class TimeTrackService {
  // Time Entries
  static async getTimeEntries(filters?: any): Promise<TimeEntry[]> {
    try {
      // Return mock data for now
      return [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  // Weekly Timesheet Methods
  static async getWeeklyTimesheet(employeeId: string, weekStart: string): Promise<WeeklyTimesheetData> {
    try {
      // Mock implementation - replace with actual Supabase queries
      const mockRows: TimesheetRow[] = [
        {
          id: '1',
          projectId: 'project-1',
          timeCodeId: 'regular',
          tags: ['development'],
          notes: 'Working on new features',
          dailyHours: {
            '2024-01-22': 8,
            '2024-01-23': 8,
            '2024-01-24': 8,
            '2024-01-25': 8,
            '2024-01-26': 8,
            '2024-01-27': 0,
            '2024-01-28': 0,
          },
          totalHours: 40
        }
      ];

      return {
        weekStart,
        rows: mockRows,
        totalHours: 40,
        status: 'draft',
        complianceIssues: []
      };
    } catch (error) {
      console.error('Error fetching weekly timesheet:', error);
      throw error;
    }
  }

  static async updateTimesheetRow(rowId: string, data: Partial<TimesheetRow>): Promise<TimesheetRow> {
    try {
      // Mock implementation
      console.log('Updating timesheet row:', rowId, data);
      return { ...data, id: rowId } as TimesheetRow;
    } catch (error) {
      console.error('Error updating timesheet row:', error);
      throw error;
    }
  }

  static async addTimesheetRow(weekStart: string, employeeId: string): Promise<TimesheetRow> {
    try {
      const newRow: TimesheetRow = {
        id: Date.now().toString(),
        projectId: undefined,
        timeCodeId: undefined,
        tags: [],
        notes: '',
        dailyHours: {},
        totalHours: 0
      };
      console.log('Adding timesheet row:', newRow);
      return newRow;
    } catch (error) {
      console.error('Error adding timesheet row:', error);
      throw error;
    }
  }

  static async deleteTimesheetRow(rowId: string): Promise<boolean> {
    try {
      console.log('Deleting timesheet row:', rowId);
      return true;
    } catch (error) {
      console.error('Error deleting timesheet row:', error);
      throw error;
    }
  }

  static async copyLastWeek(employeeId: string, currentWeekStart: string): Promise<WeeklyTimesheetData> {
    try {
      // Mock implementation - copy previous week's data
      console.log('Copying last week for employee:', employeeId, 'to week:', currentWeekStart);
      return this.getWeeklyTimesheet(employeeId, currentWeekStart);
    } catch (error) {
      console.error('Error copying last week:', error);
      throw error;
    }
  }

  static async submitTimesheet(employeeId: string, weekStart: string): Promise<boolean> {
    try {
      console.log('Submitting timesheet for approval:', employeeId, weekStart);
      return true;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }

  // Team Management Methods
  static async getTeamTimeEntries(weekStart: string, filters?: TeamTimeFilters): Promise<TeamTimeEntry[]> {
    try {
      // Mock implementation - replace with actual Supabase queries
      const mockTeamEntries: TeamTimeEntry[] = [
        {
          id: 'team-1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          department: 'Engineering',
          weekStart,
          totalHours: 40,
          status: 'submitted',
          submittedAt: '2024-01-26T10:00:00Z',
          dailyHours: {
            '2024-01-22': 8,
            '2024-01-23': 8,
            '2024-01-24': 8,
            '2024-01-25': 8,
            '2024-01-26': 8,
            '2024-01-27': 0,
            '2024-01-28': 0,
          },
          entries: [],
          complianceIssues: []
        },
        {
          id: 'team-2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          department: 'Design',
          weekStart,
          totalHours: 35,
          status: 'approved',
          submittedAt: '2024-01-26T09:00:00Z',
          approvedAt: '2024-01-26T14:00:00Z',
          approvedBy: 'manager-1',
          dailyHours: {
            '2024-01-22': 7,
            '2024-01-23': 7,
            '2024-01-24': 7,
            '2024-01-25': 7,
            '2024-01-26': 7,
            '2024-01-27': 0,
            '2024-01-28': 0,
          },
          entries: [],
          complianceIssues: []
        },
        {
          id: 'team-3',
          employeeId: 'emp-3',
          employeeName: 'Mike Johnson',
          department: 'Engineering',
          weekStart,
          totalHours: 0,
          status: 'draft',
          dailyHours: {},
          entries: [],
          complianceIssues: [
            {
              type: 'missing_time',
              message: 'No time entered for this week',
              severity: 'error'
            }
          ]
        }
      ];

      // Apply filters
      let filteredEntries = mockTeamEntries;

      if (filters?.department) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.department?.toLowerCase().includes(filters.department!.toLowerCase())
        );
      }

      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'not_submitted') {
          filteredEntries = filteredEntries.filter(entry => entry.status === 'draft');
        } else {
          filteredEntries = filteredEntries.filter(entry => entry.status === filters.status);
        }
      }

      if (filters?.searchTerm) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.employeeName.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }

      return filteredEntries;
    } catch (error) {
      console.error('Error fetching team time entries:', error);
      throw error;
    }
  }

  static async bulkApproveTimeEntries(action: BulkTimeAction): Promise<boolean> {
    try {
      console.log('Bulk action:', action);
      return true;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  static async getTimeEntryAuditLog(employeeId: string, weekStart: string): Promise<any[]> {
    try {
      // Mock audit log
      return [
        {
          id: '1',
          timestamp: '2024-01-26T10:00:00Z',
          action: 'submitted',
          performedBy: 'John Doe',
          details: 'Timesheet submitted for approval'
        },
        {
          id: '2',
          timestamp: '2024-01-26T14:00:00Z',
          action: 'approved',
          performedBy: 'Manager Name',
          details: 'Timesheet approved'
        }
      ];
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  // Time Summary Methods
  static async getTimeSummary(employeeId: string, weekStart: string): Promise<TimeSummaryData> {
    try {
      // Mock implementation - replace with actual Supabase queries
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const timeCodeBreakdown: TimeCodeSummary[] = [
        {
          timeCodeId: 'regular',
          timeCodeName: 'Regular Time',
          hours: 40,
          percentage: 80,
          color: '#655DC6'
        },
        {
          timeCodeId: 'overtime',
          timeCodeName: 'Overtime',
          hours: 5,
          percentage: 10,
          color: '#FF6B6B'
        },
        {
          timeCodeId: 'pto',
          timeCodeName: 'PTO',
          hours: 5,
          percentage: 10,
          color: '#4ECDC4'
        }
      ];

      const dailyBreakdown: DailySummary[] = [
        { date: '2024-01-22', dayName: 'Mon', hours: 9, target: 8, isCompliant: false },
        { date: '2024-01-23', dayName: 'Tue', hours: 8, target: 8, isCompliant: true },
        { date: '2024-01-24', dayName: 'Wed', hours: 8, target: 8, isCompliant: true },
        { date: '2024-01-25', dayName: 'Thu', hours: 8, target: 8, isCompliant: true },
        { date: '2024-01-26', dayName: 'Fri', hours: 7, target: 8, isCompliant: false },
        { date: '2024-01-27', dayName: 'Sat', hours: 0, target: 0, isCompliant: true },
        { date: '2024-01-28', dayName: 'Sun', hours: 0, target: 0, isCompliant: true }
      ];

      const complianceFlags: ComplianceFlag[] = [
        {
          type: 'overtime',
          severity: 'warning',
          message: 'Weekly hours exceed 40 hours',
          value: 45,
          threshold: 40
        },
        {
          type: 'over_limit',
          severity: 'error',
          message: 'Daily hours exceed 12 hours',
          value: 13,
          threshold: 12,
          dates: ['2024-01-22']
        },
        {
          type: 'under_limit',
          severity: 'warning',
          message: 'Daily hours below target',
          value: 7,
          threshold: 8,
          dates: ['2024-01-26']
        }
      ];

      return {
        weekStart,
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalHours: 50,
        regularHours: 40,
        overtimeHours: 5,
        ptoHours: 5,
        sickHours: 0,
        holidayHours: 0,
        timeCodeBreakdown,
        dailyBreakdown,
        complianceFlags,
        weeklyTarget: 40
      };
    } catch (error) {
      console.error('Error fetching time summary:', error);
      throw error;
    }
  }

  static async exportTimeSummary(employeeId: string, weekStart: string, format: 'pdf' | 'excel'): Promise<string> {
    try {
      // Mock implementation - would generate actual export
      console.log('Exporting time summary:', { employeeId, weekStart, format });
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock download URL
      return `https://example.com/exports/timesheet-${weekStart}.${format}`;
    } catch (error) {
      console.error('Error exporting time summary:', error);
      throw error;
    }
  }

  // Report Methods
  static getReportConfigs(): ReportConfig[] {
    return [
      {
        type: 'time_by_employee',
        name: 'Time by Employee',
        description: 'Hours worked by each employee',
        fields: [
          { key: 'employee_name', label: 'Employee', type: 'text', sortable: true, exportable: true },
          { key: 'department', label: 'Department', type: 'text', sortable: true, exportable: true },
          { key: 'total_hours', label: 'Total Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'regular_hours', label: 'Regular Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'overtime_hours', label: 'Overtime Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'pto_hours', label: 'PTO Hours', type: 'hours', sortable: true, exportable: true }
        ]
      },
      {
        type: 'time_by_project',
        name: 'Time by Project',
        description: 'Hours allocated to each project',
        fields: [
          { key: 'project_name', label: 'Project', type: 'text', sortable: true, exportable: true },
          { key: 'client_name', label: 'Client', type: 'text', sortable: true, exportable: true },
          { key: 'total_hours', label: 'Total Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'billable_hours', label: 'Billable Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'total_cost', label: 'Total Cost', type: 'currency', sortable: true, exportable: true },
          { key: 'employee_count', label: 'Employees', type: 'number', sortable: true, exportable: true }
        ]
      },
      {
        type: 'time_by_client',
        name: 'Time by Client',
        description: 'Hours worked for each client',
        fields: [
          { key: 'client_name', label: 'Client', type: 'text', sortable: true, exportable: true },
          { key: 'project_count', label: 'Projects', type: 'number', sortable: true, exportable: true },
          { key: 'total_hours', label: 'Total Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'billable_hours', label: 'Billable Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'total_revenue', label: 'Total Revenue', type: 'currency', sortable: true, exportable: true },
          { key: 'avg_hourly_rate', label: 'Avg Rate', type: 'currency', sortable: true, exportable: true }
        ]
      },
      {
        type: 'overtime_report',
        name: 'Overtime Report',
        description: 'Employees with overtime hours',
        fields: [
          { key: 'employee_name', label: 'Employee', type: 'text', sortable: true, exportable: true },
          { key: 'department', label: 'Department', type: 'text', sortable: true, exportable: true },
          { key: 'regular_hours', label: 'Regular Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'overtime_hours', label: 'Overtime Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'overtime_rate', label: 'OT Rate', type: 'currency', sortable: true, exportable: true },
          { key: 'overtime_cost', label: 'OT Cost', type: 'currency', sortable: true, exportable: true }
        ]
      },
      {
        type: 'missed_entries',
        name: 'Missed Time Entries',
        description: 'Missing or incomplete time entries',
        fields: [
          { key: 'employee_name', label: 'Employee', type: 'text', sortable: true, exportable: true },
          { key: 'department', label: 'Department', type: 'text', sortable: true, exportable: true },
          { key: 'missed_date', label: 'Date', type: 'date', sortable: true, exportable: true },
          { key: 'expected_hours', label: 'Expected Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'actual_hours', label: 'Actual Hours', type: 'hours', sortable: true, exportable: true },
          { key: 'missing_hours', label: 'Missing Hours', type: 'hours', sortable: true, exportable: true }
        ]
      }
    ];
  }

  static async generateReport(filters: ReportFilters, page: number = 1, pageSize: number = 50): Promise<ReportData> {
    try {
      // Mock implementation - would call ReportIQ backend
      console.log('Generating report:', filters);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const config = this.getReportConfigs().find(c => c.type === filters.reportType);
      if (!config) throw new Error('Invalid report type');

      // Mock data based on report type
      const mockData = this.generateMockReportData(filters.reportType, page, pageSize);
      
      return {
        id: `report-${Date.now()}`,
        type: filters.reportType,
        title: config.name,
        filters,
        columns: config.fields.map(field => ({
          key: field.key,
          label: field.label,
          type: field.type,
          sortable: field.sortable || false
        })),
        rows: mockData.rows,
        summary: mockData.summary,
        pagination: mockData.pagination,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private static generateMockReportData(reportType: ReportType, page: number, pageSize: number) {
    const totalRecords = 47; // Mock total
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    let rows: any[] = [];
    let summary: any = {};

    switch (reportType) {
      case 'time_by_employee':
        rows = [
          { id: '1', employee_name: 'John Doe', department: 'Engineering', total_hours: 42, regular_hours: 40, overtime_hours: 2, pto_hours: 0 },
          { id: '2', employee_name: 'Jane Smith', department: 'Design', total_hours: 38, regular_hours: 38, overtime_hours: 0, pto_hours: 0 },
          { id: '3', employee_name: 'Mike Johnson', department: 'Engineering', total_hours: 45, regular_hours: 40, overtime_hours: 5, pto_hours: 0 }
        ];
        summary = { totalHours: 125, totalCost: 12500, averageHours: 41.7, recordCount: 3 };
        break;
        
      case 'time_by_project':
        rows = [
          { id: '1', project_name: 'Website Redesign', client_name: 'Client A', total_hours: 120, billable_hours: 120, total_cost: 15000, employee_count: 3 },
          { id: '2', project_name: 'Mobile App', client_name: 'Client B', total_hours: 80, billable_hours: 75, total_cost: 10000, employee_count: 2 }
        ];
        summary = { totalHours: 200, totalCost: 25000, averageHours: 100, recordCount: 2 };
        break;
        
      default:
        rows = [];
        summary = {};
    }

    return {
      rows: rows.slice((page - 1) * pageSize, page * pageSize),
      summary,
      pagination: {
        page,
        pageSize,
        total: totalRecords,
        totalPages
      }
    };
  }

  static async exportReport(reportData: ReportData, options: ReportExportOptions): Promise<string> {
    try {
      console.log('Exporting report:', { reportData: reportData.id, options });
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock download URL
      return `https://example.com/exports/report-${reportData.id}.${options.format}`;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  static async createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
    try {
      // Mock implementation
      const mockEntry: TimeEntry = {
        id: '1',
        employee_id: data.employee_id || '',
        company_id: data.company_id || '',
        date: data.date || new Date().toISOString().split('T')[0],
        project_id: data.project_id,
        time_code_id: data.time_code_id,
        hours: data.hours || 0,
        hours_worked: data.hours_worked || 0,
        notes: data.notes,
        tags: data.tags || [],
        is_billable: data.is_billable || false,
        hourly_rate: data.hourly_rate,
        status: 'draft',
        location: data.location,
        is_remote: data.is_remote || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockEntry;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  // Projects
  static async getProjects(companyId: string): Promise<TimeProject[]> {
    return [];
  }

  // Time Codes
  static async getTimeCodes(companyId: string): Promise<TimeCode[]> {
    return [];
  }

  // Settings
  static async getSettings(companyId: string): Promise<TimeSettings | null> {
    return null;
  }

  // Time Sync Methods for PayrollIQ and ProjectIQ integration
  static async syncTimeEntries(request: import('../types').SyncRequest): Promise<import('../types').SyncResult> {
    try {
      console.log('Syncing time entries:', request);
      
      // Mock implementation - would call actual PayrollIQ/ProjectIQ APIs
      const results: import('../types').SyncResult = {
        success: true,
        synced_count: request.time_entry_ids.length,
        failed_count: 0,
        errors: [],
        sync_logs: []
      };

      // Create sync logs for each entry
      for (const entryId of request.time_entry_ids) {
        for (const destination of request.destinations) {
          const { data: syncLog, error } = await supabase
            .from('time_sync_logs')
            .insert({
              company_id: 'mock-company-id', // Should come from context
              time_entry_id: entryId,
              sync_destination: destination,
              sync_status: 'synced',
              sync_attempts: 1,
              last_sync_attempt: new Date().toISOString(),
              last_sync_success: new Date().toISOString(),
              payroll_entry_id: destination === 'payroll' ? `payroll_${entryId}` : null,
              jobcost_entry_id: destination === 'jobcost' ? `jobcost_${entryId}` : null
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating sync log:', error);
            results.failed_count++;
            results.errors.push(`Failed to log sync for entry ${entryId}: ${error.message}`);
          } else if (syncLog) {
            results.sync_logs.push(syncLog as import('../types').TimeSyncLog);
          }
        }
      }

      results.success = results.failed_count === 0;
      return results;
    } catch (error) {
      console.error('Error syncing time entries:', error);
      throw error;
    }
  }

  static async getSyncStatus(timeEntryIds: string[]): Promise<import('../types').TimeSyncLog[]> {
    try {
      const { data, error } = await supabase
        .from('time_sync_logs')
        .select('*')
        .in('time_entry_id', timeEntryIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as import('../types').TimeSyncLog[];
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }

  static async retrySyncEntry(syncLogId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('time_sync_logs')
        .update({
          sync_status: 'pending',
          last_sync_attempt: new Date().toISOString(),
          error_message: null
        })
        .eq('id', syncLogId)
        .select()
        .single();

      if (error) throw error;
      
      // Trigger sync process
      return this.processPendingSyncs();
    } catch (error) {
      console.error('Error retrying sync:', error);
      throw error;
    }
  }

  private static async processPendingSyncs(): Promise<boolean> {
    try {
      // Mock implementation - would process pending syncs
      console.log('Processing pending syncs...');
      return true;
    } catch (error) {
      console.error('Error processing pending syncs:', error);
      return false;
    }
  }

  // Pulse Alert Methods
  static async detectTimePatternAlerts(timeEntries: import('../types').TimeEntry[]): Promise<import('../types').PulseAlert[]> {
    const alerts: import('../types').PulseAlert[] = [];
    
    for (const entry of timeEntries) {
      // Overtime detection (>12 hours)
      if (entry.hours > 12) {
        alerts.push({
          id: `alert-${entry.id}-overtime`,
          employee_id: entry.employee_id,
          type: 'overtime',
          date: entry.date,
          severity: 'high',
          linked_entry_id: entry.id,
          message: `Employee worked ${entry.hours} hours in a single day`,
          sent_to_pulse: false,
          created_at: new Date().toISOString()
        });
      }
      
      // Missed break detection (>5 hours without break)
      if (entry.hours > 5 && (entry.break_minutes || 0) === 0) {
        alerts.push({
          id: `alert-${entry.id}-break`,
          employee_id: entry.employee_id,
          type: 'missed_break',
          date: entry.date,
          severity: 'medium',
          linked_entry_id: entry.id,
          message: `No break recorded for ${entry.hours}-hour shift`,
          sent_to_pulse: false,
          created_at: new Date().toISOString()
        });
      }
    }
    
    return alerts;
  }

  static async sendPulseAlert(alert: import('../types').PulseAlertRequest): Promise<boolean> {
    try {
      // Mock implementation - would call actual Pulse API
      console.log('Sending alert to Pulse:', alert);
      
      // Mock API call
      const response = await fetch('/api/pulse/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending Pulse alert:', error);
      return false;
    }
  }

  // Time Score Calculation Methods
  static async calculateTimeScore(
    employeeId: string, 
    weekStart: string, 
    timeEntries: import('../types').TimeEntry[]
  ): Promise<import('../types').TimeScore> {
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Initialize scoring factors
      const factors: import('../types').ScoreFactors = {
        submission_deadline: `${weekStart}T17:00:00Z`, // Friday 5PM
        expected_work_days: 5,
        actual_work_days: timeEntries.length,
        schedule_variance_threshold: 0.1, // 10%
        notes_required_count: timeEntries.filter(e => e.hours > 8).length,
        notes_provided_count: timeEntries.filter(e => e.notes && e.notes.trim().length > 0).length,
        approval_changes_made: false // Would be determined from approval history
      };

      // Calculate scoring components
      const breakdown: import('../types').ScoreBreakdown = {
        base_points: 0,
        submitted_on_time: 0,
        no_missing_days: 0,
        entries_match_schedule: 0,
        notes_included: 0,
        approved_without_changes: 0,
        overtime_penalty: 0,
        missed_day_penalty: 0,
        manager_flag_penalty: 0,
        total: 0
      };

      // +40: Submitted on time (by Friday 5PM)
      const submissionTime = new Date(); // Mock - would come from actual submission
      const deadline = new Date(factors.submission_deadline);
      if (submissionTime <= deadline) {
        breakdown.submitted_on_time = 40;
      }

      // +30: No missing days
      if (factors.actual_work_days >= factors.expected_work_days) {
        breakdown.no_missing_days = 30;
      }

      // +10: Entries match schedule (within 10% variance)
      const expectedDailyHours = 8;
      const scheduleMatch = timeEntries.every(entry => {
        const variance = Math.abs(entry.hours - expectedDailyHours) / expectedDailyHours;
        return variance <= factors.schedule_variance_threshold;
      });
      if (scheduleMatch) {
        breakdown.entries_match_schedule = 10;
      }

      // +10: Notes included where needed
      if (factors.notes_required_count === factors.notes_provided_count) {
        breakdown.notes_included = 10;
      }

      // +10: Manager approval with no changes
      if (!factors.approval_changes_made) {
        breakdown.approved_without_changes = 10;
      }

      // -10: Over 12 hrs/day
      const overtimeViolations = timeEntries.filter(e => e.hours > 12).length;
      breakdown.overtime_penalty = -(overtimeViolations * 10);

      // -10: Missed day
      const missedDays = Math.max(0, factors.expected_work_days - factors.actual_work_days);
      breakdown.missed_day_penalty = -(missedDays * 10);

      // -5: Entry flagged by manager (mock)
      const managerFlags = 0; // Would come from actual flag data
      breakdown.manager_flag_penalty = -(managerFlags * 5);

      // Calculate total
      breakdown.total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

      const timeScore: import('../types').TimeScore = {
        id: `score-${employeeId}-${weekStart}`,
        company_id: 'mock-company-id',
        employee_id: employeeId,
        week_start: weekStart,
        week_end: weekEnd.toISOString().split('T')[0],
        total_score: Math.max(0, breakdown.total),
        breakdown_json: breakdown,
        calculation_factors: factors,
        submitted_on_time: breakdown.submitted_on_time > 0,
        no_missing_days: breakdown.no_missing_days > 0,
        entries_match_schedule: breakdown.entries_match_schedule > 0,
        notes_included: breakdown.notes_included > 0,
        approved_without_changes: breakdown.approved_without_changes > 0,
        overtime_violations: overtimeViolations,
        missed_days: missedDays,
        manager_flags: managerFlags,
        calculated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return timeScore;
    } catch (error) {
      console.error('Error calculating time score:', error);
      throw error;
    }
  }

  static async saveTimeScore(timeScore: import('../types').TimeScore): Promise<import('../types').TimeScore> {
    try {
      const { data, error } = await supabase
        .from('time_scores')
        .upsert({
          company_id: timeScore.company_id,
          employee_id: timeScore.employee_id,
          week_start: timeScore.week_start,
          week_end: timeScore.week_end,
          total_score: timeScore.total_score,
          breakdown_json: timeScore.breakdown_json as any,
          calculation_factors: timeScore.calculation_factors as any,
          submitted_on_time: timeScore.submitted_on_time,
          no_missing_days: timeScore.no_missing_days,
          entries_match_schedule: timeScore.entries_match_schedule,
          notes_included: timeScore.notes_included,
          approved_without_changes: timeScore.approved_without_changes,
          overtime_violations: timeScore.overtime_violations,
          missed_days: timeScore.missed_days,
          manager_flags: timeScore.manager_flags
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as import('../types').TimeScore;
    } catch (error) {
      console.error('Error saving time score:', error);
      throw error;
    }
  }

  static async getTimeScore(employeeId: string, weekStart: string): Promise<import('../types').TimeScore | null> {
    try {
      const { data, error } = await supabase
        .from('time_scores')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as import('../types').TimeScore | null;
    } catch (error) {
      console.error('Error fetching time score:', error);
      throw error;
    }
  }

  static getScoreDisplayConfig(score: number): import('../types').ScoreDisplayConfig {
    if (score >= 90) {
      return {
        score,
        level: 'excellent',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '🌟',
        message: 'Excellent time management!'
      };
    } else if (score >= 70) {
      return {
        score,
        level: 'good',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '👍',
        message: 'Good performance with room for improvement'
      };
    } else {
      return {
        score,
        level: 'needs_improvement',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '⚠️',
        message: 'Needs improvement in time tracking'
      };
    }
  }
}

// Time Policy Management Methods
export class TimePolicyService {
  static async getTimePolicies(companyId: string): Promise<TimePolicy[]> {
    try {
      const { data, error } = await supabase
        .from('time_policies')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map(policy => ({
        ...policy,
        custom_rules: Array.isArray(policy.custom_rules) ? policy.custom_rules as unknown as CustomTimeRule[] : 
          (typeof policy.custom_rules === 'string' ? JSON.parse(policy.custom_rules) : []),
        workweek_start_day: policy.workweek_start_day as TimePolicy['workweek_start_day']
      }));
    } catch (error) {
      console.error('Error fetching time policies:', error);
      throw error;
    }
  }

  static async getActiveTimePolicy(companyId: string): Promise<TimePolicy | null> {
    try {
      const { data, error } = await supabase
        .from('time_policies')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Transform the data to match our types
      return {
        ...data,
        custom_rules: Array.isArray(data.custom_rules) ? data.custom_rules as unknown as CustomTimeRule[] : 
          (typeof data.custom_rules === 'string' ? JSON.parse(data.custom_rules) : []),
        workweek_start_day: data.workweek_start_day as TimePolicy['workweek_start_day']
      };
    } catch (error) {
      console.error('Error fetching active time policy:', error);
      throw error;
    }
  }

  static async createTimePolicy(policyData: TimePolicyCreateRequest): Promise<TimePolicy> {
    try {
      const { data, error } = await supabase
        .from('time_policies')
        .insert({
          ...policyData,
          custom_rules: JSON.stringify(policyData.custom_rules || [])
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform the data to match our types
      return {
        ...data,
        custom_rules: Array.isArray(data.custom_rules) ? data.custom_rules : JSON.parse(data.custom_rules as string || '[]'),
        workweek_start_day: data.workweek_start_day as TimePolicy['workweek_start_day']
      };
    } catch (error) {
      console.error('Error creating time policy:', error);
      throw error;
    }
  }

  static async updateTimePolicy(policyId: string, updates: Partial<TimePolicyUpdateRequest>): Promise<TimePolicy> {
    try {
      const updateData: any = { ...updates };
      if (updates.custom_rules) {
        updateData.custom_rules = JSON.stringify(updates.custom_rules);
      }
      
      const { data, error } = await supabase
        .from('time_policies')
        .update(updateData)
        .eq('id', policyId)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the data to match our types
      return {
        ...data,
        custom_rules: Array.isArray(data.custom_rules) ? data.custom_rules : JSON.parse(data.custom_rules as string || '[]'),
        workweek_start_day: data.workweek_start_day as TimePolicy['workweek_start_day']
      };
    } catch (error) {
      console.error('Error updating time policy:', error);
      throw error;
    }
  }

  static async activateTimePolicy(policyId: string, companyId: string): Promise<boolean> {
    try {
      // First deactivate all other policies for this company
      await supabase
        .from('time_policies')
        .update({ is_active: false })
        .eq('company_id', companyId);

      // Then activate the selected policy
      const { error } = await supabase
        .from('time_policies')
        .update({ is_active: true })
        .eq('id', policyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error activating time policy:', error);
      throw error;
    }
  }

  static async calculateOvertime(
    hoursWorked: number,
    date: string,
    weeklyHours: number,
    policy: TimePolicy
  ): Promise<OvertimeCalculationResult> {
    try {
      let regularHours = hoursWorked;
      let overtimeHours = 0;
      let doubletimeHours = 0;
      const violations: TimeComplianceViolation[] = [];
      const appliedRules: string[] = [];

      // Daily overtime calculation
      if (hoursWorked > policy.daily_overtime_threshold) {
        const dailyOT = Math.min(
          hoursWorked - policy.daily_overtime_threshold,
          policy.daily_doubletime_threshold - policy.daily_overtime_threshold
        );
        overtimeHours += dailyOT;
        regularHours = policy.daily_overtime_threshold;
        appliedRules.push(`Daily OT: ${dailyOT} hours`);

        // Daily double-time calculation
        if (hoursWorked > policy.daily_doubletime_threshold) {
          const dailyDT = hoursWorked - policy.daily_doubletime_threshold;
          doubletimeHours += dailyDT;
          overtimeHours = policy.daily_doubletime_threshold - policy.daily_overtime_threshold;
          appliedRules.push(`Daily DT: ${dailyDT} hours`);
        }
      }

      // Weekly overtime calculation
      if (weeklyHours > policy.weekly_overtime_threshold) {
        const weeklyOT = weeklyHours - policy.weekly_overtime_threshold;
        // This would need more complex logic to distribute across the week
        appliedRules.push(`Weekly OT: ${weeklyOT} hours total`);
      }

      return {
        regularHours,
        overtimeHours,
        doubletimeHours,
        totalHours: hoursWorked,
        violations,
        appliedRules
      };
    } catch (error) {
      console.error('Error calculating overtime:', error);
      throw error;
    }
  }

  static async getComplianceViolations(companyId: string, filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    severity?: string;
    resolved?: boolean;
  }): Promise<TimeComplianceViolation[]> {
    try {
      let query = supabase
        .from('time_compliance_violations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.startDate) {
        query = query.gte('violation_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('violation_date', filters.endDate);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.resolved !== undefined) {
        query = query.eq('is_resolved', filters.resolved);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map(violation => ({
        ...violation,
        violation_type: violation.violation_type as TimeComplianceViolation['violation_type'],
        severity: violation.severity as TimeComplianceViolation['severity']
      }));
    } catch (error) {
      console.error('Error fetching compliance violations:', error);
      throw error;
    }
  }

  static async resolveViolation(violationId: string, resolutionNotes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_compliance_violations')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        })
        .eq('id', violationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resolving violation:', error);
      throw error;
    }
  }
}