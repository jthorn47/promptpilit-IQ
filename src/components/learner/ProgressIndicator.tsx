import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";

type FlowStep = 'content' | 'quiz' | 'completion';

interface ProgressIndicatorProps {
  currentProgress: number;
  stepProgress: number;
  currentStep: FlowStep;
}

export const ProgressIndicator = ({ currentProgress, stepProgress, currentStep }: ProgressIndicatorProps) => {
  const steps = [
    { key: 'content' as FlowStep, label: 'Content', icon: PlayCircle },
    { key: 'quiz' as FlowStep, label: 'Assessment', icon: Circle },
    { key: 'completion' as FlowStep, label: 'Complete', icon: CheckCircle }
  ];

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">{currentProgress}%</span>
        </div>
        <Progress value={currentProgress} className="h-2" />
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center space-x-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Progress */}
      {currentStep !== 'completion' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Step</span>
            <span className="text-muted-foreground">{stepProgress}%</span>
          </div>
          <Progress value={stepProgress} className="h-1" />
        </div>
      )}
    </div>
  );
};