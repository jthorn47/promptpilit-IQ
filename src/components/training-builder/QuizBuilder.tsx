import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shuffle,
  Eye,
  EyeOff,
  Save
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question_text: string;
  options?: string[];
  correct_answer: string | number | boolean;
  explanation?: string;
  timestamp?: number; // For timestamp-based insertion
  points: number;
}

interface QuizConfig {
  questions: QuizQuestion[];
  passing_score: number;
  allow_retries: boolean;
  max_retries: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  show_correct_answers: boolean;
  time_limit?: number;
}

interface QuizBuilderProps {
  config: QuizConfig;
  onConfigUpdate: (config: QuizConfig) => void;
}

export const QuizBuilder = ({ config, onConfigUpdate }: QuizBuilderProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const updateConfig = (updates: Partial<QuizConfig>) => {
    onConfigUpdate({ ...config, ...updates });
  };

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      type,
      question_text: '',
      points: 1,
      correct_answer: type === 'true_false' ? true : '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined
    };

    updateConfig({
      questions: [...config.questions, newQuestion]
    });
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = config.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateConfig({ questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = config.questions.filter(q => q.id !== questionId);
    updateConfig({ questions: updatedQuestions });
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
  };

  const duplicateQuestion = (question: QuizQuestion) => {
    const duplicatedQuestion: QuizQuestion = {
      ...question,
      id: crypto.randomUUID(),
      question_text: `${question.question_text} (Copy)`
    };
    updateConfig({
      questions: [...config.questions, duplicatedQuestion]
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(config.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateConfig({ questions: items });
  };

  const selectedQuestionData = config.questions.find(q => q.id === selectedQuestion);

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = config.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const addOption = (questionId: string) => {
    const question = config.questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, { options: [...question.options, ''] });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = config.questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  return (
    <div className="h-full flex">
      {/* Question List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quiz Questions</h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion('multiple_choice')}
              className="justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Multiple Choice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion('true_false')}
              className="justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              True/False
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion('short_answer')}
              className="justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Short Answer
            </Button>
          </div>

          <Separator className="mb-4" />

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {config.questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`cursor-pointer transition-colors ${
                            selectedQuestion === question.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          onClick={() => setSelectedQuestion(question.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <HelpCircle className="w-4 h-4" />
                                  <span className="font-medium text-sm truncate">
                                    {question.question_text || `Question ${index + 1}`}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {question.type.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                                  {question.timestamp && (
                                    <Badge variant="secondary" className="text-xs">
                                      @{question.timestamp}s
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateQuestion(question);
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteQuestion(question.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {config.questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No questions yet</p>
              <p className="text-xs">Add your first question to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Editor / Quiz Settings */}
      <div className="flex-1 flex flex-col">
        {selectedQuestionData ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Edit Question</h3>
                <Badge variant="outline">
                  {selectedQuestionData.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="question-text">Question Text</Label>
                  <Textarea
                    id="question-text"
                    value={selectedQuestionData.question_text}
                    onChange={(e) => updateQuestion(selectedQuestion!, { question_text: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>

                {selectedQuestionData.type === 'multiple_choice' && (
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-3 mt-2">
                      {selectedQuestionData.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correct-answer"
                              checked={selectedQuestionData.correct_answer === index}
                              onChange={() => updateQuestion(selectedQuestion!, { correct_answer: index })}
                            />
                            <span className="text-sm text-muted-foreground">
                              {String.fromCharCode(65 + index)}
                            </span>
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(selectedQuestion!, index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          {selectedQuestionData.options && selectedQuestionData.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeOption(selectedQuestion!, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(selectedQuestion!)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                {selectedQuestionData.type === 'true_false' && (
                  <div>
                    <Label>Correct Answer</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tf-answer"
                          checked={selectedQuestionData.correct_answer === true}
                          onChange={() => updateQuestion(selectedQuestion!, { correct_answer: true })}
                        />
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        True
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tf-answer"
                          checked={selectedQuestionData.correct_answer === false}
                          onChange={() => updateQuestion(selectedQuestion!, { correct_answer: false })}
                        />
                        <XCircle className="w-4 h-4 text-red-600" />
                        False
                      </label>
                    </div>
                  </div>
                )}

                {selectedQuestionData.type === 'short_answer' && (
                  <div>
                    <Label htmlFor="correct-answer">Correct Answer</Label>
                    <Input
                      id="correct-answer"
                      value={selectedQuestionData.correct_answer as string}
                      onChange={(e) => updateQuestion(selectedQuestion!, { correct_answer: e.target.value })}
                      placeholder="Enter the correct answer"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={selectedQuestionData.points}
                      onChange={(e) => updateQuestion(selectedQuestion!, { points: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timestamp">Video Timestamp (seconds, optional)</Label>
                    <Input
                      id="timestamp"
                      type="number"
                      min="0"
                      value={selectedQuestionData.timestamp || ''}
                      onChange={(e) => updateQuestion(selectedQuestion!, { 
                        timestamp: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="e.g., 120 for 2 minutes"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation (optional)</Label>
                  <Textarea
                    id="explanation"
                    value={selectedQuestionData.explanation || ''}
                    onChange={(e) => updateQuestion(selectedQuestion!, { explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Quiz Settings</h3>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Scoring & Completion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input
                        id="passing-score"
                        type="number"
                        min="0"
                        max="100"
                        value={config.passing_score}
                        onChange={(e) => updateConfig({ passing_score: parseInt(e.target.value) || 70 })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-retries"
                        checked={config.allow_retries}
                        onCheckedChange={(checked) => updateConfig({ allow_retries: checked })}
                      />
                      <Label htmlFor="allow-retries">Allow retries</Label>
                    </div>

                    {config.allow_retries && (
                      <div>
                        <Label htmlFor="max-retries">Maximum Retries</Label>
                        <Input
                          id="max-retries"
                          type="number"
                          min="1"
                          value={config.max_retries}
                          onChange={(e) => updateConfig({ max_retries: parseInt(e.target.value) || 3 })}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="time-limit">Time Limit (minutes, optional)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="1"
                        value={config.time_limit || ''}
                        onChange={(e) => updateConfig({ 
                          time_limit: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Leave empty for no time limit"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shuffle className="w-4 h-4" />
                      Randomization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="randomize-questions"
                        checked={config.randomize_questions}
                        onCheckedChange={(checked) => updateConfig({ randomize_questions: checked })}
                      />
                      <Label htmlFor="randomize-questions">Randomize question order</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="randomize-answers"
                        checked={config.randomize_answers}
                        onCheckedChange={(checked) => updateConfig({ randomize_answers: checked })}
                      />
                      <Label htmlFor="randomize-answers">Randomize answer options</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Display Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-correct-answers"
                        checked={config.show_correct_answers}
                        onCheckedChange={(checked) => updateConfig({ show_correct_answers: checked })}
                      />
                      <Label htmlFor="show-correct-answers">Show correct answers after completion</Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Quiz Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="ml-2 font-medium">{config.questions.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Points:</span>
                      <span className="ml-2 font-medium">
                        {config.questions.reduce((total, q) => total + q.points, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passing Score:</span>
                      <span className="ml-2 font-medium">{config.passing_score}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="ml-2 font-medium">
                        {config.time_limit ? `${config.time_limit} min` : 'No limit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};