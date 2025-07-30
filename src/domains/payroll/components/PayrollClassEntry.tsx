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
  CalendarDays, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2,
  AlertCircle 
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

interface PayrollClassEntryProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

interface PayrollEmployee {
  id: string;
  instructor_name: string;
  regular_hourly_rate: number;
  is_active: boolean;
}

interface PayrollClass {
  id: string;
  employee_id: string;
  instructor_name: string;
  class_date: string;
  class_time: string;
  class_type: string;
  duration_minutes: number;
  rate: number;
  actual_pay: number;
  notes?: string;
}

export const PayrollClassEntry: React.FC<PayrollClassEntryProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [classes, setClasses] = useState<PayrollClass[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newClass, setNewClass] = useState({
    employee_id: '',
    class_date: '',
    class_time: '06:00',
    class_type: 'F45 Training',
    duration_minutes: 45,
    rate: 25.00,
    notes: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      loadEmployees();
      loadClasses();
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

  const loadClasses = async () => {
    if (!selectedPeriod) return;
    
    try {
      const { data, error } = await supabase
        .from('payroll_classes')
        .select(`
          *,
          payroll_employees(instructor_name)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('class_date', { ascending: false });

      if (error) throw error;
      
      const formattedClasses = data?.map(cls => ({
        id: cls.id,
        employee_id: cls.payroll_employee_id,
        instructor_name: cls.payroll_employees?.instructor_name || 'Unknown',
        class_date: cls.class_date,
        class_time: cls.class_time,
        class_type: cls.class_type,
        duration_minutes: 45, // Default value since schema uses minutes_taught
        rate: cls.class_rate, // Use class_rate from schema
        actual_pay: cls.actual_pay,
        notes: cls.notes
      })) || [];

      setClasses(formattedClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleAddClass = async () => {
    if (!selectedPeriod || !newClass.employee_id) {
      toast({
        title: "Error",
        description: "Please select an instructor and ensure a period is selected",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate actual pay based on rate and duration
      const actualPay = (newClass.duration_minutes / 60) * newClass.rate;

      const { error } = await supabase
        .from('payroll_classes')
        .insert({
          payroll_period_id: selectedPeriod.id,
          payroll_employee_id: newClass.employee_id,
          class_date: newClass.class_date,
          class_time: newClass.class_time,
          class_type: newClass.class_type,
          minutes_taught: newClass.duration_minutes, // Use minutes_taught field
          class_rate: newClass.rate, // Use class_rate field
          actual_pay: actualPay,
          notes: newClass.notes
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class entry added successfully",
      });

      setIsAddDialogOpen(false);
      loadClasses();
      onDataUpdate();
      
      // Reset form
      setNewClass({
        employee_id: '',
        class_date: '',
        class_time: '06:00',
        class_type: 'F45 Training',
        duration_minutes: 45,
        rate: 25.00,
        notes: ''
      });
      
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        title: "Error",
        description: "Failed to add class entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('payroll_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class entry deleted",
      });

      loadClasses();
      onDataUpdate();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Failed to delete class entry",
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const totalClasses = classes.length;
  const totalPay = classes.reduce((sum, cls) => sum + cls.actual_pay, 0);

  if (!selectedPeriod) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="font-semibold text-yellow-800 mb-2">No Pay Period Selected</h3>
          <p className="text-yellow-700">
            Please select a pay period first to enter class information.
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
          <h2 className="text-2xl font-bold">Class Entry</h2>
          <p className="text-muted-foreground">
            Record F45 classes taught during the pay period
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={employees.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Class Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select 
                  value={newClass.employee_id} 
                  onValueChange={(value) => setNewClass(prev => ({ ...prev, employee_id: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class Date</Label>
                  <Input
                    type="date"
                    value={newClass.class_date}
                    onChange={(e) => setNewClass(prev => ({ ...prev, class_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Class Time</Label>
                  <Input
                    type="time"
                    value={newClass.class_time}
                    onChange={(e) => setNewClass(prev => ({ ...prev, class_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Class Type</Label>
                <Select 
                  value={newClass.class_type} 
                  onValueChange={(value) => setNewClass(prev => ({ ...prev, class_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F45 Training">F45 Training</SelectItem>
                    <SelectItem value="Personal Training">Personal Training</SelectItem>
                    <SelectItem value="Specialty Class">Specialty Class</SelectItem>
                    <SelectItem value="Team Training">Team Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newClass.duration_minutes}
                    onChange={(e) => setNewClass(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rate per Hour ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newClass.rate}
                    onChange={(e) => setNewClass(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={newClass.notes}
                  onChange={(e) => setNewClass(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this class"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Calculated Pay:</span>
                  <span className="font-semibold">
                    ${((newClass.duration_minutes / 60) * newClass.rate).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleAddClass} 
                disabled={loading || !newClass.employee_id || !newClass.class_date}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Class'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{totalClasses}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {(classes.reduce((sum, cls) => sum + cls.duration_minutes, 0) / 60).toFixed(1)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Class Pay</p>
                <p className="text-2xl font-bold text-green-600">${totalPay.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Class Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No instructors found</p>
              <p className="text-sm text-muted-foreground mt-1">Add instructors in the employee management section first</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No classes entered yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first class entry to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cls.instructor_name}</h4>
                        <Badge variant="outline">{cls.class_type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(cls.class_date).toLocaleDateString()} at {formatTime(cls.class_time)}
                        • {cls.duration_minutes} minutes
                      </div>
                      {cls.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{cls.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">${cls.actual_pay.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${cls.rate}/hr</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClass(cls.id)}
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
    </div>
  );
};