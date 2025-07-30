import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Plus, 
  Trash2, 
  Calculator,
  Clock,
  AlertTriangle,
  Save,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RetroPayManagerProps {
  mode: 'retro' | 'bonus';
}

interface Employee {
  id: string;
  name: string;
  department: string;
  currentSalary: number;
  ytdEarnings: number;
}

interface Adjustment {
  id: string;
  employeeId: string;
  type: 'bonus' | 'missed_hours' | 'correction' | 'overtime' | 'commission';
  amount: number;
  hours?: number;
  rate?: number;
  reason: string;
  effectiveDate: string;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'John Doe', department: 'Engineering', currentSalary: 85000, ytdEarnings: 32500 },
  { id: '2', name: 'Jane Smith', department: 'Sales', currentSalary: 75000, ytdEarnings: 28750 },
  { id: '3', name: 'Bob Johnson', department: 'Marketing', currentSalary: 68000, ytdEarnings: 26000 }
];

const adjustmentTypes = {
  retro: [
    { value: 'missed_hours', label: 'Missed Hours', requiresHours: true },
    { value: 'correction', label: 'Payroll Correction', requiresHours: false },
    { value: 'overtime', label: 'Overtime Adjustment', requiresHours: true },
    { value: 'commission', label: 'Commission Correction', requiresHours: false }
  ],
  bonus: [
    { value: 'bonus', label: 'Performance Bonus', requiresHours: false },
    { value: 'spot_bonus', label: 'Spot Bonus', requiresHours: false },
    { value: 'holiday_bonus', label: 'Holiday Bonus', requiresHours: false },
    { value: 'commission', label: 'Commission Bonus', requiresHours: false }
  ]
};

export const RetroPayManager: React.FC<RetroPayManagerProps> = ({ mode }) => {
  const { toast } = useToast();
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [payPeriodType, setPayPeriodType] = useState<'existing' | 'custom'>('existing');
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [processingType, setProcessingType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addEmployee = (employee: Employee) => {
    if (!selectedEmployees.find(emp => emp.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employeeId));
    setAdjustments(adjustments.filter(adj => adj.employeeId !== employeeId));
  };

  const addAdjustment = (employeeId: string) => {
    const newAdjustment: Adjustment = {
      id: Date.now().toString(),
      employeeId,
      type: mode === 'retro' ? 'missed_hours' : 'bonus',
      amount: 0,
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  const updateAdjustment = (adjustmentId: string, updates: Partial<Adjustment>) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === adjustmentId ? { ...adj, ...updates } : adj
    ));
  };

  const removeAdjustment = (adjustmentId: string) => {
    setAdjustments(adjustments.filter(adj => adj.id !== adjustmentId));
  };

  const calculateTotalAmount = () => {
    return adjustments.reduce((total, adj) => {
      if (adj.hours && adj.rate) {
        return total + (adj.hours * adj.rate);
      }
      return total + adj.amount;
    }, 0);
  };

  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one employee.",
        variant: "destructive"
      });
      return;
    }

    if (adjustments.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please add at least one adjustment.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${mode === 'retro' ? 'Retro Pay' : 'Bonus Pay'} Created`,
      description: `Off-cycle run scheduled for ${processingType === 'immediate' ? 'immediate' : scheduledDate} processing.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Create {mode === 'retro' ? 'Retro Pay' : 'Bonus Pay'} Run
          </h2>
          <p className="text-muted-foreground">
            {mode === 'retro' 
              ? 'Process corrections and missed payments'
              : 'Process bonuses and incentive payments'
            }
          </p>
        </div>
        <Badge variant="outline" className={mode === 'retro' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
          {mode === 'retro' ? 'Retro Pay Mode' : 'Bonus Pay Mode'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Employees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => addEmployee(employee)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pay Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pay Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing"
                  name="payPeriod"
                  checked={payPeriodType === 'existing'}
                  onChange={() => setPayPeriodType('existing')}
                />
                <Label htmlFor="existing">Existing Pay Period</Label>
              </div>
              
              {payPeriodType === 'existing' && (
                <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01-01">Jan 1-15, 2024</SelectItem>
                    <SelectItem value="2024-01-16">Jan 16-31, 2024</SelectItem>
                    <SelectItem value="2024-02-01">Feb 1-15, 2024</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom"
                  name="payPeriod"
                  checked={payPeriodType === 'custom'}
                  onChange={() => setPayPeriodType('custom')}
                />
                <Label htmlFor="custom">Custom Range</Label>
              </div>
              
              {payPeriodType === 'custom' && (
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Processing Schedule</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="immediate"
                    name="processing"
                    checked={processingType === 'immediate'}
                    onChange={() => setProcessingType('immediate')}
                  />
                  <Label htmlFor="immediate">Process Immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scheduled"
                    name="processing"
                    checked={processingType === 'scheduled'}
                    onChange={() => setProcessingType('scheduled')}
                  />
                  <Label htmlFor="scheduled">Schedule for Later</Label>
                </div>
                {processingType === 'scheduled' && (
                  <Input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selected Employees:</span>
                <span className="font-medium">{selectedEmployees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Adjustments:</span>
                <span className="font-medium">{adjustments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-medium text-green-600">
                  ${calculateTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Processing: {processingType === 'immediate' ? 'Immediate' : 'Scheduled'}</span>
              </div>
              {processingType === 'scheduled' && scheduledDate && (
                <div className="text-xs text-muted-foreground ml-6">
                  {new Date(scheduledDate).toLocaleString()}
                </div>
              )}
            </div>

            {adjustments.some(adj => !adj.reason || adj.amount === 0) && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Some adjustments need completion</span>
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full"
              disabled={selectedEmployees.length === 0 || adjustments.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Off-Cycle Run
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Selected Employees & Adjustments */}
      {selectedEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedEmployees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.department} • YTD: ${employee.ytdEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addAdjustment(employee.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Adjustment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeEmployee(employee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Employee's Adjustments */}
                  <div className="space-y-3">
                    {adjustments.filter(adj => adj.employeeId === employee.id).map((adjustment) => {
                      const adjustmentType = adjustmentTypes[mode].find(type => type.value === adjustment.type);
                      return (
                        <div key={adjustment.id} className="grid gap-3 md:grid-cols-5 p-3 bg-muted/50 rounded-lg">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={adjustment.type}
                              onValueChange={(value) => updateAdjustment(adjustment.id, { type: value as any })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {adjustmentTypes[mode].map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {adjustmentType?.requiresHours ? (
                            <>
                              <div>
                                <Label className="text-xs">Hours</Label>
                                <Input
                                  type="number"
                                  step="0.25"
                                  value={adjustment.hours || ''}
                                  onChange={(e) => updateAdjustment(adjustment.id, { hours: parseFloat(e.target.value) || 0 })}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Rate</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={adjustment.rate || ''}
                                  onChange={(e) => updateAdjustment(adjustment.id, { rate: parseFloat(e.target.value) || 0 })}
                                  className="h-8"
                                />
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label className="text-xs">Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={adjustment.amount || ''}
                                onChange={(e) => updateAdjustment(adjustment.id, { amount: parseFloat(e.target.value) || 0 })}
                                className="h-8"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-xs">Effective Date</Label>
                            <Input
                              type="date"
                              value={adjustment.effectiveDate}
                              onChange={(e) => updateAdjustment(adjustment.id, { effectiveDate: e.target.value })}
                              className="h-8"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeAdjustment(adjustment.id)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="md:col-span-5">
                            <Label className="text-xs">Reason</Label>
                            <Textarea
                              value={adjustment.reason}
                              onChange={(e) => updateAdjustment(adjustment.id, { reason: e.target.value })}
                              placeholder="Provide detailed reason for this adjustment..."
                              rows={2}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {adjustments.filter(adj => adj.employeeId === employee.id).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No adjustments added</p>
                        <p className="text-xs">Click "Add Adjustment" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};