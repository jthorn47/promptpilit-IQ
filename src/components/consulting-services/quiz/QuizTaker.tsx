import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizQuestion {
  id: string;
  question_type: 'multiple_choice_single' | 'multiple_choice_multiple' | 'true_false' | 'fill_in_blank' | 'scenario_based';
  question_text: string;
  question_image_url?: string;
  points: number;
  explanation?: string;
  correct_feedback?: string;
  incorrect_feedback?: string;
  answer_options: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    explanation?: string;
  }>;
}

interface QuizAttempt {
  id: string;
  quiz_configuration_id: string;
  employee_id: string;
  attempt_number: number;
  status: 'in_progress' | 'completed' | 'passed' | 'failed';
  score?: number;
  started_at: string;
  time_spent_seconds?: number;
}

interface QuizTakerProps {
  quizId: string;
  questions: QuizQuestion[];
  config: {
    title: string;
    description?: string;
    passing_score: number;
    time_limit_minutes?: number;
    shuffle_questions: boolean;
    shuffle_answers: boolean;
    show_results_immediately: boolean;
    show_correct_answers: boolean;
  };
  onComplete?: (responses: any[], score: number) => void;
  onCancel?: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({
  quizId,
  questions,
  config,
  onComplete,
  onCancel
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config.time_limit_minutes ? config.time_limit_minutes * 60 : null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      const response = responses[question.id];
      
      if (question.question_type === 'multiple_choice_single') {
        const correctOption = question.answer_options.find(opt => opt.is_correct);
        if (response === correctOption?.id) {
          earnedPoints += question.points;
        }
      } else if (question.question_type === 'multiple_choice_multiple') {
        const correctOptions = question.answer_options.filter(opt => opt.is_correct).map(opt => opt.id);
        const responseArray = response || [];
        const isCorrect = correctOptions.length === responseArray.length && 
          correctOptions.every(id => responseArray.includes(id));
        if (isCorrect) {
          earnedPoints += question.points;
        }
      } else if (question.question_type === 'true_false') {
        const correctOption = question.answer_options.find(opt => opt.is_correct);
        if (response === correctOption?.id) {
          earnedPoints += question.points;
        }
      }
    });

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    const quizResults = {
      score,
      totalQuestions,
      timeSpent,
      passed: score >= config.passing_score,
      responses: questions.map(question => ({
        question_id: question.id,
        response: responses[question.id],
        is_correct: checkIfCorrect(question, responses[question.id])
      }))
    };

    setResults(quizResults);
    setIsSubmitted(true);

    if (onComplete) {
      onComplete(Object.entries(responses).map(([questionId, response]) => ({
        question_id: questionId,
        response
      })), score);
    }
  };

  const checkIfCorrect = (question: QuizQuestion, response: any) => {
    if (question.question_type === 'multiple_choice_single' || question.question_type === 'true_false') {
      const correctOption = question.answer_options.find(opt => opt.is_correct);
      return response === correctOption?.id;
    } else if (question.question_type === 'multiple_choice_multiple') {
      const correctOptions = question.answer_options.filter(opt => opt.is_correct).map(opt => opt.id);
      const responseArray = response || [];
      return correctOptions.length === responseArray.length && 
        correctOptions.every(id => responseArray.includes(id));
    }
    return false;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isSubmitted && results) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {results.passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              Quiz {results.passed ? 'Completed!' : 'Not Passed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{results.score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-muted-foreground">{config.passing_score}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{results.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            {config.show_correct_answers && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review</h3>
                {questions.map((question, index) => {
                  const response = results.responses.find((r: any) => r.question_id === question.id);
                  return (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {response?.is_correct ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">Question {index + 1}</div>
                          <div className="text-sm text-muted-foreground mb-2">{question.question_text}</div>
                          {question.explanation && (
                            <div className="text-sm bg-muted p-2 rounded">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button onClick={onCancel}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{config.title}</h2>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className={timeRemaining < 300 ? 'text-red-500 font-bold' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {timeRemaining !== null && timeRemaining < 300 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Less than 5 minutes remaining!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Question {currentQuestionIndex + 1}
            <Badge variant="outline">{currentQuestion.points} pts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg">{currentQuestion.question_text}</div>

          {currentQuestion.question_image_url && (
            <img
              src={currentQuestion.question_image_url}
              alt="Question"
              className="max-w-full h-auto rounded"
            />
          )}

          <div className="space-y-2">
            {currentQuestion.question_type === 'multiple_choice_single' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
              >
                {currentQuestion.answer_options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'multiple_choice_multiple' && (
              <div className="space-y-2">
                {currentQuestion.answer_options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={(responses[currentQuestion.id] || []).includes(option.id)}
                      onCheckedChange={(checked) => {
                        const currentResponse = responses[currentQuestion.id] || [];
                        const newResponse = checked
                          ? [...currentResponse, option.id]
                          : currentResponse.filter((id: string) => id !== option.id);
                        handleResponseChange(currentQuestion.id, newResponse);
                      }}
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
              >
                {currentQuestion.answer_options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'fill_in_blank' && (
              <Input
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer..."
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};