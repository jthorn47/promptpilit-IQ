import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  company_id: string;
}

interface PayrollTimeEntryProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

interface PayrollEmployee {
  id: string;
  instructor_name: string;
  regular_hourly_rate: number;
  is_active: boolean;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  instructor_name: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  entry_type: string;
  notes?: string;
}

export const PayrollTimeEntry: React.FC<PayrollTimeEntryProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({
    employee_id: '',
    work_date: '',
    regular_hours: 0,
    overtime_hours: 0,
    hourly_rate: 15.00,
    entry_type: 'administrative',
    notes: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      loadEmployees();
      loadTimeEntries();
    }
  }, [selectedPeriod]);

  const loadEmployees = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('payroll_employees')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('instructor_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadTimeEntries = async () => {
    if (!selectedPeriod) return;
    
    try {
      const { data, error } = await supabase
        .from('payroll_time_entries')
        .select(`
          *,
          payroll_employees(instructor_name)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('work_date', { ascending: false });

      if (error) throw error;
      
      const formattedEntries = data?.map(entry => ({
        id: entry.id,
        employee_id: entry.payroll_employee_id,
        instructor_name: entry.payroll_employees?.instructor_name || 'Unknown',
        work_date: entry.work_date,
        regular_hours: entry.total_hours, // Use total_hours from schema for now
        overtime_hours: 0, // Default overtime to 0 since schema only has total_hours
        hourly_rate: 15.00, // Default rate since not in current schema
        entry_type: entry.source || 'administrative', // Use source field
        notes: entry.source || 'Time entry' // Use source as notes for now
      })) || [];

      setTimeEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!selectedPeriod || !newEntry.employee_id) {
      toast({
        title: "Error",
        description: "Please select an instructor and ensure a period is selected",
        variant: "destructive",
      });
      return;
    }

    if (newEntry.regular_hours <= 0 && newEntry.overtime_hours <= 0) {
      toast({
        title: "Error",
        description: "Please enter hours worked",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payroll_time_entries')
        .insert({
          payroll_period_id: selectedPeriod.id,
          payroll_employee_id: newEntry.employee_id,
          work_date: newEntry.work_date,
          total_hours: newEntry.regular_hours + newEntry.overtime_hours, // Store total in total_hours field
          source: newEntry.entry_type // Store entry type in source field
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry added successfully",
      });

      setIsAddDialogOpen(false);
      loadTimeEntries();
      onDataUpdate();
      
      // Reset form
      setNewEntry({
        employee_id: '',
        work_date: '',
        regular_hours: 0,
        overtime_hours: 0,
        hourly_rate: 15.00,
        entry_type: 'administrative',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error adding time entry:', error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('payroll_time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry deleted",
      });

      loadTimeEntries();
      onDataUpdate();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  };

  const totalRegularHours = timeEntries.reduce((sum, entry) => sum + entry.regular_hours, 0);
  const totalOvertimeHours = timeEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0);
  const totalHours = totalRegularHours + totalOvertimeHours;
  const estimatedPay = timeEntries.reduce((sum, entry) => 
    sum + (entry.regular_hours * entry.hourly_rate) + (entry.overtime_hours * entry.hourly_rate * 1.5), 0
  );

  if (!selectedPeriod) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="font-semibold text-yellow-800 mb-2">No Pay Period Selected</h3>
          <p className="text-yellow-700">
            Please select a pay period first to enter time information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Entry</h2>
          <p className="text-muted-foreground">
            Record administrative and other hourly work during the pay period
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={employees.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select 
                  value={newEntry.employee_id} 
                  onValueChange={(value) => {
                    const employee = employees.find(emp => emp.id === value);
                    setNewEntry(prev => ({ 
                      ...prev, 
                      employee_id: value,
                      hourly_rate: employee?.regular_hourly_rate || 15.00
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.instructor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Date</Label>
                <Input
                  type="date"
                  value={newEntry.work_date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, work_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Entry Type</Label>
                <Select 
                  value={newEntry.entry_type} 
                  onValueChange={(value) => setNewEntry(prev => ({ ...prev, entry_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrative">Administrative Work</SelectItem>
                    <SelectItem value="setup">Studio Setup/Cleanup</SelectItem>
                    <SelectItem value="training">Training/Meeting</SelectItem>
                    <SelectItem value="maintenance">Equipment Maintenance</SelectItem>
                    <SelectItem value="sales">Sales/Customer Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regular Hours</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={newEntry.regular_hours}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, regular_hours: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overtime Hours</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={newEntry.overtime_hours}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, overtime_hours: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newEntry.hourly_rate}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this time entry"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Regular Pay:</span>
                    <span>${(newEntry.regular_hours * newEntry.hourly_rate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Pay (1.5x):</span>
                    <span>${(newEntry.overtime_hours * newEntry.hourly_rate * 1.5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total Pay:</span>
                    <span>${((newEntry.regular_hours * newEntry.hourly_rate) + (newEntry.overtime_hours * newEntry.hourly_rate * 1.5)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAddEntry} 
                disabled={loading || !newEntry.employee_id || !newEntry.work_date}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Time Entry'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular Hours</p>
                <p className="text-2xl font-bold">{totalRegularHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold text-orange-600">{totalOvertimeHours.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Pay</p>
                <p className="text-2xl font-bold text-green-600">${estimatedPay.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No instructors found</p>
              <p className="text-sm text-muted-foreground mt-1">Add instructors in the employee management section first</p>
            </div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No time entries recorded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first time entry to track hourly work</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{entry.instructor_name}</h4>
                        <Badge variant="outline">{entry.entry_type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.work_date).toLocaleDateString()}
                        • Regular: {entry.regular_hours}h
                        {entry.overtime_hours > 0 && ` • Overtime: ${entry.overtime_hours}h`}
                        • ${entry.hourly_rate}/hr
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          ${((entry.regular_hours * entry.hourly_rate) + (entry.overtime_hours * entry.hourly_rate * 1.5)).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(entry.regular_hours + entry.overtime_hours).toFixed(1)} total hours
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime Notice */}
      {totalOvertimeHours > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Overtime Hours Detected</h3>
                <p className="text-sm text-orange-700">
                  This period includes {totalOvertimeHours.toFixed(1)} overtime hours. 
                  California law requires overtime pay at 1.5x the regular rate for hours over 8 per day or 40 per week.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};