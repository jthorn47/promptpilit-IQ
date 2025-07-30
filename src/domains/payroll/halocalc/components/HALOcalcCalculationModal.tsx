// HALOcalc Calculation Modal Component
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HaloButton } from '@/components/ui/halo-button';
import { HaloCard } from '@/components/ui/halo-card';
import { HaloInput } from '@/components/ui/halo-input';
import { HaloBadge } from '@/components/ui/halo-badge';
import { HaloProgress } from '@/components/ui/halo-progress';
import { useHALOcalc } from '../hooks/useHALOcalc';
import { Calculator, Upload, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface HALOcalcCalculationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HALOcalcCalculationModal: React.FC<HALOcalcCalculationModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { calculate, calculateBatch, isCalculating, isBatchCalculating } = useHALOcalc();
  const [step, setStep] = useState<'input' | 'validation' | 'processing' | 'results'>('input');
  const [calculationType, setCalculationType] = useState<'single' | 'batch'>('single');
  const [validationResults, setValidationResults] = useState([
    { rule: 'Timecard completeness', status: 'passed', message: 'All timecards complete' },
    { rule: 'Wage rate validation', status: 'warning', message: '2 employees missing current rates' },
    { rule: 'Tax profile check', status: 'passed', message: 'All tax profiles valid' }
  ]);

  const steps = [
    { id: 'input', label: 'Input Data', icon: FileText },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'processing', label: 'Processing', icon: Settings },
    { id: 'results', label: 'Results', icon: Calculator }
  ];

  const runCalculation = async () => {
    setStep('validation');
    
    // Simulate validation step
    setTimeout(() => {
      setStep('processing');
      
      // Run actual calculation
      const calculationData = {
        inputs: [], // Would be populated with actual data
        options: {
          enable_simulation: false,
          enable_ai_explanations: true,
          validation_level: 'standard' as const,
          async_processing: calculationType === 'batch'
        }
      };

      if (calculationType === 'batch') {
        calculateBatch.mutate({ inputs: [], options: calculationData.options });
      } else {
        calculate.mutate(calculationData);
      }
    }, 1500);
  };

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(s => s.id === step);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="w-6 h-6 text-primary" />
            HALOcalc Calculation Engine
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const status = getStepStatus(stepItem.id);
              
              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    status === 'completed' ? 'bg-success border-success text-success-foreground' :
                    status === 'current' ? 'bg-primary border-primary text-primary-foreground animate-pulse' :
                    'bg-muted border-muted-foreground/30'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {stepItem.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`ml-6 w-16 h-px ${
                      status === 'completed' ? 'bg-success' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Calculation Type */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Calculation Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <HaloCard 
                    className={`cursor-pointer transition-all ${
                      calculationType === 'single' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setCalculationType('single')}
                  >
                    <div className="p-4 text-center">
                      <Calculator className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Single Employee</h4>
                      <p className="text-xs text-muted-foreground mt-1">Calculate for one employee</p>
                    </div>
                  </HaloCard>
                  <HaloCard 
                    className={`cursor-pointer transition-all ${
                      calculationType === 'batch' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setCalculationType('batch')}
                  >
                    <div className="p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <h4 className="font-medium">Batch Processing</h4>
                      <p className="text-xs text-muted-foreground mt-1">Process multiple employees</p>
                    </div>
                  </HaloCard>
                </div>
              </div>

              {/* Data Input */}
              <HaloCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Input Data</h3>
                  {calculationType === 'single' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <HaloInput placeholder="Employee ID" defaultValue="EMP001" />
                        <HaloInput placeholder="Pay Period" defaultValue="2024-01-01 to 2024-01-15" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <HaloInput placeholder="Regular Hours" defaultValue="80" type="number" />
                        <HaloInput placeholder="Overtime Hours" defaultValue="5" type="number" />
                        <HaloInput placeholder="Hourly Rate" defaultValue="25.00" type="number" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <HaloInput placeholder="Pre-tax Deductions" defaultValue="150.00" type="number" />
                        <HaloInput placeholder="Post-tax Deductions" defaultValue="75.00" type="number" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Upload Timecard Data</p>
                      <p className="text-muted-foreground mb-4">
                        Upload CSV, Excel, or JSON files with employee timecard data
                      </p>
                      <HaloButton variant="outline">Choose Files</HaloButton>
                    </div>
                  )}
                </div>
              </HaloCard>
            </div>
          )}

          {/* Validation Step */}
          {step === 'validation' && (
            <HaloCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
                <div className="space-y-3">
                  {validationResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        {result.status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-warning" />
                        )}
                        <div>
                          <p className="font-medium">{result.rule}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <HaloBadge variant={result.status === 'passed' ? 'success' : 'warning'}>
                        {result.status}
                      </HaloBadge>
                    </div>
                  ))}
                </div>
              </div>
            </HaloCard>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <HaloCard>
              <div className="p-6 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing Calculations</h3>
                <p className="text-muted-foreground mb-6">
                  {calculationType === 'single' 
                    ? 'Calculating payroll for employee...' 
                    : 'Processing batch calculations...'
                  }
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Earnings calculation</span>
                    <span>Complete</span>
                  </div>
                  <HaloProgress value={100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Tax withholdings</span>
                    <span>In progress</span>
                  </div>
                  <HaloProgress value={65} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Deductions processing</span>
                    <span>Pending</span>
                  </div>
                  <HaloProgress value={25} className="h-2" />
                </div>
              </div>
            </HaloCard>
          )}

          {/* Results Step */}
          {step === 'results' && (
            <div className="space-y-4">
              <HaloCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Calculation Complete</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-success">$2,125.00</p>
                      <p className="text-sm text-muted-foreground">Gross Pay</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">$487.50</p>
                      <p className="text-sm text-muted-foreground">Total Taxes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">$225.00</p>
                      <p className="text-sm text-muted-foreground">Deductions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">$1,412.50</p>
                      <p className="text-sm text-muted-foreground">Net Pay</p>
                    </div>
                  </div>
                </div>
              </HaloCard>
              
              <div className="flex gap-3">
                <HaloButton variant="outline" className="flex-1">
                  Generate Paystub
                </HaloButton>
                <HaloButton variant="outline" className="flex-1">
                  Export Results
                </HaloButton>
                <HaloButton className="flex-1">
                  Ask AI Assistant
                </HaloButton>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <HaloButton variant="outline" onClick={() => onOpenChange(false)}>
            {step === 'results' ? 'Close' : 'Cancel'}
          </HaloButton>
          {step === 'input' && (
            <HaloButton 
              onClick={runCalculation}
              disabled={isCalculating || isBatchCalculating}
            >
              Start Calculation
            </HaloButton>
          )}
          {step === 'results' && (
            <HaloButton onClick={() => setStep('input')}>
              New Calculation
            </HaloButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};