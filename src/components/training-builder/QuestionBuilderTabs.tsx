import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SceneQuestionManager } from "../SceneQuestionManager";
import { Clock, Settings, Lock, Users, CheckCircle, Timer } from "lucide-react";

interface QuestionBuilderTabsProps {
  currentScene: any;
  onClose: () => void;
}

export const QuestionBuilderTabs = ({ currentScene, onClose }: QuestionBuilderTabsProps) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'access'>('questions');
  
  // Settings state
  const [questionSettings, setQuestionSettings] = useState({
    autoAdvance: false,
    timeLimit: 0,
    randomizeQuestions: false,
    randomizeAnswers: false,
    passingScore: 80,
    allowRetries: true,
    maxRetries: 3,
    showCorrectAnswers: true,
    showScoreAfterEach: false
  });

  // Access state
  const [accessSettings, setAccessSettings] = useState({
    accessType: 'all_users' as 'all_users' | 'specific_roles' | 'specific_users',
    requiredRoles: [] as string[],
    specificUsers: [] as string[],
    prerequisites: [] as string[],
    startDate: '',
    endDate: '',
    maxAttempts: 0
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questions':
        return (
          <div className="p-4 h-full">
            {currentScene ? (
              <SceneQuestionManager
                sceneId={currentScene.id}
                sceneName={currentScene.title}
                onClose={onClose}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Select a scene to add questions</p>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Question Settings
              </h3>
              
              <div className="space-y-4">
                {/* Time Limit */}
                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Time Limit (minutes)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={questionSettings.timeLimit}
                    onChange={(e) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      timeLimit: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0 = No limit"
                  />
                </div>

                {/* Auto Advance */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoAdvance" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Auto-advance after answering
                  </Label>
                  <Switch
                    id="autoAdvance"
                    checked={questionSettings.autoAdvance}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      autoAdvance: checked 
                    }))}
                  />
                </div>

                {/* Randomize Questions */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="randomizeQuestions">Randomize question order</Label>
                  <Switch
                    id="randomizeQuestions"
                    checked={questionSettings.randomizeQuestions}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      randomizeQuestions: checked 
                    }))}
                  />
                </div>

                {/* Randomize Answers */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="randomizeAnswers">Randomize answer choices</Label>
                  <Switch
                    id="randomizeAnswers"
                    checked={questionSettings.randomizeAnswers}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      randomizeAnswers: checked 
                    }))}
                  />
                </div>

                {/* Passing Score */}
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={questionSettings.passingScore}
                    onChange={(e) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      passingScore: parseInt(e.target.value) || 80 
                    }))}
                  />
                </div>

                {/* Retries */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowRetries">Allow retries</Label>
                  <Switch
                    id="allowRetries"
                    checked={questionSettings.allowRetries}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      allowRetries: checked 
                    }))}
                  />
                </div>

                {questionSettings.allowRetries && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="maxRetries">Maximum retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min="1"
                      value={questionSettings.maxRetries}
                      onChange={(e) => setQuestionSettings(prev => ({ 
                        ...prev, 
                        maxRetries: parseInt(e.target.value) || 3 
                      }))}
                    />
                  </div>
                )}

                {/* Show Correct Answers */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCorrectAnswers">Show correct answers after quiz</Label>
                  <Switch
                    id="showCorrectAnswers"
                    checked={questionSettings.showCorrectAnswers}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      showCorrectAnswers: checked 
                    }))}
                  />
                </div>

                {/* Show Score After Each */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="showScoreAfterEach">Show score after each question</Label>
                  <Switch
                    id="showScoreAfterEach"
                    checked={questionSettings.showScoreAfterEach}
                    onCheckedChange={(checked) => setQuestionSettings(prev => ({ 
                      ...prev, 
                      showScoreAfterEach: checked 
                    }))}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full">Save Settings</Button>
          </div>
        );

      case 'access':
        return (
          <div className="p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Access Control
              </h3>
              
              <div className="space-y-4">
                {/* Access Type */}
                <div className="space-y-2">
                  <Label>Who can access this training?</Label>
                  <Select
                    value={accessSettings.accessType}
                    onValueChange={(value: 'all_users' | 'specific_roles' | 'specific_users') => 
                      setAccessSettings(prev => ({ ...prev, accessType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="specific_roles">Specific Roles</SelectItem>
                      <SelectItem value="specific_users">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role-based Access */}
                {accessSettings.accessType === 'specific_roles' && (
                  <div className="space-y-2">
                    <Label>Required Roles</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {accessSettings.requiredRoles.map((role, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {role}
                          <button
                            onClick={() => setAccessSettings(prev => ({
                              ...prev,
                              requiredRoles: prev.requiredRoles.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (!accessSettings.requiredRoles.includes(value)) {
                          setAccessSettings(prev => ({
                            ...prev,
                            requiredRoles: [...prev.requiredRoles, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company_admin">Company Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User-specific Access */}
                {accessSettings.accessType === 'specific_users' && (
                  <div className="space-y-2">
                    <Label>Specific Users</Label>
                    <Textarea
                      placeholder="Enter email addresses, one per line"
                      value={accessSettings.specificUsers.join('\n')}
                      onChange={(e) => setAccessSettings(prev => ({
                        ...prev,
                        specificUsers: e.target.value.split('\n').filter(email => email.trim())
                      }))}
                    />
                  </div>
                )}

                {/* Prerequisites */}
                <div className="space-y-2">
                  <Label>Prerequisites</Label>
                  <Textarea
                    placeholder="List any required training modules or certifications"
                    value={accessSettings.prerequisites.join('\n')}
                    onChange={(e) => setAccessSettings(prev => ({
                      ...prev,
                      prerequisites: e.target.value.split('\n').filter(req => req.trim())
                    }))}
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Available From</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={accessSettings.startDate}
                      onChange={(e) => setAccessSettings(prev => ({ 
                        ...prev, 
                        startDate: e.target.value 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Available Until</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={accessSettings.endDate}
                      onChange={(e) => setAccessSettings(prev => ({ 
                        ...prev, 
                        endDate: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                {/* Max Attempts */}
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="0"
                    value={accessSettings.maxAttempts}
                    onChange={(e) => setAccessSettings(prev => ({ 
                      ...prev, 
                      maxAttempts: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0 = Unlimited"
                  />
                </div>
              </div>
            </div>

            <Button className="w-full">Save Access Settings</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className="p-4 border-b">
        <div className="flex gap-6">
          <button 
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'questions' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('questions')}
          >
            <Users className="w-4 h-4" />
            Questions
          </button>
          <button 
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'settings' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            className={`pb-2 border-b-2 flex items-center gap-2 ${
              activeTab === 'access' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('access')}
          >
            <Lock className="w-4 h-4" />
            Access
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </Card>
  );
};