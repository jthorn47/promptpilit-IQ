import { Progress } from "@/components/ui/progress";

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const AssessmentProgress = ({ currentQuestion, totalQuestions }: AssessmentProgressProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};