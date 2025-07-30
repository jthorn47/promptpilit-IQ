import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionOption {
  value: string;
  label: string;
}

interface QuestionCardProps {
  question: string;
  options: QuestionOption[];
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const QuestionCard = ({
  question,
  options,
  selectedAnswer,
  onAnswerChange,
  onNext,
  onPrevious,
  isFirst,
  isLast
}: QuestionCardProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-strong">
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between gap-4">
          {!isFirst && onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            onClick={onNext}
            disabled={!selectedAnswer}
          >
            {isLast ? 'Complete Assessment' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};