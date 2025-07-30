import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { ModuleDefinition } from "@/types/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  validationMessage?: string;
}

interface ModuleSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  module: ModuleDefinition;
  onComplete: (moduleId: string, setupData: any) => void;
}

const SETUP_CONFIGURATIONS: Record<string, SetupStep[]> = {
  lms: [
    {
      id: "categories",
      title: "Training Categories",
      description: "Define training categories for your organization",
      required: true,
      completed: false
    },
    {
      id: "roles",
      title: "User Roles",
      description: "Set up user roles and permissions for training access",
      required: true,
      completed: false
    },
    {
      id: "certificates",
      title: "Certificate Templates",
      description: "Configure certificate templates for course completion",
      required: false,
      completed: false
    }
  ],
  payroll: [
    {
      id: "company_info",
      title: "Company Information",
      description: "Set up company details for payroll processing",
      required: true,
      completed: false
    },
    {
      id: "pay_periods",
      title: "Pay Periods",
      description: "Configure pay frequencies and cycles",
      required: true,
      completed: false
    },
    {
      id: "tax_settings",
      title: "Tax Configuration",
      description: "Set up federal and state tax settings",
      required: true,
      completed: false
    },
    {
      id: "bank_accounts",
      title: "Bank Integration",
      description: "Connect bank accounts for direct deposit",
      required: false,
      completed: false
    }
  ],
  ats: [
    {
      id: "job_boards",
      title: "Job Board Integration",
      description: "Connect to external job posting platforms",
      required: false,
      completed: false
    },
    {
      id: "application_forms",
      title: "Application Forms",
      description: "Create custom application forms",
      required: true,
      completed: false
    },
    {
      id: "hiring_workflow",
      title: "Hiring Workflow",
      description: "Set up interview stages and approval processes",
      required: true,
      completed: false
    }
  ],
  onboarding: [
    {
      id: "checklists",
      title: "Onboarding Checklists",
      description: "Create task lists for new employee setup",
      required: true,
      completed: false
    },
    {
      id: "document_collection",
      title: "Document Collection",
      description: "Set up required documents for new hires",
      required: true,
      completed: false
    },
    {
      id: "welcome_materials",
      title: "Welcome Materials",
      description: "Configure welcome emails and orientation content",
      required: false,
      completed: false
    }
  ]
};

export const ModuleSetupWizard = ({ 
  isOpen, 
  onClose, 
  module, 
  onComplete 
}: ModuleSetupWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>(
    SETUP_CONFIGURATIONS[module.id] || []
  );

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;
  const completedSteps = steps.filter(step => step.completed).length;

  const handleStepComplete = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].completed = true;
    setSteps(updatedSteps);

    if (isLastStep) {
      // All steps completed
      onComplete(module.id, {
        completedSteps: updatedSteps,
        setupDate: new Date().toISOString()
      });
      onClose();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleSkipStep = () => {
    if (isLastStep) {
      onComplete(module.id, {
        completedSteps: steps,
        setupDate: new Date().toISOString()
      });
      onClose();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Setup {module.name}
            <Badge variant="outline">{currentStepIndex + 1} of {steps.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            Configure {module.name} for your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep.completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
                {currentStep.title}
                {currentStep.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {currentStep.description}
              </p>

              {/* Step-specific content would go here */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This step would contain the actual configuration interface for{" "}
                  <strong>{currentStep.title}</strong>. For now, you can mark it as complete
                  to proceed with the setup.
                </p>
              </div>

              {currentStep.validationMessage && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{currentStep.validationMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Completed Steps:</span>
              <span className="ml-2">{completedSteps}/{steps.length}</span>
            </div>
            <div>
              <span className="font-medium">Required Steps:</span>
              <span className="ml-2">{steps.filter(s => s.required).length}</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!currentStep.required && (
                <Button variant="ghost" onClick={handleSkipStep}>
                  Skip Step
                </Button>
              )}
              <Button onClick={handleStepComplete}>
                {isLastStep ? "Complete Setup" : "Mark Complete"}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};