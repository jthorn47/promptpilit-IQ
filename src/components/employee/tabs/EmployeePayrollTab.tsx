import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Minus, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeePayrollTabProps {
  employee: Employee;
  onChange: () => void;
}

export const EmployeePayrollTab = ({ employee, onChange }: EmployeePayrollTabProps) => {
  const [payrollDetails, setPayrollDetails] = useState<any>(null);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [timeAttendance, setTimeAttendance] = useState<any>(null);

  useEffect(() => {
    fetchPayrollData();
  }, [employee.id]);

  const fetchPayrollData = async () => {
    try {
      // Fetch payroll details
      const { data: payrollData } = await supabase
        .from('employee_payroll_details')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('is_active', true)
        .single();

      // Fetch deductions
      const { data: deductionsData } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('is_active', true);

      // Fetch time attendance settings
      const { data: timeData } = await supabase
        .from('employee_time_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .single();

      setPayrollDetails(payrollData);
      setDeductions(deductionsData || []);
      setTimeAttendance(timeData);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    }
  };

  const addDeduction = () => {
    setDeductions([...deductions, {
      deduction_type: '',
      deduction_name: '',
      amount: 0,
      is_pre_tax: false
    }]);
    onChange();
  };

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Payroll Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pay Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payRate">Pay Rate</Label>
              <Input 
                id="payRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={payrollDetails?.pay_rate || ''}
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payFrequency">Pay Frequency</Label>
              <Select defaultValue={payrollDetails?.pay_frequency || 'bi_weekly'} onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                  <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="overtimeEligible">Overtime Eligible</Label>
              <Switch 
                id="overtimeEligible"
                defaultChecked={payrollDetails?.overtime_eligible || false}
                onCheckedChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
              <Input 
                id="overtimeRate"
                type="number"
                step="0.1"
                placeholder="1.5"
                defaultValue={payrollDetails?.overtime_rate || '1.5'}
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standardHours">Standard Hours/Week</Label>
              <Input 
                id="standardHours"
                type="number"
                placeholder="40"
                defaultValue={payrollDetails?.standard_hours_per_week || '40'}
                onChange={onChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time & Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="timeTracking">Time Tracking Enabled</Label>
              <Switch 
                id="timeTracking"
                defaultChecked={timeAttendance?.time_tracking_enabled || true}
                onCheckedChange={onChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="breakTracking">Break Tracking</Label>
              <Switch 
                id="breakTracking"
                defaultChecked={timeAttendance?.break_tracking_enabled || true}
                onCheckedChange={onChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="locationTracking">Location Tracking</Label>
              <Switch 
                id="locationTracking"
                defaultChecked={timeAttendance?.location_tracking_enabled || false}
                onCheckedChange={onChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="overtimeApproval">Overtime Approval Required</Label>
              <Switch 
                id="overtimeApproval"
                defaultChecked={timeAttendance?.overtime_approval_required || true}
                onCheckedChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ptoAccrual">PTO Accrual Rate (hours/pay period)</Label>
              <Input 
                id="ptoAccrual"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={timeAttendance?.pto_accrual_rate || '0'}
                onChange={onChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ptoBalance">PTO Balance</Label>
                <Input 
                  id="ptoBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={timeAttendance?.pto_balance || '0'}
                  onChange={onChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sickBalance">Sick Leave Balance</Label>
                <Input 
                  id="sickBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={timeAttendance?.sick_leave_balance || '0'}
                  onChange={onChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deductions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Minus className="h-5 w-5" />
              Deductions & Benefits
            </span>
            <Button variant="outline" size="sm" onClick={addDeduction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deduction
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deductions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No deductions configured. Click "Add Deduction" to get started.
            </p>
          ) : (
            deductions.map((deduction, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Deduction {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeDeduction(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Deduction Type</Label>
                    <Select defaultValue={deduction.deduction_type} onValueChange={onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health_insurance">Health Insurance</SelectItem>
                        <SelectItem value="dental_insurance">Dental Insurance</SelectItem>
                        <SelectItem value="vision_insurance">Vision Insurance</SelectItem>
                        <SelectItem value="401k">401(k) Contribution</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deduction Name</Label>
                    <Input 
                      placeholder="Enter deduction name"
                      defaultValue={deduction.deduction_name}
                      onChange={onChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={deduction.amount}
                      onChange={onChange}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`pretax-${index}`}
                      defaultChecked={deduction.is_pre_tax}
                      onCheckedChange={onChange}
                    />
                    <Label htmlFor={`pretax-${index}`}>Pre-tax deduction</Label>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};