import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SceneQuestion {
  id: string;
  scene_id: string;
  question_text: string;
  question_type: 'true_false' | 'multiple_choice';
  question_order: number;
  is_required: boolean;
  points: number;
  explanation: string | null;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
  explanation: string | null;
}

interface SceneQuestionManagerProps {
  sceneId: string;
  sceneName: string;
  onClose: () => void;
}

export const SceneQuestionManager = ({ sceneId, sceneName, onClose }: SceneQuestionManagerProps) => {
  const [questions, setQuestions] = useState<SceneQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SceneQuestion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "multiple_choice" as SceneQuestion['question_type'],
    points: 1,
    is_required: true,
    explanation: "",
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
    true_false_correct: true,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [sceneId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data: questionsData, error: questionsError } = await supabase
        .from("scene_questions")
        .select("*")
        .eq("scene_id", sceneId)
        .order("question_order", { ascending: true });

      if (questionsError) throw questionsError;

      // Fetch options for each question
      const questionsWithOptions = await Promise.all(
        (questionsData || []).map(async (question) => {
          if (question.question_type === 'multiple_choice') {
            const { data: options, error: optionsError } = await supabase
              .from("scene_question_options")
              .select("*")
              .eq("question_id", question.id)
              .order("option_order", { ascending: true });

            if (optionsError) throw optionsError;
            return { ...question, options: options || [] };
          }
          return { ...question, options: [] };
        })
      );

      setQuestions(questionsWithOptions as SceneQuestion[]);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question_text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (formData.question_type === 'multiple_choice') {
      const validOptions = formData.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast({
          title: "Error",
          description: "Multiple choice questions need at least 2 options",
          variant: "destructive",
        });
        return;
      }

      const correctOptions = validOptions.filter(opt => opt.is_correct);
      if (correctOptions.length === 0) {
        toast({
          title: "Error",
          description: "Please mark at least one correct answer",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      const questionData = {
        question_text: formData.question_text,
        question_type: formData.question_type,
        points: Number(formData.points),
        is_required: formData.is_required,
        explanation: formData.explanation || null,
        scene_id: sceneId,
        question_order: editingQuestion ? editingQuestion.question_order : (questions.length + 1),
      };

      let questionId: string;

      if (editingQuestion) {
        const { error } = await supabase
          .from("scene_questions")
          .update(questionData)
          .eq("id", editingQuestion.id);

        if (error) throw error;
        questionId = editingQuestion.id;

        // Delete existing options if editing
        await supabase
          .from("scene_question_options")
          .delete()
          .eq("question_id", questionId);
      } else {
        const { data, error } = await supabase
          .from("scene_questions")
          .insert([questionData])
          .select()
          .single();

        if (error) throw error;
        questionId = data.id;
      }

      // Insert options for multiple choice questions
      if (formData.question_type === 'multiple_choice') {
        const validOptions = formData.options
          .filter(opt => opt.text.trim())
          .map((opt, index) => ({
            question_id: questionId,
            option_text: opt.text,
            is_correct: opt.is_correct,
            option_order: index + 1,
          }));

        if (validOptions.length > 0) {
          const { error: optionsError } = await supabase
            .from("scene_question_options")
            .insert(validOptions);

          if (optionsError) throw optionsError;
        }
      } else {
        // For true/false questions, create two options
        const tfOptions = [
          {
            question_id: questionId,
            option_text: "True",
            is_correct: formData.true_false_correct === true,
            option_order: 1,
          },
          {
            question_id: questionId,
            option_text: "False",
            is_correct: formData.true_false_correct === false,
            option_order: 2,
          }
        ];

        const { error: optionsError } = await supabase
          .from("scene_question_options")
          .insert(tfOptions);

        if (optionsError) throw optionsError;
      }

      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (question: SceneQuestion) => {
    setEditingQuestion(question);
    
    if (question.question_type === 'multiple_choice') {
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        is_required: question.is_required,
        explanation: question.explanation || "",
        options: question.options?.map(opt => ({
          text: opt.option_text,
          is_correct: opt.is_correct,
        })) || [],
        true_false_correct: true,
      });
    } else {
      // True/false question
      const correctOption = question.options?.find(opt => opt.is_correct);
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        is_required: question.is_required,
        explanation: question.explanation || "",
        options: [],
        true_false_correct: correctOption?.option_text === "True",
      });
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("scene_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      is_required: true,
      explanation: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
      true_false_correct: true,
    });
    setEditingQuestion(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: "", is_correct: false }]
    }));
  };

  const updateOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          Loading questions...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Questions - {sceneName}</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? "Edit Question" : "Create Question"}
                  </DialogTitle>
                  <DialogDescription>
                    Add assessment questions for this training scene.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="question_text">Question *</Label>
                    <Textarea
                      id="question_text"
                      placeholder="Enter your question here..."
                      value={formData.question_text}
                      onChange={(e) => handleInputChange('question_text', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="question_type">Question Type</Label>
                      <Select value={formData.question_type} onValueChange={(value) => handleInputChange('question_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        value={formData.points}
                        onChange={(e) => handleInputChange('points', e.target.value)}
                      />
                    </div>
                  </div>

                  {formData.question_type === 'true_false' && (
                    <div>
                      <Label>Correct Answer</Label>
                      <Select 
                        value={formData.true_false_correct ? "true" : "false"} 
                        onValueChange={(value) => handleInputChange('true_false_correct', value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.question_type === 'multiple_choice' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Answer Options</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addOption}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option.text}
                              onChange={(e) => updateOption(index, 'text', e.target.value)}
                              className="flex-1"
                            />
                            <div className="flex items-center space-x-1">
                              <Switch
                                checked={option.is_correct}
                                onCheckedChange={(checked) => updateOption(index, 'is_correct', checked)}
                              />
                              <Label className="text-sm">Correct</Label>
                            </div>
                            {formData.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      placeholder="Explain why this answer is correct..."
                      value={formData.explanation}
                      onChange={(e) => handleInputChange('explanation', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={formData.is_required}
                      onCheckedChange={(checked) => handleInputChange('is_required', checked)}
                    />
                    <Label htmlFor="is_required">Required Question</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isCreating}>
                    {isCreating ? "Saving..." : (editingQuestion ? "Update" : "Create")} Question
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onClose} size="sm">
              Back to Scenes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No questions created yet. Add your first question to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">#{question.question_order}</span>
                      <Badge variant={question.question_type === 'true_false' ? 'secondary' : 'default'} className="text-xs">
                        {question.question_type === 'true_false' ? 'T/F' : 'MC'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{question.points} pts</span>
                      {question.is_required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    
                    <div className="font-medium mb-2">{question.question_text}</div>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={option.id} className="flex items-center space-x-2 text-sm">
                            {option.is_correct ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={option.is_correct ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {String.fromCharCode(65 + optIndex)}. {option.option_text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="mt-2 text-sm text-muted-foreground italic">
                        Explanation: {question.explanation}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};