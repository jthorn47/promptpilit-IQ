import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface QuizQuestion {
  id: string;
  question_type: 'multiple_choice_single' | 'multiple_choice_multiple' | 'true_false' | 'fill_in_blank' | 'scenario_based';
  question_text: string;
  question_image_url?: string;
  points: number;
  explanation?: string;
  correct_feedback?: string;
  incorrect_feedback?: string;
  category?: string;
  answer_options: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    explanation?: string;
  }>;
}

interface QuizConfiguration {
  title: string;
  description?: string;
  passing_score: number;
  max_attempts: number;
  allow_retries: boolean;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  time_limit_minutes?: number;
  is_required: boolean;
}

interface QuizBuilderProps {
  trainingModuleId?: string;
  onSave?: (config: QuizConfiguration, questions: QuizQuestion[]) => void;
  onCancel?: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  trainingModuleId,
  onSave,
  onCancel
}) => {
  const [config, setConfig] = useState<QuizConfiguration>({
    title: 'Module Quiz',
    description: '',
    passing_score: 80,
    max_attempts: 3,
    allow_retries: true,
    shuffle_questions: false,
    shuffle_answers: false,
    show_results_immediately: true,
    show_correct_answers: true,
    allow_review: true,
    time_limit_minutes: undefined,
    is_required: true
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'questions'>('config');

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question_${Date.now()}`,
      question_type: 'multiple_choice_single',
      question_text: '',
      points: 1,
      explanation: '',
      correct_feedback: '',
      incorrect_feedback: '',
      category: '',
      answer_options: [
        { id: `option_${Date.now()}_1`, option_text: '', is_correct: true, explanation: '' },
        { id: `option_${Date.now()}_2`, option_text: '', is_correct: false, explanation: '' }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const addAnswerOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOption = {
        id: `option_${Date.now()}`,
        option_text: '',
        is_correct: false,
        explanation: ''
      };
      updateQuestion(questionId, {
        answer_options: [...question.answer_options, newOption]
      });
    }
  };

  const updateAnswerOption = (questionId: string, optionId: string, updates: any) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const updatedOptions = question.answer_options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      );
      updateQuestion(questionId, { answer_options: updatedOptions });
    }
  };

  const deleteAnswerOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.answer_options.length > 1) {
      updateQuestion(questionId, {
        answer_options: question.answer_options.filter(opt => opt.id !== optionId)
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config, questions);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Quiz Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Quiz
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'config' ? 'default' : 'outline'}
          onClick={() => setActiveTab('config')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuration
        </Button>
        <Button
          variant={activeTab === 'questions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('questions')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Questions ({questions.length})
        </Button>
      </div>

      {activeTab === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  min="0"
                  max="100"
                  value={config.passing_score}
                  onChange={(e) => setConfig({ ...config, passing_score: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Optional quiz description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_attempts">Max Attempts</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  min="1"
                  value={config.max_attempts}
                  onChange={(e) => setConfig({ ...config, max_attempts: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min="1"
                  value={config.time_limit_minutes || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    time_limit_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="No limit"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_retries">Allow Retries</Label>
                  <Switch
                    id="allow_retries"
                    checked={config.allow_retries}
                    onCheckedChange={(checked) => setConfig({ ...config, allow_retries: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_required">Required</Label>
                  <Switch
                    id="is_required"
                    checked={config.is_required}
                    onCheckedChange={(checked) => setConfig({ ...config, is_required: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
                  <Switch
                    id="shuffle_questions"
                    checked={config.shuffle_questions}
                    onCheckedChange={(checked) => setConfig({ ...config, shuffle_questions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="shuffle_answers">Shuffle Answers</Label>
                  <Switch
                    id="shuffle_answers"
                    checked={config.shuffle_answers}
                    onCheckedChange={(checked) => setConfig({ ...config, shuffle_answers: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_results">Show Results Immediately</Label>
                  <Switch
                    id="show_results"
                    checked={config.show_results_immediately}
                    onCheckedChange={(checked) => setConfig({ ...config, show_results_immediately: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_correct">Show Correct Answers</Label>
                  <Switch
                    id="show_correct"
                    checked={config.show_correct_answers}
                    onCheckedChange={(checked) => setConfig({ ...config, show_correct_answers: checked })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quiz Questions</h3>
            <Button onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No questions added yet. Click "Add Question" to get started.
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Badge variant="secondary">
                        {question.question_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {question.points} pts
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                        placeholder="Enter your question..."
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={question.question_type}
                        onValueChange={(value: any) => updateQuestion(question.id, { question_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice_single">Multiple Choice (Single)</SelectItem>
                          <SelectItem value="multiple_choice_multiple">Multiple Choice (Multiple)</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                          <SelectItem value="scenario_based">Scenario Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={question.category || ''}
                        onChange={(e) => updateQuestion(question.id, { category: e.target.value })}
                        placeholder="e.g., Safety, Compliance"
                      />
                    </div>
                  </div>

                  {(question.question_type === 'multiple_choice_single' || question.question_type === 'multiple_choice_multiple') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Answer Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addAnswerOption(question.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {question.answer_options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center gap-2 p-2 border rounded">
                            <input
                              type={question.question_type === 'multiple_choice_single' ? 'radio' : 'checkbox'}
                              checked={option.is_correct}
                              onChange={(e) => {
                                if (question.question_type === 'multiple_choice_single') {
                                  // For single choice, uncheck all others first
                                  const updatedOptions = question.answer_options.map(opt => ({
                                    ...opt,
                                    is_correct: opt.id === option.id ? e.target.checked : false
                                  }));
                                  updateQuestion(question.id, { answer_options: updatedOptions });
                                } else {
                                  updateAnswerOption(question.id, option.id, { is_correct: e.target.checked });
                                }
                              }}
                            />
                            <Input
                              value={option.option_text}
                              onChange={(e) => updateAnswerOption(question.id, option.id, { option_text: e.target.value })}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            {question.answer_options.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAnswerOption(question.id, option.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation || ''}
                      onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};