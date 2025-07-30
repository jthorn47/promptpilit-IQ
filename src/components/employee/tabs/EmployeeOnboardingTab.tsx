import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type Employee = Database['public']['Tables']['employees']['Row'];

interface OnboardingStep {
  step_name: string;
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
  data?: any;
  notes?: string;
}

interface EmployeeOnboardingTabProps {
  employee: Employee;
  onChange: () => void;
}

const defaultOnboardingSteps = [
  { name: 'basicInfo', label: 'Basic Information', order: 1 },
  { name: 'emergencyContact', label: 'Emergency Contact', order: 2 },
  { name: 'federalW4', label: 'Federal W-4 Form', order: 3 },
  { name: 'stateTaxForm', label: 'State Tax Form', order: 4 },
  { name: 'stateNotice', label: 'State Notice', order: 5 },
  { name: 'directDeposit', label: 'Direct Deposit Setup', order: 6 },
  { name: 'complianceAcknowledgments', label: 'Compliance Acknowledgments', order: 7 },
  { name: 'requiredTraining', label: 'Required Training', order: 8 },
  { name: 'welcomeAndNextSteps', label: 'Welcome & Next Steps', order: 9 },
  { name: 'adminFinalization', label: 'Admin Finalization', order: 10 }
];

export const EmployeeOnboardingTab = ({ employee, onChange }: EmployeeOnboardingTabProps) => {
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingSteps();
  }, [employee.id]);

  const fetchOnboardingSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_onboarding_workflow')
        .select('*')
        .eq('employee_id', employee.id)
        .order('step_order');

      if (error) throw error;

      // If no steps exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultSteps();
      } else {
        setOnboardingSteps(data as OnboardingStep[]);
      }
    } catch (error) {
      console.error('Error fetching onboarding steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSteps = async () => {
    try {
      const stepsToInsert = defaultOnboardingSteps.map(step => ({
        employee_id: employee.id,
        step_name: step.name,
        step_order: step.order,
        status: 'pending' as const
      }));

      const { data, error } = await supabase
        .from('employee_onboarding_workflow')
        .insert(stepsToInsert)
        .select();

      if (error) throw error;
      setOnboardingSteps(data as OnboardingStep[] || []);
    } catch (error) {
      console.error('Error creating default onboarding steps:', error);
    }
  };

  const updateStepStatus = async (stepName: string, status: OnboardingStep['status']) => {
    try {
      const { error } = await supabase
        .from('employee_onboarding_workflow')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('employee_id', employee.id)
        .eq('step_name', stepName);

      if (error) throw error;

      // Update local state
      setOnboardingSteps(prev => 
        prev.map(step => 
          step.step_name === stepName 
            ? { ...step, status, completed_at: status === 'completed' ? new Date().toISOString() : undefined }
            : step
        )
      );
      onChange();
    } catch (error) {
      console.error('Error updating step status:', error);
    }
  };

  const getStepIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepLabel = (stepName: string) => {
    const step = defaultOnboardingSteps.find(s => s.name === stepName);
    return step?.label || stepName;
  };

  const completedSteps = onboardingSteps.filter(step => step.status === 'completed').length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (loading) {
    return <div className="p-6 text-center">Loading onboarding status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex gap-2">
            <Badge variant={employee.onboarding_status === 'completed' ? 'default' : 'secondary'}>
              {employee.onboarding_status || 'not_started'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {onboardingSteps.map((step, index) => (
            <div key={step.step_name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div>
                  <p className="font-medium">{getStepLabel(step.step_name)}</p>
                  <p className="text-sm text-muted-foreground">
                    Step {step.step_order} of {totalSteps}
                  </p>
                  {step.completed_at && (
                    <p className="text-xs text-green-600">
                      Completed: {new Date(step.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {step.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStepStatus(step.step_name, 'in_progress')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {step.status === 'in_progress' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => updateStepStatus(step.step_name, 'completed')}
                  >
                    Complete
                  </Button>
                )}
                {step.status === 'completed' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => updateStepStatus(step.step_name, 'pending')}
                  >
                    Reset
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateStepStatus(step.step_name, 'skipped')}
                  disabled={step.status === 'skipped'}
                >
                  Skip
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            Send Welcome Email
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Generate Onboarding Packet
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Schedule Orientation Meeting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};