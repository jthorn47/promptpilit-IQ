import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Upload,
  Download,
  Filter,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionEditor } from "./QuestionEditor";

export interface Question {
  id: string;
  scene_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'scenario';
  question_text: string;
  options: QuestionOption[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  time_limit?: number;
  media_url?: string;
  media_type?: 'image' | 'video';
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  order_index: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
  order_index: number;
}

interface QuestionManagerProps {
  sceneId: string;
  onClose: () => void;
}

export const QuestionManager = ({ sceneId, onClose }: QuestionManagerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [sceneId]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedType, selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_scene_questions")
        .select("*")
        .eq("scene_id", sceneId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Convert database format to Question format
      const questionData = (data || []).map(item => ({
        ...item,
        options: Array.isArray(item.options) ? item.options as unknown as QuestionOption[] : [],
        correct_answer: item.correct_answer,
      })) as Question[];
      setQuestions(questionData);
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

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((q) => q.question_type === selectedType);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("training_scene_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      const duplicatedQuestion = {
        scene_id: question.scene_id,
        question_type: question.question_type,
        question_text: `${question.question_text} (Copy)`,
        options: question.options as any, // Convert to JSONB
        correct_answer: question.correct_answer as any, // Convert to JSONB
        explanation: question.explanation,
        points: question.points,
        time_limit: question.time_limit,
        media_url: question.media_url,
        media_type: question.media_type,
        tags: question.tags,
        difficulty: question.difficulty,
        order_index: questions.length,
        is_required: question.is_required,
      };

      const { error } = await supabase
        .from("training_scene_questions")
        .insert([duplicatedQuestion]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question duplicated successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error("Error duplicating question:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate question",
        variant: "destructive",
      });
    }
  };

  const handleQuestionSaved = () => {
    setIsEditorOpen(false);
    fetchQuestions();
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <HelpCircle className="w-4 h-4" />;
      case 'true_false':
        return <CheckCircle className="w-4 h-4" />;
      case 'scenario':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'true_false':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'scenario':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Management</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Type: {selectedType === "all" ? "All" : selectedType.replace("_", " ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border shadow-md">
                  <DropdownMenuItem onClick={() => setSelectedType("all")}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedType("multiple_choice")}>
                    Multiple Choice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("true_false")}>
                    True/False
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType("scenario")}>
                    Scenario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Difficulty: {selectedDifficulty === "all" ? "All" : selectedDifficulty}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border shadow-md">
                  <DropdownMenuItem onClick={() => setSelectedDifficulty("all")}>
                    All Difficulties
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedDifficulty("easy")}>
                    Easy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedDifficulty("medium")}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedDifficulty("hard")}>
                    Hard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questions found</p>
                <p className="text-sm">Add your first question to get started</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getQuestionTypeIcon(question.question_type)}
                          <h3 className="font-medium truncate">
                            {question.question_text}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getQuestionTypeColor(question.question_type)}>
                            {question.question_type.replace("_", " ")}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          {question.is_required && (
                            <Badge variant="outline">Required</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {question.points} points
                          </span>
                        </div>

                        {question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {question.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border shadow-md">
                          <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateQuestion(question)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Question Statistics */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Question Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="ml-2 font-medium">{questions.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Points:</span>
                <span className="ml-2 font-medium">
                  {questions.reduce((sum, q) => sum + q.points, 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Required:</span>
                <span className="ml-2 font-medium">
                  {questions.filter(q => q.is_required).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">With Media:</span>
                <span className="ml-2 font-medium">
                  {questions.filter(q => q.media_url).length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>
          <QuestionEditor
            sceneId={sceneId}
            question={editingQuestion}
            onSave={handleQuestionSaved}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};