import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  Eye,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VimeoEmbed from '@/components/ui/VimeoEmbed';

interface QuizConfiguration {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  allow_retries: boolean;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  time_limit_minutes: number | null;
  random_pool_size: number | null;
  is_required: boolean;
}

interface QuizQuestion {
  id: string;
  question_type: string;
  question_text: string;
  question_image_url?: string;
  question_video_url?: string;
  points: number;
  is_required: boolean;
  explanation: string;
  correct_feedback: string;
  incorrect_feedback: string;
  category: string;
  answer_options: QuizAnswerOption[];
}

interface QuizAnswerOption {
  id: string;
  option_text: string;
  option_image_url?: string;
  is_correct: boolean;
  option_order: number;
  explanation?: string;
}

interface QuizAttempt {
  id: string;
  attempt_number: number;
  status: string;
  score: number | null;
  total_points: number;
  earned_points: number;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
}

interface LearnerQuizInterfaceProps {
  quizConfigurationId: string;
  employeeId: string;
  onComplete?: (attempt: QuizAttempt) => void;
  onClose?: () => void;
}

export const LearnerQuizInterface: React.FC<LearnerQuizInterfaceProps> = ({
  quizConfigurationId,
  employeeId,
  onComplete,
  onClose
}) => {
  const { toast } = useToast();
  const startTimeRef = useRef<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Quiz data state
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  // User response state
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, quizCompleted]);

  const loadQuizData = async () => {
    setLoading(true);
    try {
      // Load quiz configuration
      const { data: configData, error: configError } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('id', quizConfigurationId)
        .single();

      if (configError) throw configError;
      setQuizConfig(configData);

      // Load questions and shuffle if enabled
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_answer_options (*)
        `)
        .eq('quiz_configuration_id', quizConfigurationId)
        .order('question_order');

      if (questionsError) throw questionsError;

      let processedQuestions = questionsData.map(q => ({
        ...q,
        answer_options: q.quiz_answer_options || []
      }));

      // Apply question pool size limit
      if (configData.random_pool_size && processedQuestions.length > configData.random_pool_size) {
        processedQuestions = processedQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, configData.random_pool_size);
      }

      // Shuffle questions if enabled
      if (configData.shuffle_questions) {
        processedQuestions = processedQuestions.sort(() => Math.random() - 0.5);
      }

      // Shuffle answer options if enabled
      if (configData.shuffle_answers) {
        processedQuestions = processedQuestions.map(q => ({
          ...q,
          answer_options: [...q.answer_options].sort(() => Math.random() - 0.5)
        }));
      }

      setQuestions(processedQuestions);

      // Set timer if enabled
      if (configData.time_limit_minutes) {
        setTimeRemaining(configData.time_limit_minutes * 60);
      }

      // Create quiz attempt
      await createQuizAttempt(configData);

    } catch (error: any) {
      console.error('Error loading quiz data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuizAttempt = async (config: QuizConfiguration) => {
    try {
      // Check existing attempts
      const { data: existingAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('quiz_configuration_id', quizConfigurationId)
        .eq('employee_id', employeeId)
        .order('attempt_number', { ascending: false });

      if (attemptsError) throw attemptsError;

      const nextAttemptNumber = (existingAttempts?.[0]?.attempt_number || 0) + 1;

      if (nextAttemptNumber > config.max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }

      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_configuration_id: quizConfigurationId,
          employee_id: employeeId,
          attempt_number: nextAttemptNumber,
          status: 'in_progress',
          total_points: questions.reduce((sum, q) => sum + q.points, 0),
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttempt(attemptData);

    } catch (error: any) {
      console.error('Error creating quiz attempt:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start quiz',
        variant: 'destructive',
      });
    }
  };

  const handleTimeUp = async () => {
    toast({
      title: 'Time\'s Up!',
      description: 'The quiz time limit has been reached. Submitting your current answers.',
      variant: 'destructive',
    });
    await submitQuiz();
  };

  const handleResponseChange = (questionId: string, response: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const getCurrentQuestion = () => questions[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const validateCurrentResponse = (): boolean => {
    const currentQuestion = getCurrentQuestion();
    const response = responses[currentQuestion.id];

    if (currentQuestion.is_required && !response) {
      toast({
        title: 'Answer Required',
        description: 'This question is required. Please provide an answer before continuing.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const calculateScore = () => {
    let earnedPoints = 0;

    questions.forEach(question => {
      const response = responses[question.id];
      let isCorrect = false;

      switch (question.question_type) {
        case 'multiple_choice_single':
          const selectedOption = question.answer_options.find(opt => opt.id === response);
          isCorrect = selectedOption?.is_correct || false;
          break;

        case 'multiple_choice_multiple':
          const correctOptionIds = question.answer_options
            .filter(opt => opt.is_correct)
            .map(opt => opt.id);
          const selectedOptionIds = response || [];
          isCorrect = correctOptionIds.length === selectedOptionIds.length &&
            correctOptionIds.every(id => selectedOptionIds.includes(id));
          break;

        case 'true_false':
          const tfSelectedOption = question.answer_options.find(opt => opt.id === response);
          isCorrect = tfSelectedOption?.is_correct || false;
          break;

        case 'fill_in_blank':
          const correctAnswers = question.answer_options.map(opt => opt.option_text.toLowerCase());
          const userAnswer = (response || '').toLowerCase().trim();
          isCorrect = correctAnswers.some(answer => 
            answer === userAnswer || 
            answer.includes(userAnswer) || 
            userAnswer.includes(answer)
          );
          break;

        case 'scenario_based':
          const scenarioSelectedOption = question.answer_options.find(opt => opt.id === response);
          isCorrect = scenarioSelectedOption?.is_correct || false;
          break;
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }
    });

    return earnedPoints;
  };

  const submitQuiz = async () => {
    if (!attempt) return;

    setSubmitting(true);
    try {
      const earnedPoints = calculateScore();
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const timeSpent = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

      // Update attempt
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .update({
          status: score >= (quizConfig?.passing_score || 80) ? 'passed' : 'failed',
          score,
          earned_points: earnedPoints,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
        })
        .eq('id', attempt.id);

      if (attemptError) throw attemptError;

      // Save individual responses
      for (const question of questions) {
        const response = responses[question.id];
        const correctOptionIds = question.answer_options
          .filter(opt => opt.is_correct)
          .map(opt => opt.id);

        let isCorrect = false;
        let selectedOptionIds: string[] = [];
        let textResponse = '';

        // Determine if answer is correct based on question type
        switch (question.question_type) {
          case 'multiple_choice_single':
          case 'true_false':
          case 'scenario_based':
            selectedOptionIds = response ? [response] : [];
            isCorrect = question.answer_options.find(opt => opt.id === response)?.is_correct || false;
            break;

          case 'multiple_choice_multiple':
            selectedOptionIds = response || [];
            isCorrect = correctOptionIds.length === selectedOptionIds.length &&
              correctOptionIds.every(id => selectedOptionIds.includes(id));
            break;

          case 'fill_in_blank':
            textResponse = response || '';
            const correctAnswers = question.answer_options.map(opt => opt.option_text.toLowerCase());
            const userAnswer = textResponse.toLowerCase().trim();
            isCorrect = correctAnswers.some(answer => 
              answer === userAnswer || 
              answer.includes(userAnswer) || 
              userAnswer.includes(answer)
            );
            break;
        }

        const { error: responseError } = await supabase
          .from('quiz_responses')
          .upsert({
            attempt_id: attempt.id,
            question_id: question.id,
            selected_option_ids: selectedOptionIds,
            text_response: textResponse,
            is_correct: isCorrect,
            points_earned: isCorrect ? question.points : 0,
          });

        if (responseError) throw responseError;
      }

      // Update attempt state
      const updatedAttempt = {
        ...attempt,
        status: score >= (quizConfig?.passing_score || 80) ? 'passed' : 'failed',
        score,
        earned_points: earnedPoints,
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpent,
      };

      setAttempt(updatedAttempt);
      setQuizCompleted(true);

      if (quizConfig?.show_results_immediately) {
        setShowResults(true);
      }

      toast({
        title: score >= (quizConfig?.passing_score || 80) ? 'Quiz Passed!' : 'Quiz Completed',
        description: `You scored ${score.toFixed(1)}% (${earnedPoints}/${totalPoints} points)`,
        variant: score >= (quizConfig?.passing_score || 80) ? 'default' : 'destructive',
      });

      onComplete?.(updatedAttempt);

    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionContent = (question: QuizQuestion) => {
    const response = responses[question.id];

    return (
      <div className="space-y-6">
        {/* Question Media */}
        {question.question_image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={question.question_image_url}
              alt="Question illustration"
              className="w-full h-auto max-h-64 object-cover"
            />
          </div>
        )}

        {question.question_video_url && (
          <div className="rounded-lg overflow-hidden">
            <VimeoEmbed
              videoId={question.question_video_url.match(/(\d+)/)?.[1] || ''}
              className="w-full"
            />
          </div>
        )}

        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold mb-2 leading-relaxed">
            {question.question_text}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{question.category}</Badge>
            <span>•</span>
            <span>{question.points} points</span>
            {question.is_required && (
              <>
                <span>•</span>
                <span className="text-red-600">Required</span>
              </>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {renderAnswerOptions(question, response)}
        </div>
      </div>
    );
  };

  const renderAnswerOptions = (question: QuizQuestion, response: any) => {
    switch (question.question_type) {
      case 'multiple_choice_single':
      case 'true_false':
      case 'scenario_based':
        return (
          <RadioGroup
            value={response || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            className="space-y-3"
          >
            {question.answer_options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.option_text}
                  </Label>
                  {option.option_image_url && (
                    <img
                      src={option.option_image_url}
                      alt="Answer option"
                      className="mt-2 w-32 h-auto rounded"
                    />
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice_multiple':
        const selectedOptions = response || [];
        return (
          <div className="space-y-3">
            {question.answer_options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleResponseChange(question.id, [...selectedOptions, option.id]);
                    } else {
                      handleResponseChange(question.id, selectedOptions.filter((id: string) => id !== option.id));
                    }
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.option_text}
                  </Label>
                  {option.option_image_url && (
                    <img
                      src={option.option_image_url}
                      alt="Answer option"
                      className="mt-2 w-32 h-auto rounded"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'fill_in_blank':
        return (
          <div>
            <Label htmlFor={`answer-${question.id}`} className="sr-only">
              Your answer
            </Label>
            <Input
              id={`answer-${question.id}`}
              value={response || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="text-lg"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Question type not supported yet
          </div>
        );
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadQuizData();
  }, [quizConfigurationId, employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizConfig || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Quiz Not Available</h3>
        <p className="text-muted-foreground">This quiz is not available or has no questions.</p>
      </div>
    );
  }

  if (showResults && quizCompleted) {
    const score = attempt?.score || 0;
    const passed = score >= quizConfig.passing_score;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-primary">
              {passed ? (
                <Trophy className="w-8 h-8 text-white" />
              ) : (
                <RotateCcw className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? 'Congratulations!' : 'Quiz Complete'}
            </CardTitle>
            <p className="text-muted-foreground">
              {passed 
                ? `You passed the quiz with a score of ${score.toFixed(1)}%`
                : `You scored ${score.toFixed(1)}%. The passing score is ${quizConfig.passing_score}%`
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{score.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {attempt?.earned_points}/{attempt?.total_points}
                </div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formatTime(attempt?.time_spent_seconds || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {quizConfig.allow_review && (
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Review Answers
                </Button>
              )}
              {!passed && quizConfig.allow_retries && (attempt?.attempt_number || 0) < quizConfig.max_attempts && (
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Quiz
                </Button>
              )}
              <Button onClick={onClose}>
                <FileText className="w-4 h-4 mr-2" />
                Continue Training
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Quiz Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quizConfig.title}</h1>
            <p className="text-muted-foreground">{quizConfig.description}</p>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="w-5 h-5" />
              <span className={timeRemaining < 300 ? 'text-red-600' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{progress.toFixed(0)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentQuestion.question_type.replace(/_/g, ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestionContent(currentQuestion)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={submitting}
              className="bg-gradient-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (validateCurrentResponse()) {
                  goToNextQuestion();
                }
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};