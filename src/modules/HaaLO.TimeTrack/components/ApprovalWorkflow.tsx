import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, 
  Clock, 
  Calendar,
  Users,
  AlertTriangle,
  Download,
  Filter
} from "lucide-react";
import { SupervisorService } from "../services/SupervisorService";
import { TimecardSummary } from "../types/supervisor";
import { useToast } from "@/hooks/use-toast";

interface ApprovalWorkflowProps {
  companyId: string;
  supervisorId: string;
}

export function ApprovalWorkflow({ companyId, supervisorId }: ApprovalWorkflowProps) {
  const { toast } = useToast();
  const [timecards, setTimecards] = useState<TimecardSummary[]>([]);
  const [selectedTimecards, setSelectedTimecards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    loadTimecards();
  }, [companyId, supervisorId, periodStart, periodEnd]);

  const loadTimecards = async () => {
    try {
      setLoading(true);
      const summaries = await SupervisorService.getTimecardSummaries(
        supervisorId,
        companyId,
        periodStart,
        periodEnd
      );
      setTimecards(summaries);
    } catch (error) {
      console.error('Failed to load timecards:', error);
      toast({
        title: "Error",
        description: "Failed to load timecards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTimecard = (timecardId: string, checked: boolean) => {
    const newSelected = new Set(selectedTimecards);
    if (checked) {
      newSelected.add(timecardId);
    } else {
      newSelected.delete(timecardId);
    }
    setSelectedTimecards(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingTimecards = filteredTimecards
        .filter(tc => tc.approval_status === 'pending')
        .map(tc => tc.employee_id);
      setSelectedTimecards(new Set(pendingTimecards));
    } else {
      setSelectedTimecards(new Set());
    }
  };

  const handleApproveSelected = async () => {
    if (selectedTimecards.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select timecards to approve",
        variant: "destructive"
      });
      return;
    }

    setApproving(true);
    try {
      await SupervisorService.approveTimecards(
        Array.from(selectedTimecards),
        supervisorId,
        'weekly',
        periodStart,
        periodEnd,
        'Bulk approval'
      );

      toast({
        title: "Success",
        description: `Approved ${selectedTimecards.size} timecards`,
        variant: "default"
      });

      setSelectedTimecards(new Set());
      await loadTimecards();
    } catch (error) {
      console.error('Failed to approve timecards:', error);
      toast({
        title: "Error",
        description: "Failed to approve timecards",
        variant: "destructive"
      });
    } finally {
      setApproving(false);
    }
  };

  const exportTimecards = async () => {
    try {
      const exportData = await SupervisorService.exportForPayroll(
        companyId,
        periodStart,
        periodEnd
      );

      // Convert to CSV
      const csvContent = [
        'Employee,Date,Regular Hours,Overtime Hours,Total Hours,Job Code,Approved At',
        ...exportData.map(row => 
          `${row.employee_name},${row.date},${row.regular_hours},${row.overtime_hours},${row.total_hours},${row.job_code || ''},${row.approved_at || ''}`
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timecards_${periodStart}_to_${periodEnd}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Timecard data exported successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to export timecards:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export timecard data",
        variant: "destructive"
      });
    }
  };

  const filteredTimecards = timecards.filter(tc => {
    if (filterStatus === 'all') return true;
    return tc.approval_status === filterStatus;
  });

  const approvalStats = {
    total: timecards.length,
    pending: timecards.filter(tc => tc.approval_status === 'pending').length,
    approved: timecards.filter(tc => tc.approval_status === 'approved').length,
    compliance_issues: timecards.filter(tc => tc.compliance_status !== 'compliant').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Timecard Approvals
          </h3>
          <p className="text-muted-foreground">Review and approve employee timecards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTimecards}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleApproveSelected}
            disabled={selectedTimecards.size === 0 || approving}
          >
            {approving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <CheckSquare className="h-4 w-4 mr-2" />
            )}
            Approve Selected ({selectedTimecards.size})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{approvalStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{approvalStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvalStats.approved}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-600">{approvalStats.compliance_issues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="period-start">Period:</Label>
          <Input
            id="period-start"
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="w-auto"
          />
          <span>to</span>
          <Input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-auto"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="border border-input bg-background px-3 py-2 text-sm rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Timecard List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timecards</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedTimecards.size === filteredTimecards.filter(tc => tc.approval_status === 'pending').length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">Select All Pending</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredTimecards.length > 0 ? (
            <div className="space-y-2">
              {filteredTimecards.map((timecard) => (
                <div 
                  key={timecard.employee_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {timecard.approval_status === 'pending' && (
                      <Checkbox
                        checked={selectedTimecards.has(timecard.employee_id)}
                        onCheckedChange={(checked) => 
                          handleSelectTimecard(timecard.employee_id, checked as boolean)
                        }
                      />
                    )}
                    
                    <div>
                      <p className="font-medium">{timecard.employee_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(timecard.period_start).toLocaleDateString()} - {new Date(timecard.period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Hours */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-medium">{timecard.total_hours.toFixed(1)}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Overtime</p>
                      <p className="font-medium">{timecard.overtime_hours.toFixed(1)}</p>
                    </div>

                    {/* Compliance Status */}
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={timecard.compliance_status === 'compliant' ? 'default' : 'destructive'}
                        className={
                          timecard.compliance_status === 'compliant' 
                            ? 'bg-green-100 text-green-800' 
                            : timecard.compliance_status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {timecard.compliance_status}
                      </Badge>
                      
                      <Badge 
                        variant={timecard.approval_status === 'approved' ? 'default' : 'outline'}
                        className={
                          timecard.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {timecard.approval_status}
                      </Badge>
                    </div>

                    {/* Flags */}
                    {timecard.flags.length > 0 && (
                      <div className="flex gap-1">
                        {timecard.flags.slice(0, 2).map((flag, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                        {timecard.flags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{timecard.flags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {timecard.approval_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveSelected()}
                          disabled={!selectedTimecards.has(timecard.employee_id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timecards found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}