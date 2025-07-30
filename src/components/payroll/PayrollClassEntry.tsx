import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  FileText, 
  AlertCircle, 
  DollarSign,
  Calendar,
  Clock,
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
  standard_class_rate: number;
  saturday_class_rate: number;
}

interface PayrollClass {
  id: string;
  class_date: string;
  class_time: string;
  class_type: string;
  class_rate: number;
  is_split: boolean;
  split_percentage: number;
  actual_pay: number;
  is_saturday: boolean;
  notes: string;
  payroll_employee_id: string;
  instructor_name: string;
}

interface PayrollClassEntryProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

export const PayrollClassEntry: React.FC<PayrollClassEntryProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [classes, setClasses] = useState<PayrollClass[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<PayrollClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payroll_employee_id: '',
    class_date: '',
    class_time: '',
    class_type: '',
    is_split: false,
    split_percentage: 100,
    notes: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      fetchClasses();
      fetchEmployees();
    }
  }, [selectedPeriod]);

  const fetchClasses = async () => {
    if (!selectedPeriod) return;

    try {
      const { data, error } = await supabase
        .from('payroll_classes')
        .select(`
          *,
          payroll_employees!inner(instructor_name)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('class_date', { ascending: true });

      if (error) throw error;

      const formattedClasses = data?.map(cls => ({
        ...cls,
        instructor_name: cls.payroll_employees.instructor_name
      })) || [];

      setClasses(formattedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
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

  const calculateClassPay = (employeeId: string, classDate: string, isSplit: boolean, splitPercentage: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 0;

    const date = new Date(classDate);
    const isSaturday = date.getDay() === 6;
    
    const baseRate = isSaturday ? employee.saturday_class_rate : employee.standard_class_rate;
    const actualPay = baseRate * (splitPercentage / 100);
    
    return actualPay;
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
      const classDate = new Date(formData.class_date);
      const isSaturday = classDate.getDay() === 6;
      
      const employee = employees.find(emp => emp.id === formData.payroll_employee_id);
      const classRate = isSaturday ? employee?.saturday_class_rate || 45 : employee?.standard_class_rate || 45;
      const actualPay = calculateClassPay(
        formData.payroll_employee_id, 
        formData.class_date, 
        formData.is_split, 
        formData.split_percentage
      );

      const classData = {
        payroll_period_id: selectedPeriod.id,
        payroll_employee_id: formData.payroll_employee_id,
        class_date: formData.class_date,
        class_time: formData.class_time,
        class_type: formData.class_type,
        class_rate: classRate,
        is_split: formData.is_split,
        split_percentage: formData.split_percentage,
        actual_pay: actualPay,
        is_saturday: isSaturday,
        notes: formData.notes,
        created_by: user?.id
      };

      if (editingClass) {
        const { error } = await supabase
          .from('payroll_classes')
          .update(classData)
          .eq('id', editingClass.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('payroll_classes')
          .insert([classData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Class added successfully",
        });
      }

      setShowCreateDialog(false);
      setEditingClass(null);
      resetForm();
      fetchClasses();
      onDataUpdate();
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "Error",
        description: "Failed to save class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls: PayrollClass) => {
    setEditingClass(cls);
    setFormData({
      payroll_employee_id: cls.payroll_employee_id,
      class_date: cls.class_date,
      class_time: cls.class_time,
      class_type: cls.class_type,
      is_split: cls.is_split,
      split_percentage: cls.split_percentage,
      notes: cls.notes || ''
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const { error } = await supabase
        .from('payroll_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      fetchClasses();
      onDataUpdate();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      payroll_employee_id: '',
      class_date: '',
      class_time: '',
      class_type: '',
      is_split: false,
      split_percentage: 100,
      notes: ''
    });
  };

  const handleBulkImport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "CSV import functionality will be available soon",
    });
  };

  if (!selectedPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pay Period Selected</h3>
          <p className="text-muted-foreground">Please select a pay period to enter class data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Entry</h2>
          <p className="text-muted-foreground">
            Period: {new Date(selectedPeriod.start_date).toLocaleDateString()} - {new Date(selectedPeriod.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingClass(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Edit Class' : 'Add New Class'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class_date">Class Date</Label>
                    <Input
                      id="class_date"
                      type="date"
                      value={formData.class_date}
                      onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                      min={selectedPeriod.start_date}
                      max={selectedPeriod.end_date}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_time">Class Time</Label>
                    <Input
                      id="class_time"
                      type="time"
                      value={formData.class_time}
                      onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="class_type">Class Type</Label>
                  <Select 
                    value={formData.class_type} 
                    onValueChange={(value) => setFormData({ ...formData, class_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F45">F45 Class</SelectItem>
                      <SelectItem value="Flex">Flex Class (No Pay)</SelectItem>
                      <SelectItem value="Private">Private Training</SelectItem>
                      <SelectItem value="Special">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_split"
                    checked={formData.is_split}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_split: checked as boolean })}
                  />
                  <Label htmlFor="is_split">Split Class</Label>
                </div>

                {formData.is_split && (
                  <div>
                    <Label htmlFor="split_percentage">Split Percentage</Label>
                    <Input
                      id="split_percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.split_percentage}
                      onChange={(e) => setFormData({ ...formData, split_percentage: parseInt(e.target.value) || 100 })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Percentage of class rate this instructor receives
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this class..."
                  />
                </div>

                {formData.payroll_employee_id && formData.class_date && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Calculated Pay:</p>
                    <p className="text-lg font-bold text-green-600">
                      ${calculateClassPay(formData.payroll_employee_id, formData.class_date, formData.is_split, formData.split_percentage).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(formData.class_date).getDay() === 6 ? 'Saturday rate applied' : 'Standard rate applied'}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingClass ? 'Update' : 'Add Class')}
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
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saturday Classes</p>
                <p className="text-2xl font-bold">{classes.filter(cls => cls.is_saturday).length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Class Pay</p>
                <p className="text-2xl font-bold text-green-600">
                  ${classes.reduce((sum, cls) => sum + cls.actual_pay, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classes for Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes entered for this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Instructor</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Rate</th>
                      <th className="text-left p-2">Pay</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {new Date(cls.class_date).toLocaleDateString()}
                            {cls.is_saturday && <Badge variant="secondary">Saturday</Badge>}
                          </div>
                        </td>
                        <td className="p-2">{cls.class_time}</td>
                        <td className="p-2">{cls.instructor_name}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {cls.class_type}
                            {cls.is_split && <Badge variant="outline">Split {cls.split_percentage}%</Badge>}
                          </div>
                        </td>
                        <td className="p-2">${cls.class_rate.toFixed(2)}</td>
                        <td className="p-2 font-semibold text-green-600">${cls.actual_pay.toFixed(2)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(cls)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cls.id)}
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
    </div>
  );
};