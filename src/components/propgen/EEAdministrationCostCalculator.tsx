import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface HardCosts {
  payroll_software: number;
  hris_software: number;
  time_attendance_software: number;
  employee_handbook: number;
  training_platform: number;
  hr_consulting: number;
  employment_attorney: number;
  fines_settlements: number;
}

interface SoftCosts {
  weekly_hr_hours: number;
  weekly_admin_hours: number;
  hourly_wage: number;
  risk_level: 'low' | 'moderate' | 'high';
}

interface CalculationResults {
  total_hard_costs: number;
  total_soft_costs: number;
  risk_adjustment: number;
  calculated_ee_admin_cost: number;
}

interface EEAdministrationCostCalculatorProps {
  onCalculationChange: (results: CalculationResults & { breakdown: HardCosts & SoftCosts }) => void;
  initialData?: Partial<HardCosts & SoftCosts>;
}

const RISK_MULTIPLIERS = {
  low: 0,
  moderate: 2500,
  high: 5000,
};

const RISK_DESCRIPTIONS = {
  low: "No known compliance issues, good HR documentation and training",
  moderate: "Some gaps in HR processes, occasional compliance concerns",
  high: "Known compliance issues, no formal HR support, significant risk exposure"
};

export const EEAdministrationCostCalculator: React.FC<EEAdministrationCostCalculatorProps> = ({
  onCalculationChange,
  initialData = {}
}) => {
  const [hardCosts, setHardCosts] = useState<HardCosts>({
    payroll_software: initialData.payroll_software || 0,
    hris_software: initialData.hris_software || 0,
    time_attendance_software: initialData.time_attendance_software || 0,
    employee_handbook: initialData.employee_handbook || 0,
    training_platform: initialData.training_platform || 0,
    hr_consulting: initialData.hr_consulting || 0,
    employment_attorney: initialData.employment_attorney || 0,
    fines_settlements: initialData.fines_settlements || 0,
  });

  const [softCosts, setSoftCosts] = useState<SoftCosts>({
    weekly_hr_hours: initialData.weekly_hr_hours || 0,
    weekly_admin_hours: initialData.weekly_admin_hours || 0,
    hourly_wage: initialData.hourly_wage || 25,
    risk_level: (initialData.risk_level as 'low' | 'moderate' | 'high') || 'low',
  });

  const calculateResults = (): CalculationResults => {
    const total_hard_costs = Object.values(hardCosts).reduce((sum, cost) => sum + cost, 0);
    
    const total_weekly_hours = softCosts.weekly_hr_hours + softCosts.weekly_admin_hours;
    const total_soft_costs = total_weekly_hours * softCosts.hourly_wage * 52; // 52 weeks
    
    const risk_adjustment = RISK_MULTIPLIERS[softCosts.risk_level];
    
    const calculated_ee_admin_cost = total_hard_costs + total_soft_costs + risk_adjustment;

    return {
      total_hard_costs,
      total_soft_costs,
      risk_adjustment,
      calculated_ee_admin_cost,
    };
  };

  useEffect(() => {
    const results = calculateResults();
    onCalculationChange({
      ...results,
      breakdown: { ...hardCosts, ...softCosts }
    });
  }, [hardCosts, softCosts]);

  const handleHardCostChange = (field: keyof HardCosts, value: number) => {
    setHardCosts(prev => ({ ...prev, [field]: value }));
  };

  const handleSoftCostChange = (field: keyof SoftCosts, value: number | string) => {
    setSoftCosts(prev => ({ ...prev, [field]: value }));
  };

  const results = calculateResults();


  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Introduction Section */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Employee Administration Cost Calculation</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            This calculation determines the total cost of employee administration that your company currently manages internally.
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-foreground">Hard Costs</div>
              <p className="text-sm text-muted-foreground">Direct, measurable expenses for HR software, services, and compliance requirements.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-foreground">Soft Costs</div>
              <p className="text-sm text-muted-foreground">Hidden costs from time spent on HR tasks by internal staff, calculated using actual hours and wages.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-foreground">Risk Adjustment</div>
              <p className="text-sm text-muted-foreground">Additional cost factor based on your company's compliance risk exposure level.</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">
              Complete the fields below to calculate your current EE Administration Cost. All fields are optional - enter only the costs that apply to your organization.
            </p>
          </div>
        </div>
      </div>

      {/* Hard Costs Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Hard Costs (Annual)</h3>
          </div>
          <p className="text-muted-foreground">
            Direct, measurable costs for HR software, services, and compliance
          </p>
        </div>
        <div className="bg-card rounded-lg p-8 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="payroll_software" className="text-sm font-medium">Payroll Software</Label>
              <Input
                id="payroll_software"
                type="text"
                value={hardCosts.payroll_software || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('payroll_software', parseFloat(value) || 0);
                }}
                placeholder="$3,600"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hris_software" className="text-sm font-medium">HRIS Software</Label>
              <Input
                id="hris_software"
                type="text"
                value={hardCosts.hris_software || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('hris_software', parseFloat(value) || 0);
                }}
                placeholder="$2,400"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_attendance_software" className="text-sm font-medium">Time & Attendance Software</Label>
              <Input
                id="time_attendance_software"
                type="text"
                value={hardCosts.time_attendance_software || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('time_attendance_software', parseFloat(value) || 0);
                }}
                placeholder="$1,800"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_handbook" className="text-sm font-medium">Employee Handbook/Legal Policy Updates</Label>
              <Input
                id="employee_handbook"
                type="text"
                value={hardCosts.employee_handbook || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('employee_handbook', parseFloat(value) || 0);
                }}
                placeholder="$1,200"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_platform" className="text-sm font-medium">Training Platform</Label>
              <Input
                id="training_platform"
                type="text"
                value={hardCosts.training_platform || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('training_platform', parseFloat(value) || 0);
                }}
                placeholder="$2,000"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hr_consulting" className="text-sm font-medium">HR/Payroll/Legal Consulting Retainers</Label>
              <Input
                id="hr_consulting"
                type="text"
                value={hardCosts.hr_consulting || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('hr_consulting', parseFloat(value) || 0);
                }}
                placeholder="$6,000"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_attorney" className="text-sm font-medium">Employment Attorney Usage</Label>
              <Input
                id="employment_attorney"
                type="text"
                value={hardCosts.employment_attorney || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('employment_attorney', parseFloat(value) || 0);
                }}
                placeholder="$3,000"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fines_settlements" className="text-sm font-medium">Fines/Settlements (Optional)</Label>
              <Input
                id="fines_settlements"
                type="text"
                value={hardCosts.fines_settlements || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleHardCostChange('fines_settlements', parseFloat(value) || 0);
                }}
                placeholder="$0"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Soft Costs Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Soft Costs (Time-Based)</h3>
          </div>
          <p className="text-muted-foreground">
            Hidden costs from time spent on HR tasks by internal staff
          </p>
        </div>
        <div className="bg-card rounded-lg p-8 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weekly_hr_hours" className="text-sm font-medium">HR Tasks (hours/week)</Label>
              <Input
                id="weekly_hr_hours"
                type="number"
                step="0.5"
                min="0"
                max="99"
                value={softCosts.weekly_hr_hours || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const clampedValue = Math.min(Math.max(value, 0), 99);
                  handleSoftCostChange('weekly_hr_hours', clampedValue);
                }}
                placeholder="8"
                className="h-10 w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly_admin_hours" className="text-sm font-medium">Payroll/Admin Tasks (hours/week)</Label>
              <Input
                id="weekly_admin_hours"
                type="number"
                step="0.5"
                min="0"
                max="99"
                value={softCosts.weekly_admin_hours || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const clampedValue = Math.min(Math.max(value, 0), 99);
                  handleSoftCostChange('weekly_admin_hours', clampedValue);
                }}
                placeholder="6"
                className="h-10 w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_wage" className="text-sm font-medium">Average Hourly Wage</Label>
              <Input
                id="hourly_wage"
                type="text"
                value={softCosts.hourly_wage ? `$${softCosts.hourly_wage.toFixed(2)}` : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.-]/g, '');
                  handleSoftCostChange('hourly_wage', parseFloat(value) || 25);
                }}
                placeholder="$25.00"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_level" className="text-sm font-medium">Risk Exposure Level</Label>
              <Select
                value={softCosts.risk_level}
                onValueChange={(value: 'low' | 'moderate' | 'high') => handleSoftCostChange('risk_level', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk (+$0)</SelectItem>
                  <SelectItem value="moderate">Moderate Risk (+$2,500)</SelectItem>
                  <SelectItem value="high">High Risk (+$5,000)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {RISK_DESCRIPTIONS[softCosts.risk_level]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">EE Administration Cost Summary</h3>
          </div>
        </div>
        <div className="bg-primary/5 rounded-lg p-8 border border-primary/20">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Hard Costs:</span>
              <span className="text-lg font-bold">{formatCurrency(results.total_hard_costs)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Soft Costs:</span>
              <span className="text-lg font-bold">{formatCurrency(results.total_soft_costs)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Risk Adjustment:</span>
              <span className="text-lg font-bold">{formatCurrency(results.risk_adjustment)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Total EE Administration Cost:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(results.calculated_ee_admin_cost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};