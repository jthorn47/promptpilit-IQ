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
  Edit, 
  Trash2, 
  Upload, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users
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
}

interface PayrollEmployee {
  id: string;
  instructor_name: string;
  regular_hourly_rate: number;
}

interface PayrollTimeEntry {
  id: string;
  work_date: string;
  total_hours: number;
  source: string;
  payroll_employee_id: string;
  instructor_name: string;
}

interface PayrollTimeEntryProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

export const PayrollTimeEntry: React.FC<PayrollTimeEntryProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [timeEntries, setTimeEntries] = useState<PayrollTimeEntry[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PayrollTimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payroll_employee_id: '',
    work_date: '',
    total_hours: 0,
    source: 'manual'
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      fetchTimeEntries();
      fetchEmployees();
    }
  }, [selectedPeriod]);

  const fetchTimeEntries = async () => {
    if (!selectedPeriod) return;

    try {
      const { data, error } = await supabase
        .from('payroll_time_entries')
        .select(`
          *,
          payroll_employees!inner(instructor_name)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('work_date', { ascending: true });

      if (error) throw error;

      const formattedEntries = data?.map(entry => ({
        ...entry,
        instructor_name: entry.payroll_employees.instructor_name
      })) || [];

      setTimeEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
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
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriod || !formData.payroll_employee_id) {
      toast({
        title: "Error",
        description: "Please select an instructor and period",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        payroll_period_id: selectedPeriod.id,
        payroll_employee_id: formData.payroll_employee_id,
        work_date: formData.work_date,
        total_hours: formData.total_hours,
        source: formData.source,
        created_by: user?.id
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('payroll_time_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Time entry updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('payroll_time_entries')
          .insert([entryData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Time entry added successfully",
        });
      }

      setShowCreateDialog(false);
      setEditingEntry(null);
      resetForm();
      fetchTimeEntries();
      onDataUpdate();
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Error",
        description: "Failed to save time entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: PayrollTimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      payroll_employee_id: entry.payroll_employee_id,
      work_date: entry.work_date,
      total_hours: entry.total_hours,
      source: entry.source
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      const { error } = await supabase
        .from('payroll_time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
      
      fetchTimeEntries();
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

  const resetForm = () => {
    setFormData({
      payroll_employee_id: '',
      work_date: '',
      total_hours: 0,
      source: 'manual'
    });
  };

  const handleBulkImport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "PRISM integration and CSV import functionality will be available soon",
    });
  };

  const calculateTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.total_hours, 0);
  };

  const calculateOvertimeHours = () => {
    const employeeHours = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.payroll_employee_id]) {
        acc[entry.payroll_employee_id] = 0;
      }
      acc[entry.payroll_employee_id] += entry.total_hours;
      return acc;
    }, {} as Record<string, number>);

    return Object.values(employeeHours).reduce((sum, hours) => {
      return sum + Math.max(0, hours - 40); // Overtime after 40 hours
    }, 0);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'prism': return 'bg-green-100 text-green-800';
      case 'import': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pay Period Selected</h3>
          <p className="text-muted-foreground">Please select a pay period to enter time data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Entry</h2>
          <p className="text-muted-foreground">
            Period: {new Date(selectedPeriod.start_date).toLocaleDateString()} - {new Date(selectedPeriod.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import PRISM
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingEntry(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Time Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Time Entry' : 'Add New Time Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select 
                    value={formData.payroll_employee_id} 
                    onValueChange={(value) => setFormData({ ...formData, payroll_employee_id: value })}
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

                <div>
                  <Label htmlFor="work_date">Work Date</Label>
                  <Input
                    id="work_date"
                    type="date"
                    value={formData.work_date}
                    onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                    min={selectedPeriod.start_date}
                    max={selectedPeriod.end_date}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="total_hours">Total Hours</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter hours in decimal format (e.g., 7.5 for 7 hours 30 minutes)
                  </p>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select 
                    value={formData.source} 
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="prism">PRISM System</SelectItem>
                      <SelectItem value="import">CSV Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingEntry ? 'Update' : 'Add Entry')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{calculateTotalHours().toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-orange-600">{calculateOvertimeHours().toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{new Set(timeEntries.map(e => e.payroll_employee_id)).size}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* California Overtime Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">California Overtime Rules</h3>
              <p className="text-sm text-yellow-700">
                Overtime is calculated for hours over 8 per day OR 40 per week, whichever is greater. 
                Hours over 12 per day are paid at double time (2x).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries for Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No time entries for this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Instructor</th>
                      <th className="text-left p-2">Hours</th>
                      <th className="text-left p-2">Source</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="p-2">{new Date(entry.work_date).toLocaleDateString()}</td>
                        <td className="p-2">{entry.instructor_name}</td>
                        <td className="p-2">
                          <span className={`font-semibold ${entry.total_hours > 8 ? 'text-orange-600' : 'text-foreground'}`}>
                            {entry.total_hours.toFixed(2)}
                          </span>
                          {entry.total_hours > 8 && (
                            <Badge variant="secondary" className="ml-2">OT</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge className={getSourceColor(entry.source)}>
                            {entry.source.charAt(0).toUpperCase() + entry.source.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Hour Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(
              timeEntries.reduce((acc, entry) => {
                if (!acc[entry.payroll_employee_id]) {
                  acc[entry.payroll_employee_id] = {
                    name: entry.instructor_name,
                    totalHours: 0,
                    overtimeHours: 0
                  };
                }
                acc[entry.payroll_employee_id].totalHours += entry.total_hours;
                acc[entry.payroll_employee_id].overtimeHours += Math.max(0, entry.total_hours - 8);
                return acc;
              }, {} as Record<string, { name: string; totalHours: number; overtimeHours: number }>)
            ).map(([employeeId, summary]) => (
              <div key={employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{summary.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {summary.totalHours.toFixed(2)} total hours
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{summary.totalHours.toFixed(2)}h</p>
                  {summary.overtimeHours > 0 && (
                    <p className="text-sm text-orange-600">
                      {summary.overtimeHours.toFixed(2)}h overtime
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};