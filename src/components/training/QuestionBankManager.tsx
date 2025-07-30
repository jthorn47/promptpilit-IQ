import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Database,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Import,
  Tag,
  Shuffle,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Question, QuestionOption } from "./QuestionManager";

// Question Bank specific interface matching database schema
interface QuestionBankItem {
  id: string;
  company_id?: string;
  question_type: 'multiple_choice' | 'true_false' | 'scenario';
  question_text: string;
  options: any; // JSONB from database
  correct_answer: any; // JSONB from database
  explanation?: string;
  points: number;
  time_limit?: number;
  media_url?: string;
  media_type?: 'image' | 'video';
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface QuestionBankManagerProps {
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  companyId?: string;
}

export const QuestionBankManager = ({ 
  onSelectQuestions, 
  multiSelect = false,
  companyId 
}: QuestionBankManagerProps) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, companyId]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedTags, selectedType, selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("question_bank")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const questionData = (data || []) as QuestionBankItem[];
      setQuestions(questionData);
      
      // Extract all unique tags
      const tags = new Set<string>();
      questionData.forEach(q => {
        q.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
      
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch question bank",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(q =>
        selectedTags.some(tag => q.tags?.includes(tag))
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(q => q.question_type === selectedType);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    const newSelected = new Set(selectedQuestions);
    
    if (multiSelect) {
      if (selected) {
        newSelected.add(questionId);
      } else {
        newSelected.delete(questionId);
      }
    } else {
      if (selected) {
        newSelected.clear();
        newSelected.add(questionId);
      } else {
        newSelected.clear();
      }
    }
    
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  // Convert QuestionBankItem to Question format for selection
  const convertToQuestion = (bankItem: QuestionBankItem): Question => {
    const parsedOptions = Array.isArray(bankItem.options) 
      ? bankItem.options as QuestionOption[]
      : [];
    
    return {
      id: bankItem.id,
      scene_id: "", // Will be set when added to scene
      question_type: bankItem.question_type,
      question_text: bankItem.question_text,
      options: parsedOptions,
      correct_answer: bankItem.correct_answer,
      explanation: bankItem.explanation,
      points: bankItem.points,
      time_limit: bankItem.time_limit,
      media_url: bankItem.media_url,
      media_type: bankItem.media_type,
      tags: bankItem.tags,
      difficulty: bankItem.difficulty,
      order_index: 0, // Will be set when added to scene
      is_required: false, // Default value
      created_at: bankItem.created_at,
      updated_at: bankItem.updated_at,
    };
  };

  const handleConfirmSelection = () => {
    const selectedQuestionObjects = questions
      .filter(q => selectedQuestions.has(q.id))
      .map(convertToQuestion);
    
    onSelectQuestions?.(selectedQuestionObjects);
    setIsOpen(false);
    setSelectedQuestions(new Set());
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleRandomSelection = (count: number) => {
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, count);
    setSelectedQuestions(new Set(randomSelection.map(q => q.id)));
  };

  const copyToBank = async (question: QuestionBankItem) => {
    try {
      const { error } = await supabase
        .from("question_bank")
        .insert([{
          company_id: companyId,
          question_type: question.question_type,
          question_text: question.question_text + " (Copy)",
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          points: question.points,
          time_limit: question.time_limit,
          media_url: question.media_url,
          media_type: question.media_type,
          tags: question.tags,
          difficulty: question.difficulty,
          is_public: false,
          usage_count: 0,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question copied to bank successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error("Error copying question:", error);
      toast({
        title: "Error",
        description: "Failed to copy question to bank",
        variant: "destructive",
      });
    }
  };

  const deleteFromBank = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question from the bank?")) return;

    try {
      const { error } = await supabase
        .from("question_bank")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted from bank",
      });

      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question from bank",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Database className="w-4 h-4 mr-2" />
          Question Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Question Bank Manager
            {selectedQuestions.size > 0 && (
              <Badge variant="secondary">
                {selectedQuestions.size} selected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
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
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="scenario">Scenario</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              {multiSelect && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Shuffle className="w-4 h-4 mr-2" />
                      Random
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleRandomSelection(5)}>
                      Select 5 Random
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRandomSelection(10)}>
                      Select 10 Random
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRandomSelection(20)}>
                      Select 20 Random
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Select All */}
          {multiSelect && filteredQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedQuestions.size === filteredQuestions.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                Select All ({filteredQuestions.length} questions)
              </span>
            </div>
          )}

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questions found in the bank</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedQuestions.has(question.id) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleQuestionSelect(
                    question.id, 
                    !selectedQuestions.has(question.id)
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={(checked) => 
                          handleQuestionSelect(question.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate mb-2">
                          {question.question_text}
                        </h4>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {question.question_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {question.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {question.points} points
                          </span>
                        </div>

                        {question.tags && question.tags.length > 0 && (
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
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => copyToBank(question)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteFromBank(question.id)}
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {filteredQuestions.length} questions • {selectedQuestions.size} selected
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              
              {onSelectQuestions && selectedQuestions.size > 0 && (
                <Button onClick={handleConfirmSelection}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Add Selected Questions
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};