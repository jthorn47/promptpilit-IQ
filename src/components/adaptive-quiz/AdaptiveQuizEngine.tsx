import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingUp, TrendingDown, Target, Clock, CheckCircle } from "lucide-react";
import { useAdaptiveQuiz } from "@/hooks/useAdaptiveQuiz";

interface AdaptiveQuizEngineProps {
  employeeId: string;
  trainingModuleId: string;
  assignmentId: string;
  companyId: string;
  onComplete?: (results: any) => void;
  maxQuestions?: number;
}

export const AdaptiveQuizEngine = ({
  employeeId,
  trainingModuleId,
  assignmentId,
  companyId,
  onComplete,
  maxQuestions = 20
}: AdaptiveQuizEngineProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const {
    session,
    currentQuestion,
    loading,
    isInitialized,
    initializeSession,
    getNextQuestion,
    processAnswer,
    completeQuiz
  } = useAdaptiveQuiz({
    employeeId,
    trainingModuleId,
    assignmentId,
    companyId
  });

  useEffect(() => {
    if (!isInitialized) {
      initializeSession();
    }
  }, [isInitialized, initializeSession]);

  useEffect(() => {
    if (isInitialized && !currentQuestion) {
      getNextQuestion();
    }
  }, [isInitialized, currentQuestion, getNextQuestion]);

  useEffect(() => {
    if (currentQuestion) {
      setQuestionStartTime(Date.now());
      setSelectedAnswer("");
      setShowFeedback(false);
    }
  }, [currentQuestion]);

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !selectedAnswer || showFeedback) return;

    const correct = checkAnswer(selectedAnswer, currentQuestion.correct_answer);
    setIsCorrect(correct);
    setShowFeedback(true);

    await processAnswer(selectedAnswer, correct);
  };

  const handleNext = async () => {
    if (session && session.total_questions_answered >= maxQuestions) {
      await completeQuiz();
      onComplete?.(session);
      return;
    }

    await getNextQuestion();
  };

  const checkAnswer = (userAnswer: string, correctAnswer: any): boolean => {
    if (typeof correctAnswer === 'string') {
      return userAnswer === correctAnswer;
    }
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(userAnswer);
    }
    return false;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return <TrendingDown className="h-4 w-4" />;
      case 'intermediate': return <Target className="h-4 w-4" />;
      case 'advanced': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatPerformanceScore = (score: number) => {
    return Math.round(score * 100);
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {!isInitialized ? "Initializing adaptive quiz..." : "Loading next question..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Alert>
        <AlertDescription>
          Failed to initialize adaptive quiz session. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const progress = Math.min((session.total_questions_answered / maxQuestions) * 100, 100);
  const remainingQuestions = Math.max(maxQuestions - session.total_questions_answered, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress and Stats Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Adaptive Quiz
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(session.current_difficulty)}`} />
                <span className="text-sm font-medium capitalize flex items-center gap-1">
                  {getDifficultyIcon(session.current_difficulty)}
                  {session.current_difficulty}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Performance</div>
              <div className="text-lg font-bold">
                {formatPerformanceScore(session.performance_score || 0)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{session.total_questions_answered} / {maxQuestions} questions</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {session.struggle_topics && session.struggle_topics.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                Focus Areas
              </div>
              <div className="flex flex-wrap gap-1">
                {session.struggle_topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-strong">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
            {currentQuestion.topic && (
              <Badge variant="outline">{currentQuestion.topic}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={setSelectedAnswer}
            disabled={showFeedback}
          >
            {Array.isArray(currentQuestion.options) ? 
              currentQuestion.options.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value || option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.text || option.label || option}
                  </Label>
                </div>
              )) : 
              Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    {value as string}
                  </Label>
                </div>
              ))
            }
          </RadioGroup>

          {showFeedback && (
            <Alert className={isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Target className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="font-medium">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </div>
                  {currentQuestion.explanation && (
                    <div className="mt-1 text-sm">
                      {currentQuestion.explanation}
                    </div>
                  )}
                  {!isCorrect && currentQuestion.remediation_hint && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                      <strong>Hint:</strong> {currentQuestion.remediation_hint}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Question {session.total_questions_answered + 1}
              </div>
              {remainingQuestions > 0 && (
                <div>{remainingQuestions} remaining</div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!showFeedback ? (
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {remainingQuestions > 0 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {session.total_questions_answered > 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {session.correct_streak}
                </div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.mastered_topics ? session.mastered_topics.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Topics Mastered</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold capitalize">
                  {session.current_difficulty}
                </div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};