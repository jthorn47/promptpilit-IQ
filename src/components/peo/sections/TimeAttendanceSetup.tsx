import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleSelectField } from '@/components/AccessibleForm';
import { Clock, Smartphone, Globe, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeAttendanceSetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const TimeAttendanceSetup: React.FC<TimeAttendanceSetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    collection_method: '',
    overtime_daily: 8,
    overtime_weekly: 40,
    break_rules: {
      lunch_break: 30,
      paid_breaks: 15,
      auto_deduct_lunch: true
    },
    rounding_rules: {
      enabled: true,
      interval: 15, // minutes
      rule: 'nearest' // 'up', 'down', 'nearest'
    },
    pto_accrual: {
      vacation_rate: 0.0385, // hours per hour worked
      sick_rate: 0.0385,
      max_vacation: 160,
      max_sick: 80
    },
    approvers: []
  });
  const [testCompleted, setTestCompleted] = useState(false);

  const collectionMethods = [
    { value: 'web', label: 'Web Time Clock', description: 'Browser-based time tracking' },
    { value: 'mobile', label: 'Mobile App', description: 'iOS and Android app' },
    { value: 'swipe_clock', label: 'SwipeClock Terminal', description: 'Physical time clock device' },
    { value: 'biometric', label: 'Biometric Scanner', description: 'Fingerprint or facial recognition' },
    { value: 'manual', label: 'Manual Entry', description: 'Supervisor enters time manually' }
  ];

  const roundingOptions = [
    { value: 'up', label: 'Round Up' },
    { value: 'down', label: 'Round Down' },
    { value: 'nearest', label: 'Round to Nearest' }
  ];

  const intervalOptions = [
    { value: '5', label: '5 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' }
  ];

  const calculateProgress = () => {
    let progress = 0;
    
    // Collection method selected: 30%
    if (config.collection_method) progress += 30;
    
    // Overtime rules configured: 20%
    if (config.overtime_daily && config.overtime_weekly) progress += 20;
    
    // PTO rules configured: 30%
    if (config.pto_accrual.vacation_rate && config.pto_accrual.sick_rate) progress += 30;
    
    // Test completed: 20%
    if (testCompleted) progress += 20;
    
    return progress;
  };

  const runTimesheetTest = () => {
    toast({
      title: "Starting Test",
      description: "Running timesheet flow test..."
    });

    // Simulate test process
    setTimeout(() => {
      setTestCompleted(true);
      onProgressUpdate(calculateProgress());
      
      toast({
        title: "Test Completed",
        description: "Timesheet flow test completed successfully."
      });
    }, 3000);
  };

  const renderCollectionMethodCard = (method: any) => (
    <Card 
      key={method.value} 
      className={`cursor-pointer transition-all ${
        config.collection_method === method.value 
          ? 'border-primary bg-primary/5' 
          : 'hover:border-primary/50'
      }`}
      onClick={() => {
        setConfig({ ...config, collection_method: method.value });
        onProgressUpdate(calculateProgress());
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {method.value === 'web' && <Globe className="h-5 w-5 text-primary" />}
            {method.value === 'mobile' && <Smartphone className="h-5 w-5 text-primary" />}
            {method.value === 'swipe_clock' && <Clock className="h-5 w-5 text-primary" />}
            {method.value === 'biometric' && <Settings className="h-5 w-5 text-primary" />}
            {method.value === 'manual' && <Settings className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{method.label}</h4>
            <p className="text-sm text-muted-foreground">{method.description}</p>
          </div>
          {config.collection_method === method.value && (
            <CheckCircle className="h-5 w-5 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Time Collection Method */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Time Collection Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collectionMethods.map(renderCollectionMethodCard)}
          </div>
        </CardContent>
      </Card>

      {/* Overtime Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Daily Overtime Threshold"
              name="overtime_daily"
              type="number"
              value={config.overtime_daily.toString()}
              onChange={(value) => {
                setConfig({ ...config, overtime_daily: parseInt(value) || 8 });
                onProgressUpdate(calculateProgress());
              }}
              description="Hours before daily overtime kicks in"
            />
            
            <AccessibleFormField
              label="Weekly Overtime Threshold"
              name="overtime_weekly"
              type="number"
              value={config.overtime_weekly.toString()}
              onChange={(value) => {
                setConfig({ ...config, overtime_weekly: parseInt(value) || 40 });
                onProgressUpdate(calculateProgress());
              }}
              description="Hours before weekly overtime kicks in"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">California Compliance Note</h5>
            <p className="text-sm text-blue-700">
              California law requires overtime pay for work over 8 hours per day or 40 hours per week, 
              whichever provides the greater benefit to the employee.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Break Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Break and Meal Period Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <AccessibleFormField
              label="Lunch Break (minutes)"
              name="lunch_break"
              type="number"
              value={config.break_rules.lunch_break.toString()}
              onChange={(value) => setConfig({
                ...config,
                break_rules: { ...config.break_rules, lunch_break: parseInt(value) || 30 }
              })}
            />
            
            <AccessibleFormField
              label="Paid Break (minutes)"
              name="paid_breaks"
              type="number"
              value={config.break_rules.paid_breaks.toString()}
              onChange={(value) => setConfig({
                ...config,
                break_rules: { ...config.break_rules, paid_breaks: parseInt(value) || 15 }
              })}
            />
            
            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="auto_deduct_lunch"
                checked={config.break_rules.auto_deduct_lunch}
                onChange={(e) => setConfig({
                  ...config,
                  break_rules: { ...config.break_rules, auto_deduct_lunch: e.target.checked }
                })}
                className="rounded"
              />
              <label htmlFor="auto_deduct_lunch" className="text-sm">
                Auto-deduct lunch breaks
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rounding Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Time Rounding Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="rounding_enabled"
              checked={config.rounding_rules.enabled}
              onChange={(e) => setConfig({
                ...config,
                rounding_rules: { ...config.rounding_rules, enabled: e.target.checked }
              })}
              className="rounded"
            />
            <label htmlFor="rounding_enabled" className="text-sm font-medium">
              Enable time rounding
            </label>
          </div>

          {config.rounding_rules.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <AccessibleSelectField
                label="Rounding Interval"
                name="rounding_interval"
                value={config.rounding_rules.interval.toString()}
                onChange={(value) => setConfig({
                  ...config,
                  rounding_rules: { ...config.rounding_rules, interval: parseInt(value) }
                })}
                options={intervalOptions}
              />
              
              <AccessibleSelectField
                label="Rounding Rule"
                name="rounding_rule"
                value={config.rounding_rules.rule}
                onChange={(value) => setConfig({
                  ...config,
                  rounding_rules: { ...config.rounding_rules, rule: value }
                })}
                options={roundingOptions}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PTO Accrual Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>PTO Accrual Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Vacation Accrual Rate"
              name="vacation_rate"
              type="number"
              step="0.0001"
              value={config.pto_accrual.vacation_rate.toString()}
              onChange={(value) => setConfig({
                ...config,
                pto_accrual: { ...config.pto_accrual, vacation_rate: parseFloat(value) || 0 }
              })}
              description="Hours accrued per hour worked"
            />
            
            <AccessibleFormField
              label="Sick Accrual Rate"
              name="sick_rate"
              type="number"
              step="0.0001"
              value={config.pto_accrual.sick_rate.toString()}
              onChange={(value) => setConfig({
                ...config,
                pto_accrual: { ...config.pto_accrual, sick_rate: parseFloat(value) || 0 }
              })}
              description="Hours accrued per hour worked"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Max Vacation Hours"
              name="max_vacation"
              type="number"
              value={config.pto_accrual.max_vacation.toString()}
              onChange={(value) => setConfig({
                ...config,
                pto_accrual: { ...config.pto_accrual, max_vacation: parseInt(value) || 0 }
              })}
              description="Maximum vacation hours that can be accrued"
            />
            
            <AccessibleFormField
              label="Max Sick Hours"
              name="max_sick"
              type="number"
              value={config.pto_accrual.max_sick.toString()}
              onChange={(value) => setConfig({
                ...config,
                pto_accrual: { ...config.pto_accrual, max_sick: parseInt(value) || 0 }
              })}
              description="Maximum sick hours that can be accrued"
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Approvers */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Time Approvers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Select employees who can approve timesheets for other team members.
          </p>
          
          {/* This would be populated with actual employees */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">HR Manager</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">Mike Davis</p>
                <p className="text-sm text-muted-foreground">Operations Manager</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Timesheet Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Test Timesheet Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Test the complete timesheet workflow to ensure everything is configured correctly.
          </p>
          
          {!testCompleted ? (
            <Button 
              onClick={runTimesheetTest}
              disabled={!config.collection_method}
              className="w-full"
            >
              Run Timesheet Test
            </Button>
          ) : (
            <div className="flex items-center space-x-2 text-green-600 justify-center py-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Timesheet flow test completed successfully</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            Progress: {calculateProgress()}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            Configure all sections and complete the test to finish this step
          </span>
        </div>
      </div>
    </div>
  );
};