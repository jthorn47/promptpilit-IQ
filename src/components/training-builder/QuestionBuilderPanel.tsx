import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, Plus, X, GripVertical } from "lucide-react";

interface Question {
  id: string;
  timestamp: string;
  questionText: string;
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
}

interface QuestionBuilderPanelProps {
  sceneId?: string;
  currentTime?: number;
  onAddQuestion?: (question: Question) => void;
  moduleName?: string;
  onModuleNameChange?: (name: string) => void;
}

export const QuestionBuilderPanel = ({ 
  sceneId, 
  currentTime = 0,
  onAddQuestion,
  moduleName,
  onModuleNameChange
}: QuestionBuilderPanelProps) => {
  const [timestamp, setTimestamp] = useState("00:00");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { id: 1, text: "Option 1", isCorrect: false },
    { id: 2, text: "Option 2", isCorrect: true },
    { id: 3, text: "Option 3", isCorrect: false },
    { id: 4, text: "Option 4", isCorrect: false },
  ]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Training settings
  const [trainingTitle, setTrainingTitle] = useState(moduleName || "New Training Module");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Sync with external module name
  useEffect(() => {
    if (moduleName) {
      setTrainingTitle(moduleName);
    }
  }, [moduleName]);

  const handleTrainingTitleChange = (newTitle: string) => {
    setTrainingTitle(newTitle);
    onModuleNameChange?.(newTitle);
  };

  useEffect(() => {
    if (currentTime > 0) {
      const mins = Math.floor(currentTime / 60);
      const secs = Math.floor(currentTime % 60);
      setTimestamp(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionChange = (optionId: number, text: string) => {
    setOptions(options.map(option => 
      option.id === optionId ? { ...option, text } : option
    ));
  };

  const handleCorrectAnswerChange = (optionId: number) => {
    setOptions(options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    })));
  };

  const addOption = () => {
    const newId = Math.max(...options.map(o => o.id)) + 1;
    setOptions([...options, { id: newId, text: `Option ${newId}`, isCorrect: false }]);
  };

  const removeOption = (optionId: number) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== optionId));
    }
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      timestamp,
      questionText,
      options: [...options]
    };

    setQuestions([...questions, newQuestion]);
    onAddQuestion?.(newQuestion);
    
    // Reset form
    setQuestionText("");
    setOptions([
      { id: 1, text: "Option 1", isCorrect: false },
      { id: 2, text: "Option 2", isCorrect: true },
      { id: 3, text: "Option 3", isCorrect: false },
      { id: 4, text: "Option 4", isCorrect: false },
    ]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Question builder</h2>
      
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions" className="text-primary data-[state=active]:text-primary">
            Questions
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-6">
          {/* Existing Questions */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Added Questions ({questions.length})</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {question.timestamp}
                        </span>
                        <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{question.questionText}</p>
                      <p className="text-xs text-muted-foreground">
                        {question.options.filter(o => o.isCorrect).length} correct answer(s)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* New Question Form */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Add New Question</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timestamp */}
              <div>
                <Label htmlFor="timestamp" className="text-sm font-medium">
                  Timestamp
                </Label>
                <Input
                  id="timestamp"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="mt-1 font-mono text-lg"
                  placeholder="00:00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current video time: {formatTime(currentTime)}
                </p>
              </div>

              {/* Question Text */}
              <div>
                <Label htmlFor="question" className="text-sm font-medium">
                  Question text
                </Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              {/* Options */}
              <div>
                <Label className="text-sm font-medium">Answer Options</Label>
                <RadioGroup 
                  value={options.find(o => o.isCorrect)?.id.toString()} 
                  onValueChange={(value) => handleCorrectAnswerChange(parseInt(value))}
                  className="space-y-3 mt-2"
                >
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <RadioGroupItem 
                        value={option.id.toString()} 
                        id={`option-${option.id}`}
                        className="data-[state=checked]:text-primary data-[state=checked]:border-primary"
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        className="flex-1"
                        placeholder={`Option ${option.id}`}
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(option.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                
                {options.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              {/* Add Question Button */}
              <Button 
                onClick={handleAddQuestion}
                disabled={!questionText.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Add Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Training Settings</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="training-title">Training Title</Label>
                <Input
                  id="training-title"
                  value={trainingTitle}
                  onChange={(e) => handleTrainingTitleChange(e.target.value)}
                  placeholder="Enter training title"
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category / Tags</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Safety, Compliance, HR..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-toggle">Public Training</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this training available to all users
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Accessibility Features</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Subtitle Files</Label>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload .VTT subtitle file
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload .SRT subtitle file
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="alt-text">Video Description (Alt-text)</Label>
                <Textarea
                  id="alt-text"
                  placeholder="Describe the video content for screen readers..."
                  rows={4}
                />
              </div>

              <div>
                <Label>WCAG Compliance Checklist</Label>
                <div className="mt-2 space-y-3">
                  {[
                    "Video has captions/subtitles",
                    "Audio description available",
                    "Sufficient color contrast",
                    "Keyboard navigation support",
                    "Screen reader compatible"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input type="checkbox" id={`wcag-${index}`} className="rounded" />
                      <Label htmlFor={`wcag-${index}`} className="text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};