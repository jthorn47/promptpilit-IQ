import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Image,
  Video,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle
} from 'lucide-react';

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

interface QuestionEditorProps {
  question: QuizQuestion;
  questionIndex: number;
  onUpdate: (updatedQuestion: Partial<QuizQuestion>) => void;
  categories: string[];
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  onUpdate,
  categories
}) => {
  const updateAnswerOption = (optionIndex: number, updatedOption: Partial<QuizAnswerOption>) => {
    const newOptions = [...question.answer_options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updatedOption };
    onUpdate({ answer_options: newOptions });
  };

  const addAnswerOption = () => {
    const newOption: QuizAnswerOption = {
      option_text: '',
      is_correct: false,
      option_order: question.answer_options.length,
    };
    onUpdate({ answer_options: [...question.answer_options, newOption] });
  };

  const deleteAnswerOption = (optionIndex: number) => {
    const newOptions = question.answer_options.filter((_, i) => i !== optionIndex);
    // Update option_order
    newOptions.forEach((option, i) => {
      option.option_order = i;
    });
    onUpdate({ answer_options: newOptions });
  };

  const setCorrectAnswer = (optionIndex: number) => {
    const newOptions = question.answer_options.map((option, i) => ({
      ...option,
      is_correct: question.question_type === 'multiple_choice_single' 
        ? i === optionIndex 
        : i === optionIndex ? !option.is_correct : option.is_correct
    }));
    onUpdate({ answer_options: newOptions });
  };

  const renderQuestionTypeSpecificOptions = () => {
    switch (question.question_type) {
      case 'multiple_choice_single':
      case 'multiple_choice_multiple':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswerOption}
                disabled={question.answer_options.length >= 8}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {question.answer_options.map((option, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={option.is_correct ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCorrectAnswer(index)}
                      className="w-8 h-8 p-0"
                      aria-label={`Mark option ${index + 1} as ${option.is_correct ? 'incorrect' : 'correct'}`}
                    >
                      {option.is_correct ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      value={option.option_text}
                      onChange={(e) => updateAnswerOption(index, { option_text: e.target.value })}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="mb-2"
                    />
                    
                    {/* Optional image upload for answer option */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={option.option_image_url || ''}
                        onChange={(e) => updateAnswerOption(index, { option_image_url: e.target.value })}
                        placeholder="Image URL (optional)"
                        className="text-xs"
                      />
                      <Button type="button" variant="ghost" size="sm">
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnswerOption(index)}
                    disabled={question.answer_options.length <= 2}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {question.question_type === 'multiple_choice_multiple' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Multiple Correct Answers</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Learners can select multiple correct answers for this question.
                </p>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-4">
            <Label>Correct Answer</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={question.answer_options[0]?.is_correct ? "default" : "outline"}
                onClick={() => {
                  const newOptions = [
                    { option_text: 'True', is_correct: true, option_order: 0 },
                    { option_text: 'False', is_correct: false, option_order: 1 }
                  ];
                  onUpdate({ answer_options: newOptions });
                }}
                className="h-16"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                True
              </Button>
              <Button
                type="button"
                variant={question.answer_options[1]?.is_correct ? "default" : "outline"}
                onClick={() => {
                  const newOptions = [
                    { option_text: 'True', is_correct: false, option_order: 0 },
                    { option_text: 'False', is_correct: true, option_order: 1 }
                  ];
                  onUpdate({ answer_options: newOptions });
                }}
                className="h-16"
              >
                <XCircle className="w-5 h-5 mr-2" />
                False
              </Button>
            </div>
          </div>
        );

      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            <div>
              <Label>Correct Answers (one per line)</Label>
              <Textarea
                value={question.answer_options.map(opt => opt.option_text).join('\n')}
                onChange={(e) => {
                  const answers = e.target.value.split('\n').filter(a => a.trim());
                  const newOptions = answers.map((answer, index) => ({
                    option_text: answer.trim(),
                    is_correct: true,
                    option_order: index,
                  }));
                  onUpdate({ answer_options: newOptions });
                }}
                placeholder="Enter acceptable answers, one per line"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add all acceptable variations of the correct answer. Matching is case-insensitive.
              </p>
            </div>
          </div>
        );

      case 'scenario_based':
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Scenario-Based Question</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Create branching scenarios where each answer leads to different outcomes.
              </p>
            </div>
            
            {/* Simplified scenario options for now */}
            <div className="space-y-3">
              {question.answer_options.map((option, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="space-y-2">
                    <Input
                      value={option.option_text}
                      onChange={(e) => updateAnswerOption(index, { option_text: e.target.value })}
                      placeholder={`Scenario option ${index + 1}`}
                    />
                    <Textarea
                      value={option.explanation || ''}
                      onChange={(e) => updateAnswerOption(index, { explanation: e.target.value })}
                      placeholder="Outcome description"
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={option.is_correct}
                          onCheckedChange={(checked) => updateAnswerOption(index, { is_correct: checked })}
                        />
                        <Label className="text-sm">Preferred outcome</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnswerOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAnswerOption}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Scenario Option
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Question type "{question.question_type}" editor coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Question {questionIndex + 1}</span>
          <Badge variant="outline">
            {question.question_type.replace(/_/g, ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Question Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              value={question.question_type}
              onValueChange={(value: any) => onUpdate({ question_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice_single">Multiple Choice (Single)</SelectItem>
                <SelectItem value="multiple_choice_multiple">Multiple Choice (Multiple)</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                <SelectItem value="scenario_based">Scenario-Based</SelectItem>
                <SelectItem value="drag_drop" disabled>Drag & Drop (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={question.category}
              onValueChange={(value) => onUpdate({ category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="100"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is-required">Required Question</Label>
            <Switch
              id="is-required"
              checked={question.is_required}
              onCheckedChange={(checked) => onUpdate({ is_required: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Question Content */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              value={question.question_text}
              onChange={(e) => onUpdate({ question_text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Media Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="question-image">Question Image URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="question-image"
                  value={question.question_image_url || ''}
                  onChange={(e) => onUpdate({ question_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="question-video">Question Video URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="question-video"
                  value={question.question_video_url || ''}
                  onChange={(e) => onUpdate({ question_video_url: e.target.value })}
                  placeholder="https://vimeo.com/123456789"
                />
                <Button type="button" variant="outline" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Question Type Specific Options */}
        {renderQuestionTypeSpecificOptions()}

        <Separator />

        {/* Feedback and Explanations */}
        <div className="space-y-4">
          <h4 className="font-semibold">Feedback & Explanations</h4>
          
          <div>
            <Label htmlFor="correct-feedback">Correct Answer Feedback</Label>
            <Textarea
              id="correct-feedback"
              value={question.correct_feedback}
              onChange={(e) => onUpdate({ correct_feedback: e.target.value })}
              placeholder="Message shown when the learner answers correctly"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="incorrect-feedback">Incorrect Answer Feedback</Label>
            <Textarea
              id="incorrect-feedback"
              value={question.incorrect_feedback}
              onChange={(e) => onUpdate({ incorrect_feedback: e.target.value })}
              placeholder="Message shown when the learner answers incorrectly"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="explanation">General Explanation (optional)</Label>
            <Textarea
              id="explanation"
              value={question.explanation}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Additional explanation always shown after answering"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};