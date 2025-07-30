import React, { useState, useCallback, useEffect } from 'react';
import { QuestionPresentation, QuestionData } from './QuestionPresentation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionResponse {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  timestamp: Date;
  attemptCount: number;
}

interface QuestionSequenceProps {
  questions: QuestionData[];
  onComplete: (responses: QuestionResponse[], finalScore: number) => void;
  onQuestionAnswered?: (response: QuestionResponse) => void;
  allowRetry?: boolean;
  allowSkip?: boolean;
  passingScore?: number;
  showFeedback?: boolean;
  isEditMode?: boolean;
  onEditQuestion?: (questionId: string) => void;
  className?: string;
}

interface QuestionStats {
  [questionId: string]: {
    attempts: number;
    isCorrect: boolean;
    timeSpent: number;
    startTime: Date;
  };
}

export const QuestionSequence: React.FC<QuestionSequenceProps> = ({
  questions,
  onComplete,
  onQuestionAnswered,
  allowRetry = true,
  allowSkip = false,
  passingScore = 80,
  showFeedback = true,
  isEditMode = false,
  onEditQuestion,
  className
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats>({});
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(new Date());

  // Initialize question stats
  useEffect(() => {
    const initialStats: QuestionStats = {};
    questions.forEach(question => {
      initialStats[question.id] = {
        attempts: 0,
        isCorrect: false,
        timeSpent: 0,
        startTime: new Date()
      };
    });
    setQuestionStats(initialStats);
  }, [questions]);

  // Start timing for current question
  useEffect(() => {
    if (questions[currentQuestionIndex] && !isComplete) {
      setQuestionStats(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: {
          ...prev[questions[currentQuestionIndex].id],
          startTime: new Date()
        }
      }));
    }
  }, [currentQuestionIndex, questions, isComplete]);

  const handleAnswer = useCallback((selectedOptionIds: string[], isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const now = new Date();
    const timeSpent = now.getTime() - questionStats[currentQuestion.id].startTime.getTime();

    // Update question stats
    setQuestionStats(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        attempts: prev[currentQuestion.id].attempts + 1,
        isCorrect,
        timeSpent: prev[currentQuestion.id].timeSpent + timeSpent
      }
    }));

    // Create response record
    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      selectedOptionIds,
      isCorrect,
      timestamp: now,
      attemptCount: questionStats[currentQuestion.id].attempts + 1
    };

    // Update responses (replace if retrying same question)
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = response;
        return updated;
      }
      return [...prev, response];
    });

    // Call external handler
    if (onQuestionAnswered) {
      onQuestionAnswered(response);
    }
  }, [currentQuestionIndex, questions, questionStats, onQuestionAnswered]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete the sequence
      setIsComplete(true);
      
      // Calculate final score
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const earnedPoints = responses.reduce((sum, r) => {
        const question = questions.find(q => q.id === r.questionId);
        return sum + (r.isCorrect ? (question?.points || 1) : 0);
      }, 0);
      
      const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      onComplete(responses, finalScore);
    }
  }, [currentQuestionIndex, questions, responses, onComplete]);

  const handleSkip = useCallback(() => {
    if (allowSkip) {
      handleNext();
    }
  }, [allowSkip, handleNext]);

  const handleEditQuestion = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && onEditQuestion) {
      onEditQuestion(currentQuestion.id);
    }
  }, [currentQuestionIndex, questions, onEditQuestion]);

  const restartSequence = useCallback(() => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setIsComplete(false);
    
    // Reset question stats
    const resetStats: QuestionStats = {};
    questions.forEach(question => {
      resetStats[question.id] = {
        attempts: 0,
        isCorrect: false,
        timeSpent: 0,
        startTime: new Date()
      };
    });
    setQuestionStats(resetStats);
  }, [questions]);

  // Calculate current progress
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const earnedPoints = responses.reduce((sum, r) => {
    const question = questions.find(q => q.id === r.questionId);
    return sum + (r.isCorrect ? (question?.points || 1) : 0);
  }, 0);
  const currentScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No questions available.</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    const passed = currentScore >= passingScore;
    const totalTime = Object.values(questionStats).reduce((sum, stats) => sum + stats.timeSpent, 0);
    const averageTime = totalTime / responses.length;

    return (
      <Card className={cn("max-w-4xl mx-auto", className)}>
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            {passed ? (
              <div className="space-y-2">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                <h2 className="text-3xl font-bold text-green-600">Congratulations!</h2>
                <p className="text-lg text-muted-foreground">You passed the quiz!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <h2 className="text-3xl font-bold text-muted-foreground">Quiz Complete</h2>
                <p className="text-lg text-muted-foreground">
                  You need {passingScore}% to pass. Try again to improve your score.
                </p>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-[#655DC6]">
                {Math.round(currentScore)}%
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {responses.filter(r => r.isCorrect).length}/{questions.length}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(averageTime / 1000)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg. Time per Question</div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold text-center">Question Breakdown</h3>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const response = responses.find(r => r.questionId === question.id);
                const stats = questionStats[question.id];
                
                return (
                  <div 
                    key={question.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Q{index + 1}
                      </div>
                      <div className="text-sm truncate max-w-md">
                        {question.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground">
                        {stats.attempts} attempt{stats.attempts !== 1 ? 's' : ''}
                      </div>
                      {response?.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-red-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            {!passed && allowRetry && (
              <Button
                onClick={restartSequence}
                size="lg"
                className="gap-2 bg-[#655DC6] hover:bg-[#5a52b8] text-white"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={className}>
      <QuestionPresentation
        question={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        onNext={handleNext}
        showFeedback={showFeedback}
        allowRetry={allowRetry}
        allowSkip={allowSkip}
        isEditMode={isEditMode}
        onEdit={handleEditQuestion}
      />
      
      {/* Progress Summary for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        Question {currentQuestionIndex + 1} of {questions.length}. 
        Current score: {Math.round(currentScore)}%.
      </div>
    </div>
  );
};