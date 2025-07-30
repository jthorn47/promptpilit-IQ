import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Play, Pause, Volume2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionData {
  id: string;
  type: 'multiple_choice_single' | 'multiple_choice_multiple' | 'true_false' | 'scenario_based';
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  options: QuestionOption[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  explanation?: string;
  points?: number;
  isRequired?: boolean;
}

interface QuestionPresentationProps {
  question: QuestionData;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswer: (selectedOptionIds: string[], isCorrect: boolean) => void;
  onSkip?: () => void;
  onNext: () => void;
  showFeedback?: boolean;
  allowRetry?: boolean;
  allowSkip?: boolean;
  isEditMode?: boolean;
  onEdit?: () => void;
  className?: string;
}

export const QuestionPresentation: React.FC<QuestionPresentationProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswer,
  onSkip,
  onNext,
  showFeedback = true,
  allowRetry = true,
  allowSkip = false,
  isEditMode = false,
  onEdit,
  className
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setHasAnswered(false);
    setIsCorrect(null);
    setShowExplanation(false);
    setIsVideoPlaying(false);
  }, [question.id]);

  const handleOptionSelect = useCallback((optionId: string) => {
    if (hasAnswered) return;

    if (question.type === 'multiple_choice_single' || question.type === 'true_false') {
      setSelectedOptions([optionId]);
    } else if (question.type === 'multiple_choice_multiple') {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  }, [hasAnswered, question.type]);

  const handleSubmit = useCallback(() => {
    if (selectedOptions.length === 0) return;

    const correctOptionIds = question.options
      .filter(option => option.isCorrect)
      .map(option => option.id);

    const isAnswerCorrect = question.type === 'multiple_choice_multiple'
      ? selectedOptions.length === correctOptionIds.length &&
        selectedOptions.every(id => correctOptionIds.includes(id))
      : selectedOptions.length === 1 && correctOptionIds.includes(selectedOptions[0]);

    setIsCorrect(isAnswerCorrect);
    setHasAnswered(true);
    
    if (showFeedback) {
      setShowExplanation(true);
    }

    onAnswer(selectedOptions, isAnswerCorrect);
  }, [selectedOptions, question.options, question.type, onAnswer, showFeedback]);

  const handleRetry = useCallback(() => {
    setSelectedOptions([]);
    setHasAnswered(false);
    setIsCorrect(null);
    setShowExplanation(false);
  }, []);

  const toggleVideo = useCallback(() => {
    if (videoElement) {
      if (isVideoPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [videoElement, isVideoPlaying]);

  const getOptionIcon = (option: QuestionOption) => {
    if (!hasAnswered) return null;
    
    if (option.isCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-600" aria-label="Correct answer" />;
    } else if (selectedOptions.includes(option.id)) {
      return <XCircle className="w-5 h-5 text-red-600" aria-label="Incorrect answer" />;
    }
    return null;
  };

  const getFeedbackMessage = () => {
    if (!showExplanation) return null;
    
    if (isCorrect) {
      return question.correctFeedback || "Correct! Well done.";
    } else {
      return question.incorrectFeedback || "That's not quite right.";
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className={cn("max-w-4xl mx-auto p-4 space-y-6", className)}>
      {/* Progress Indicator */}
      <div className="space-y-2" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemax={totalQuestions}>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          {question.points && (
            <Badge variant="secondary" className="text-xs">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </Badge>
          )}
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2"
          aria-label={`Progress: ${currentQuestionIndex + 1} of ${totalQuestions} questions completed`}
        />
      </div>

      <Card className="border-2 border-muted/50 shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Edit Button for Build Mode */}
          {isEditMode && onEdit && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Question
              </Button>
            </div>
          )}

          {/* Media Content */}
          {(question.imageUrl || question.videoUrl) && (
            <div className="space-y-4">
              {question.imageUrl && (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={question.imageUrl} 
                    alt="Question context"
                    className="w-full h-auto max-h-80 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              
              {question.videoUrl && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video 
                    ref={setVideoElement}
                    src={question.videoUrl}
                    className="w-full h-auto max-h-80"
                    controls={false}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    aria-label="Question context video"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={toggleVideo}
                      className="gap-2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isVideoPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/50 hover:bg-black/70 text-white"
                      aria-label="Audio controls"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                {question.title}
              </h2>
              {question.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {question.description}
                </p>
              )}
              {question.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Answer Options */}
            <div 
              className="space-y-3"
              role={question.type === 'multiple_choice_multiple' ? 'group' : 'radiogroup'}
              aria-label="Answer options"
            >
              {question.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);
                const showAsCorrect = hasAnswered && option.isCorrect;
                const showAsIncorrect = hasAnswered && isSelected && !option.isCorrect;

                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={hasAnswered}
                    className={cn(
                      "w-full p-6 h-auto text-left justify-start relative",
                      "transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]",
                      "text-base leading-relaxed min-h-[4rem]",
                      showAsCorrect && "border-green-500 bg-green-50 hover:bg-green-50",
                      showAsIncorrect && "border-red-500 bg-red-50 hover:bg-red-50",
                      isSelected && !hasAnswered && "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                    )}
                    role={question.type === 'multiple_choice_multiple' ? 'checkbox' : 'radio'}
                    aria-checked={isSelected}
                    aria-describedby={hasAnswered && option.explanation ? `explanation-${option.id}` : undefined}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {question.type === 'multiple_choice_multiple' ? (
                          <div className={cn(
                            "w-5 h-5 border-2 rounded",
                            isSelected ? "bg-current border-current" : "border-muted-foreground"
                          )}>
                            {isSelected && (
                              <CheckCircle className="w-full h-full text-background" />
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "w-5 h-5 border-2 rounded-full",
                            isSelected ? "bg-current border-current" : "border-muted-foreground"
                          )}>
                            {isSelected && (
                              <div className="w-full h-full bg-background rounded-full scale-50" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <span className="block text-left">{option.text}</span>
                        {option.imageUrl && (
                          <img 
                            src={option.imageUrl} 
                            alt="Option illustration"
                            className="max-w-32 h-auto rounded border"
                            loading="lazy"
                          />
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        {getOptionIcon(option)}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Feedback Section */}
            {showExplanation && (
              <div 
                className={cn(
                  "p-4 rounded-lg border-l-4 space-y-2 animate-fade-in",
                  isCorrect 
                    ? "bg-green-50 border-green-500 text-green-800" 
                    : "bg-red-50 border-red-500 text-red-800"
                )}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 font-medium">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {getFeedbackMessage()}
                </div>
                {question.explanation && (
                  <p className="text-sm leading-relaxed">{question.explanation}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {!hasAnswered ? (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0}
                  size="lg"
                  className="bg-[#655DC6] hover:bg-[#5a52b8] text-white px-8"
                >
                  Submit Answer
                </Button>
                {allowSkip && onSkip && (
                  <Button
                    variant="outline"
                    onClick={onSkip}
                    size="lg"
                    className="px-6"
                  >
                    Skip Question
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onNext}
                  size="lg"
                  className="bg-[#655DC6] hover:bg-[#5a52b8] text-white px-8"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete'}
                </Button>
                {allowRetry && !isCorrect && (
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    size="lg"
                    className="px-6"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {hasAnswered && isCorrect !== null && (
          `Question ${currentQuestionIndex + 1} answered ${isCorrect ? 'correctly' : 'incorrectly'}`
        )}
      </div>
    </div>
  );
};