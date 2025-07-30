import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Upload, 
  Download,
  BarChart3,
  Timer,
  Shuffle,
  Eye,
  AlertCircle,
  HelpCircle,
  Image,
  Video,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuizConfiguration {
  id?: string;
  training_module_id: string;
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
  id?: string;
  quiz_configuration_id?: string;
  question_type: 'multiple_choice_single' | 'multiple_choice_multiple' | 'true_false' | 'fill_in_blank' | 'drag_drop' | 'scenario_based';
  question_text: string;
  question_image_url?: string;
  question_video_url?: string;
  points: number;
  is_required: boolean;
  explanation: string;
  correct_feedback: string;
  incorrect_feedback: string;
  question_order: number;
  category: string;
  metadata: any;
  answer_options: QuizAnswerOption[];
}

interface QuizAnswerOption {
  id?: string;
  question_id?: string;
  option_text: string;
  option_image_url?: string;
  is_correct: boolean;
  option_order: number;
  explanation?: string;
}

interface EnhancedQuizBuilderProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
}

export const EnhancedQuizBuilder: React.FC<EnhancedQuizBuilderProps> = ({
  moduleId,
  moduleName,
  onClose
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('configuration');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quiz Configuration State
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    training_module_id: moduleId,
    title: `${moduleName} Quiz`,
    description: '',
    passing_score: 80,
    max_attempts: 3,
    allow_retries: true,
    shuffle_questions: false,
    shuffle_answers: false,
    show_results_immediately: true,
    show_correct_answers: true,
    allow_review: true,
    time_limit_minutes: null,
    random_pool_size: null,
    is_required: true,
  });

  // Quiz Questions State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // Question Categories for tagging
  const questionCategories = [
    'General Knowledge',
    'Harassment Law',
    'Reporting Procedures',
    'Safety Protocols',
    'Company Policy',
    'Compliance',
    'Ethics',
    'Communication',
    'Leadership',
    'Technical Skills'
  ];

  // Load existing quiz configuration and questions
  useEffect(() => {
    loadQuizData();
  }, [moduleId]);

  const loadQuizData = async () => {
    setLoading(true);
    try {
      // Load quiz configuration
      const { data: configData, error: configError } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('training_module_id', moduleId)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setQuizConfig(configData);

        // Load questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select(`
            *,
            quiz_answer_options (*)
          `)
          .eq('quiz_configuration_id', configData.id)
          .order('question_order');

        if (questionsError) throw questionsError;

        if (questionsData) {
          const formattedQuestions = questionsData.map(q => ({
            ...q,
            answer_options: q.quiz_answer_options || []
          }));
          setQuestions(formattedQuestions);
        }
      }
    } catch (error: any) {
      console.error('Error loading quiz data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuizConfiguration = async () => {
    setSaving(true);
    try {
      let configId = quizConfig.id;

      if (configId) {
        // Update existing configuration
        const { error } = await supabase
          .from('quiz_configurations')
          .update(quizConfig)
          .eq('id', configId);

        if (error) throw error;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('quiz_configurations')
          .insert(quizConfig)
          .select()
          .single();

        if (error) throw error;
        configId = data.id;
        setQuizConfig({ ...quizConfig, id: configId });
      }

      toast({
        title: 'Success',
        description: 'Quiz configuration saved successfully',
      });

      return configId;
    } catch (error: any) {
      console.error('Error saving quiz configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz configuration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      quiz_configuration_id: quizConfig.id,
      question_type: 'multiple_choice_single',
      question_text: '',
      points: 1,
      is_required: true,
      explanation: '',
      correct_feedback: 'Correct! Well done.',
      incorrect_feedback: 'Not quite right. Please review the material.',
      question_order: questions.length,
      category: 'General Knowledge',
      metadata: {},
      answer_options: [
        { option_text: '', is_correct: true, option_order: 0 },
        { option_text: '', is_correct: false, option_order: 1 },
        { option_text: '', is_correct: false, option_order: 2 },
        { option_text: '', is_correct: false, option_order: 3 },
      ],
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, updatedQuestion: Partial<QuizQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setSelectedQuestionIndex(null);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    
    // Update question_order
    newQuestions.forEach((q, i) => {
      q.question_order = i;
    });

    setQuestions(newQuestions);
    setSelectedQuestionIndex(targetIndex);
  };

  const addAnswerOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newOption: QuizAnswerOption = {
      option_text: '',
      is_correct: false,
      option_order: question.answer_options.length,
    };

    updateQuestion(questionIndex, {
      answer_options: [...question.answer_options, newOption],
    });
  };

  const updateAnswerOption = (
    questionIndex: number,
    optionIndex: number,
    updatedOption: Partial<QuizAnswerOption>
  ) => {
    const question = questions[questionIndex];
    const newOptions = [...question.answer_options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updatedOption };

    updateQuestion(questionIndex, { answer_options: newOptions });
  };

  const deleteAnswerOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const newOptions = question.answer_options.filter((_, i) => i !== optionIndex);
    
    // Update option_order
    newOptions.forEach((option, i) => {
      option.option_order = i;
    });

    updateQuestion(questionIndex, { answer_options: newOptions });
  };

  const saveAllQuestions = async () => {
    if (!quizConfig.id) {
      await saveQuizConfiguration();
    }

    setSaving(true);
    try {
      for (const question of questions) {
        let questionId = question.id;

        // Save question
        if (questionId) {
          const { error } = await supabase
            .from('quiz_questions')
            .update({
              ...question,
              quiz_configuration_id: quizConfig.id,
            })
            .eq('id', questionId);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('quiz_questions')
            .insert({
              ...question,
              quiz_configuration_id: quizConfig.id,
            })
            .select()
            .single();

          if (error) throw error;
          questionId = data.id;
        }

        // Save answer options
        for (const option of question.answer_options) {
          if (option.id) {
            const { error } = await supabase
              .from('quiz_answer_options')
              .update({
                ...option,
                question_id: questionId,
              })
              .eq('id', option.id);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('quiz_answer_options')
              .insert({
                ...option,
                question_id: questionId,
              });

            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Success',
        description: 'All questions saved successfully',
      });

      // Reload data to get IDs for new items
      await loadQuizData();
    } catch (error: any) {
      console.error('Error saving questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save questions',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Quiz Builder</h1>
          <p className="text-muted-foreground">Create accessible, engaging quizzes for {moduleName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={saveAllQuestions}
            disabled={saving}
            className="bg-gradient-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="w-4 h-4 mr-2" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      value={quizConfig.title}
                      onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quiz-description">Description</Label>
                    <Textarea
                      id="quiz-description"
                      value={quizConfig.description}
                      onChange={(e) => setQuizConfig({ ...quizConfig, description: e.target.value })}
                      placeholder="Describe what this quiz covers"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <Input
                      id="passing-score"
                      type="number"
                      min="0"
                      max="100"
                      value={quizConfig.passing_score}
                      onChange={(e) => setQuizConfig({ ...quizConfig, passing_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-attempts">Maximum Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={quizConfig.max_attempts}
                      onChange={(e) => setQuizConfig({ ...quizConfig, max_attempts: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="1"
                      value={quizConfig.time_limit_minutes || ''}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="No time limit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="random-pool">Random Question Pool Size</Label>
                    <Input
                      id="random-pool"
                      type="number"
                      min="1"
                      value={quizConfig.random_pool_size || ''}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        random_pool_size: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="Use all questions"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-retries">Allow Retries</Label>
                      <Switch
                        id="allow-retries"
                        checked={quizConfig.allow_retries}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, allow_retries: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
                      <Switch
                        id="shuffle-questions"
                        checked={quizConfig.shuffle_questions}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, shuffle_questions: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="shuffle-answers">Shuffle Answer Options</Label>
                      <Switch
                        id="shuffle-answers"
                        checked={quizConfig.shuffle_answers}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, shuffle_answers: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-results">Show Results Immediately</Label>
                      <Switch
                        id="show-results"
                        checked={quizConfig.show_results_immediately}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, show_results_immediately: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-correct">Show Correct Answers</Label>
                      <Switch
                        id="show-correct"
                        checked={quizConfig.show_correct_answers}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, show_correct_answers: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-review">Allow Answer Review</Label>
                      <Switch
                        id="allow-review"
                        checked={quizConfig.allow_review}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, allow_review: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-required">Quiz Required for Completion</Label>
                      <Switch
                        id="is-required"
                        checked={quizConfig.is_required}
                        onCheckedChange={(checked) => setQuizConfig({ ...quizConfig, is_required: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={saveQuizConfiguration}
                  disabled={saving}
                  className="bg-gradient-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab - Content will be in the next file due to length */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quiz Questions</CardTitle>
                <Button onClick={addNewQuestion} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your quiz by adding your first question.
                  </p>
                  <Button onClick={addNewQuestion} className="bg-gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Questions
                    </h4>
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedQuestionIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedQuestionIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Q{index + 1}</span>
                              <Badge variant="outline" className="text-xs">
                                {question.question_type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {question.question_text || 'Untitled Question'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {question.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {question.points} pts
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(index, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(index, 'down');
                              }}
                              disabled={index === questions.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(index);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Question Editor - This will be a separate component due to complexity */}
                  <div className="lg:col-span-2">
                    {selectedQuestionIndex !== null && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">
                          Edit Question {selectedQuestionIndex + 1}
                        </h4>
                        {/* Question editor content will go here */}
                        <p className="text-muted-foreground">
                          Question editor component will be implemented next...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quiz preview component will be implemented next...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quiz analytics dashboard will be implemented next...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};