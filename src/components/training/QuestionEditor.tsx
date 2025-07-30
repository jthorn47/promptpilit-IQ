import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Upload,
  X,
  GripVertical,
  Image as ImageIcon,
  Video,
  Save,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Question, QuestionOption } from "./QuestionManager";
import { QuestionPresentation } from "./QuestionPresentation";

interface QuestionEditorProps {
  sceneId: string;
  question?: Question | null;
  onSave: () => void;
  onCancel: () => void;
}

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'scenario', label: 'Scenario-based' },
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const QuestionEditor = ({ sceneId, question, onSave, onCancel }: QuestionEditorProps) => {
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "multiple_choice" as Question['question_type'],
    explanation: "",
    points: 10,
    time_limit: 60,
    difficulty: "medium" as Question['difficulty'],
    is_required: true,
    media_url: "",
    media_type: "image" as "image" | "video" | undefined,
    tags: [] as string[],
  });

  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const { toast } = useToast();

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        explanation: question.explanation || "",
        points: question.points,
        time_limit: question.time_limit || 60,
        difficulty: question.difficulty,
        is_required: question.is_required,
        media_url: question.media_url || "",
        media_type: question.media_type,
        tags: question.tags || [],
      });
      setOptions(question.options || []);
      setCorrectAnswers(
        Array.isArray(question.correct_answer) 
          ? question.correct_answer 
          : [question.correct_answer as string]
      );
    } else {
      // Initialize with default options for new questions
      initializeDefaultOptions();
    }
  }, [question]);

  const initializeDefaultOptions = () => {
    if (formData.question_type === 'multiple_choice') {
      setOptions([
        { id: '1', text: '', is_correct: false, order_index: 0 },
        { id: '2', text: '', is_correct: false, order_index: 1 },
        { id: '3', text: '', is_correct: false, order_index: 2 },
        { id: '4', text: '', is_correct: false, order_index: 3 },
      ]);
    } else if (formData.question_type === 'true_false') {
      setOptions([
        { id: 'true', text: 'True', is_correct: false, order_index: 0 },
        { id: 'false', text: 'False', is_correct: false, order_index: 1 },
      ]);
    } else {
      setOptions([]);
    }
    setCorrectAnswers([]);
  };

  const handleQuestionTypeChange = (type: Question['question_type']) => {
    setFormData(prev => ({ ...prev, question_type: type }));
    setOptions([]);
    setCorrectAnswers([]);
    
    if (type === 'multiple_choice') {
      setOptions([
        { id: '1', text: '', is_correct: false, order_index: 0 },
        { id: '2', text: '', is_correct: false, order_index: 1 },
        { id: '3', text: '', is_correct: false, order_index: 2 },
        { id: '4', text: '', is_correct: false, order_index: 3 },
      ]);
    } else if (type === 'true_false') {
      setOptions([
        { id: 'true', text: 'True', is_correct: false, order_index: 0 },
        { id: 'false', text: 'False', is_correct: false, order_index: 1 },
      ]);
    }
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: Date.now().toString(),
      text: '',
      is_correct: false,
      order_index: options.length,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (optionId: string, field: keyof QuestionOption, value: any) => {
    setOptions(options.map(option => 
      option.id === optionId ? { ...option, [field]: value } : option
    ));
  };

  const removeOption = (optionId: string) => {
    setOptions(options.filter(option => option.id !== optionId));
    setCorrectAnswers(correctAnswers.filter(id => id !== optionId));
  };

  const handleCorrectAnswerChange = (optionId: string, isCorrect: boolean) => {
    if (formData.question_type === 'multiple_choice') {
      // Allow multiple correct answers for multiple choice
      if (isCorrect) {
        setCorrectAnswers([...correctAnswers, optionId]);
      } else {
        setCorrectAnswers(correctAnswers.filter(id => id !== optionId));
      }
    } else {
      // Single correct answer for true/false and scenario
      setCorrectAnswers(isCorrect ? [optionId] : []);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedOptions = items.map((option, index) => ({
      ...option,
      order_index: index,
    }));

    setOptions(reorderedOptions);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag] 
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('training-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        media_url: publicUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
      }));

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    if (options.length > 0 && correctAnswers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one correct answer",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const questionData = {
        scene_id: sceneId,
        question_type: formData.question_type,
        question_text: formData.question_text,
        options: options,
        correct_answer: formData.question_type === 'multiple_choice' && correctAnswers.length > 1 
          ? correctAnswers 
          : correctAnswers[0] || '',
        explanation: formData.explanation || null,
        points: formData.points,
        time_limit: formData.time_limit || null,
        media_url: formData.media_url || null,
        media_type: formData.media_type || null,
        tags: formData.tags,
        difficulty: formData.difficulty,
        is_required: formData.is_required,
        order_index: question?.order_index ?? 0,
      };

      // Convert options to the format expected by the database
      const dbQuestionData = {
        scene_id: questionData.scene_id,
        question_type: questionData.question_type,
        question_text: questionData.question_text,
        options: questionData.options as any, // Convert to JSONB
        correct_answer: questionData.correct_answer as any, // Convert to JSONB
        explanation: questionData.explanation,
        points: questionData.points,
        time_limit: questionData.time_limit,
        media_url: questionData.media_url,
        media_type: questionData.media_type,
        tags: questionData.tags,
        difficulty: questionData.difficulty,
        order_index: questionData.order_index,
        is_required: questionData.is_required,
      };

      let error;
      if (question?.id) {
        const { error: updateError } = await supabase
          .from("training_scene_questions")
          .update(dbQuestionData)
          .eq("id", question.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("training_scene_questions")
          .insert([dbQuestionData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Question ${question?.id ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="options">Options & Answers</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question_type">Question Type</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value: Question['question_type']) => 
                      handleQuestionTypeChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: Question['difficulty']) => 
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question_text">Question Text</Label>
                <Textarea
                  id="question_text"
                  placeholder="Enter your question here..."
                  value={formData.question_text}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    question_text: e.target.value 
                  }))}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Provide an explanation for the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    explanation: e.target.value 
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      points: parseInt(e.target.value) || 10 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="10"
                    value={formData.time_limit}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      time_limit: parseInt(e.target.value) || 60 
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="is_required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      is_required: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="is_required">Required Question</Label>
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <Label>Media Attachment (Optional)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Image or Video"}
                  </label>
                  
                  {formData.media_url && (
                    <div className="mt-2 p-2 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {formData.media_type === 'video' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                          <span className="text-sm">Media attached</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            media_url: "", 
                            media_type: undefined 
                          }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button onClick={addTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-2"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Answer Options</CardTitle>
                {formData.question_type === 'multiple_choice' && (
                  <Button onClick={addOption} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {formData.question_type !== 'scenario' && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="options">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {options.map((option, index) => (
                          <Draggable key={option.id} draggableId={option.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 border rounded-lg ${
                                  snapshot.isDragging ? 'bg-muted shadow-lg' : 'bg-background'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground cursor-move"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  
                                  <Checkbox
                                    checked={correctAnswers.includes(option.id)}
                                    onCheckedChange={(checked) => 
                                      handleCorrectAnswerChange(option.id, checked as boolean)
                                    }
                                  />
                                  
                                  <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                                    className="flex-1"
                                    disabled={formData.question_type === 'true_false'}
                                  />
                                  
                                  {formData.question_type === 'multiple_choice' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(option.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Option explanation */}
                                <div className="mt-2 ml-7">
                                  <Input
                                    placeholder="Optional explanation for this option"
                                    value={option.explanation || ''}
                                    onChange={(e) => updateOption(option.id, 'explanation', e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
              
              {formData.question_type === 'scenario' && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Scenario questions don't require predefined options.</p>
                  <p className="text-sm">Learners will provide their own responses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionPresentation
                question={{
                  id: 'preview',
                  title: formData.question_text,
                  type: formData.question_type === 'multiple_choice' ? 'multiple_choice_single' : formData.question_type as any,
                  options: options.map(opt => ({ id: opt.id, text: opt.text, isCorrect: opt.is_correct })),
                  imageUrl: formData.media_type === 'image' ? formData.media_url : undefined,
                  videoUrl: formData.media_type === 'video' ? formData.media_url : undefined,
                  explanation: formData.explanation,
                  points: formData.points,
                }}
                currentQuestionIndex={0}
                totalQuestions={1}
                onAnswer={() => {}}
                onNext={() => {}}
                showFeedback={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Question"}
        </Button>
      </div>
    </div>
  );
};