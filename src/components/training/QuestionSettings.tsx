import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Download,
  Upload,
  FileDown,
  FileUp,
  Plus,
  X,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuestionSettings {
  // Scoring Settings
  defaultPoints: number;
  passingScore: number;
  allowPartialCredit: boolean;
  negativeScoringEnabled: boolean;
  
  // Timing Settings
  defaultTimeLimit: number;
  showTimer: boolean;
  allowTimeExtension: boolean;
  
  // Feedback Settings
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScoreAfterEach: boolean;
  customFeedbackMessages: {
    correct: string;
    incorrect: string;
    partialCredit: string;
  };
  
  // Question Behavior
  randomizeOrder: boolean;
  randomizeOptions: boolean;
  allowRetries: boolean;
  maxRetryAttempts: number;
  
  // Advanced Settings
  requiredQuestionPercentage: number;
  autoSubmitOnTimeExpiry: boolean;
  preventBacktracking: boolean;
  enableQuestionBank: boolean;
  
  // Templates
  questionTemplates: QuestionTemplate[];
}

interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  questionType: string;
  defaultOptions: any[];
  settings: any;
}

interface QuestionSettingsProps {
  sceneId: string;
  onSettingsChange?: (settings: QuestionSettings) => void;
}

const defaultSettings: QuestionSettings = {
  defaultPoints: 10,
  passingScore: 70,
  allowPartialCredit: false,
  negativeScoringEnabled: false,
  defaultTimeLimit: 60,
  showTimer: true,
  allowTimeExtension: false,
  showCorrectAnswers: true,
  showExplanations: true,
  showScoreAfterEach: false,
  customFeedbackMessages: {
    correct: "Correct! Well done.",
    incorrect: "That's not correct. Please try again.",
    partialCredit: "Partially correct. Keep going!",
  },
  randomizeOrder: false,
  randomizeOptions: true,
  allowRetries: true,
  maxRetryAttempts: 3,
  requiredQuestionPercentage: 100,
  autoSubmitOnTimeExpiry: true,
  preventBacktracking: false,
  enableQuestionBank: false,
  questionTemplates: [],
};

export const QuestionSettings = ({ sceneId, onSettingsChange }: QuestionSettingsProps) => {
  const [settings, setSettings] = useState<QuestionSettings>(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    questionType: "multiple_choice",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [sceneId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("training_scene_settings")
        .select("settings")
        .eq("scene_id", sceneId)
        .eq("setting_type", "questions")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.settings) {
        // Safely merge settings with proper type checking
        const loadedSettings = data.settings as Partial<QuestionSettings>;
        setSettings({ ...defaultSettings, ...loadedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load question settings",
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("training_scene_settings")
        .upsert({
          scene_id: sceneId,
          setting_type: "questions",
          settings: settings as any, // Convert to JSONB
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question settings saved successfully",
      });

      onSettingsChange?.(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save question settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-settings-${sceneId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...importedSettings });
        toast({
          title: "Success",
          description: "Settings imported successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid settings file",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const addTemplate = () => {
    if (!newTemplate.name) return;

    const template: QuestionTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      questionType: newTemplate.questionType,
      defaultOptions: [],
      settings: {},
    };

    setSettings(prev => ({
      ...prev,
      questionTemplates: [...prev.questionTemplates, template],
    }));

    setNewTemplate({ name: "", description: "", questionType: "multiple_choice" });
  };

  const removeTemplate = (templateId: string) => {
    setSettings(prev => ({
      ...prev,
      questionTemplates: prev.questionTemplates.filter(t => t.id !== templateId),
    }));
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Question Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scoring Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Points per Question</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.defaultPoints}
                    onChange={(e) => updateSetting('defaultPoints', parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.passingScore}
                    onChange={(e) => updateSetting('passingScore', parseInt(e.target.value) || 70)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Partial Credit</Label>
                  <p className="text-sm text-muted-foreground">
                    Give partial points for partially correct answers
                  </p>
                </div>
                <Switch
                  checked={settings.allowPartialCredit}
                  onCheckedChange={(checked) => updateSetting('allowPartialCredit', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Negative Scoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Deduct points for incorrect answers
                  </p>
                </div>
                <Switch
                  checked={settings.negativeScoringEnabled}
                  onCheckedChange={(checked) => updateSetting('negativeScoringEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Time Limit (seconds)</Label>
                <Input
                  type="number"
                  min="10"
                  value={settings.defaultTimeLimit}
                  onChange={(e) => updateSetting('defaultTimeLimit', parseInt(e.target.value) || 60)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Timer</Label>
                  <p className="text-sm text-muted-foreground">
                    Display countdown timer to learners
                  </p>
                </div>
                <Switch
                  checked={settings.showTimer}
                  onCheckedChange={(checked) => updateSetting('showTimer', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Time Extension</Label>
                  <p className="text-sm text-muted-foreground">
                    Let learners request additional time
                  </p>
                </div>
                <Switch
                  checked={settings.allowTimeExtension}
                  onCheckedChange={(checked) => updateSetting('allowTimeExtension', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Submit on Time Expiry</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically submit when time runs out
                  </p>
                </div>
                <Switch
                  checked={settings.autoSubmitOnTimeExpiry}
                  onCheckedChange={(checked) => updateSetting('autoSubmitOnTimeExpiry', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feedback Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Correct Answers</Label>
                  <p className="text-sm text-muted-foreground">
                    Display correct answers after submission
                  </p>
                </div>
                <Switch
                  checked={settings.showCorrectAnswers}
                  onCheckedChange={(checked) => updateSetting('showCorrectAnswers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Explanations</Label>
                  <p className="text-sm text-muted-foreground">
                    Show detailed explanations for answers
                  </p>
                </div>
                <Switch
                  checked={settings.showExplanations}
                  onCheckedChange={(checked) => updateSetting('showExplanations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Score After Each Question</Label>
                  <p className="text-sm text-muted-foreground">
                    Display score immediately after each answer
                  </p>
                </div>
                <Switch
                  checked={settings.showScoreAfterEach}
                  onCheckedChange={(checked) => updateSetting('showScoreAfterEach', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Custom Feedback Messages</Label>
                <div>
                  <Label className="text-sm">Correct Answer Message</Label>
                  <Input
                    value={settings.customFeedbackMessages.correct}
                    onChange={(e) => updateSetting('customFeedbackMessages.correct', e.target.value)}
                    placeholder="Message for correct answers"
                  />
                </div>
                <div>
                  <Label className="text-sm">Incorrect Answer Message</Label>
                  <Input
                    value={settings.customFeedbackMessages.incorrect}
                    onChange={(e) => updateSetting('customFeedbackMessages.incorrect', e.target.value)}
                    placeholder="Message for incorrect answers"
                  />
                </div>
                <div>
                  <Label className="text-sm">Partial Credit Message</Label>
                  <Input
                    value={settings.customFeedbackMessages.partialCredit}
                    onChange={(e) => updateSetting('customFeedbackMessages.partialCredit', e.target.value)}
                    placeholder="Message for partial credit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Randomize Question Order</Label>
                  <p className="text-sm text-muted-foreground">
                    Show questions in random order
                  </p>
                </div>
                <Switch
                  checked={settings.randomizeOrder}
                  onCheckedChange={(checked) => updateSetting('randomizeOrder', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Randomize Answer Options</Label>
                  <p className="text-sm text-muted-foreground">
                    Shuffle answer choices for each question
                  </p>
                </div>
                <Switch
                  checked={settings.randomizeOptions}
                  onCheckedChange={(checked) => updateSetting('randomizeOptions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Retries</Label>
                  <p className="text-sm text-muted-foreground">
                    Let learners retry questions
                  </p>
                </div>
                <Switch
                  checked={settings.allowRetries}
                  onCheckedChange={(checked) => updateSetting('allowRetries', checked)}
                />
              </div>

              {settings.allowRetries && (
                <div>
                  <Label>Maximum Retry Attempts</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxRetryAttempts}
                    onChange={(e) => updateSetting('maxRetryAttempts', parseInt(e.target.value) || 3)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Prevent Backtracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Don't allow going back to previous questions
                  </p>
                </div>
                <Switch
                  checked={settings.preventBacktracking}
                  onCheckedChange={(checked) => updateSetting('preventBacktracking', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question Templates</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, enableQuestionBank: !prev.enableQuestionBank }))}
                >
                  {settings.enableQuestionBank ? "Disable" : "Enable"} Question Bank
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newTemplate.questionType}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, questionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="scenario">Scenario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea
                  placeholder="Template description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={addTemplate} disabled={!newTemplate.name}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>

              {settings.questionTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Saved Templates</Label>
                  {settings.questionTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                        <Badge variant="outline" className="mt-1">
                          {template.questionType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTemplate(template.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import/Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import/Export Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                    id="import-settings"
                  />
                  <label htmlFor="import-settings">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {importing ? "Importing..." : "Import Settings"}
                      </span>
                    </Button>
                  </label>
                </div>
                <Button variant="outline" onClick={resetSettings}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};