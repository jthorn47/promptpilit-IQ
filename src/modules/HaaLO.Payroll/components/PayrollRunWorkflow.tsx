/**
 * Payroll Run Workflow Component
 * Multi-step payroll processing workflow
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  PlayCircle, 
  Pause,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

import { usePayrollWorkflow } from '../hooks/usePayrollMicroservice';
import { PayrollServiceConfig } from '../config/PayrollServiceConfig';

interface PayrollRunWorkflowProps {
  payrollRunId: string;
  companyId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const PayrollRunWorkflow: React.FC<PayrollRunWorkflowProps> = ({
  payrollRunId,
  companyId,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: workflow, isLoading } = usePayrollWorkflow(payrollRunId);

  const handleNextStep = async () => {
    if (!workflow) return;
    
    setIsProcessing(true);
    try {
      // Simulate step processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (currentStep < workflow.steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error processing step:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading || !workflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Workflow...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = workflow.steps[currentStep - 1];
  const progress = (currentStep / workflow.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Run Workflow</CardTitle>
              <CardDescription>
                Processing payroll run {payrollRunId.slice(0, 8)}...
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Step {currentStep} of {workflow.steps.length}: {currentStepData.name}
              </span>
              <Badge variant="outline">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow.steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const isPending = stepNumber > currentStep;

              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isActive ? 'border-primary bg-primary/5' : 
                    isCompleted ? 'border-green-200 bg-green-50' : 
                    'border-muted'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isActive ? (
                      <PlayCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={
                        isCompleted ? 'default' : 
                        isActive ? 'secondary' : 
                        'outline'
                      }
                    >
                      {isCompleted ? 'Completed' : 
                       isActive ? 'In Progress' : 
                       'Pending'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            {currentStepData.name}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step-specific content would go here */}
            {currentStepData.id === 'precheck' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Running validation checks on time entries and employee data...
                </AlertDescription>
              </Alert>
            )}

            {currentStepData.id === 'review_time' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review and edit time entries if needed before proceeding with calculations.
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found 3 time entries that may need review.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {currentStepData.id === 'calculate' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Calculating gross pay, taxes, and deductions for all employees...
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Processing calculations...</span>
                  </div>
                )}
              </div>
            )}

            {currentStepData.id === 'preview' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review calculated payroll results before approval.
                </p>
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="font-semibold">Total Gross</div>
                    <div className="text-2xl font-bold text-green-600">$25,430</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Total Taxes</div>
                    <div className="text-2xl font-bold text-red-600">$7,629</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Total Net</div>
                    <div className="text-2xl font-bold text-blue-600">$17,801</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 1 || isProcessing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button 
                onClick={handleNextStep}
                disabled={isProcessing || !currentStepData.required}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : currentStep === workflow.steps.length ? (
                  'Complete Payroll'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollRunWorkflow;