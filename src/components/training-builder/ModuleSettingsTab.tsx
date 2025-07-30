import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Settings,
  Globe,
  Shield,
  Award,
  Clock,
  Users,
  Tag,
  Briefcase,
  GraduationCap,
  X,
  Plus,
  HelpCircle,
  Info,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThumbnailUploader } from "@/components/training/ThumbnailUploader";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  industry: string;
  target_roles: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_completion_time: number;
  scorm_compatible: boolean;
  scorm_version?: '1.2' | '2004';
  accessibility_compliant: boolean;
  thumbnail_url?: string;
  metadata: {
    learning_objectives: string[];
    prerequisites: string[];
    completion_criteria: {
      min_score: number;
      required_scenes: string[];
      time_requirements?: {
        min_time_spent: number;
        max_time_allowed?: number;
      };
    };
    certificate_template?: string;
  };
}

interface ModuleSettingsTabProps {
  module: TrainingModule;
  onModuleUpdate: (module: TrainingModule) => void;
}

export const ModuleSettingsTab = ({ module, onModuleUpdate }: ModuleSettingsTabProps) => {
  const [newTag, setNewTag] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [hasCompletionCriteria, setHasCompletionCriteria] = useState(true);
  const { toast } = useToast();

  // Auto-save removed per El Jefe's request
  const updateModule = (updates: Partial<TrainingModule>) => {
    console.log('🔄 updateModule called with updates:', updates);
    console.log('📍 Current route before update');
    
    const updatedModule = { ...module, ...updates };
    console.log('📝 Updated module data:', {
      id: updatedModule.id,
      title: updatedModule.title,
      category: updatedModule.category
    });
    
    onModuleUpdate(updatedModule);
    console.log('✅ onModuleUpdate called - NO AUTO-SAVE');
    // Removed auto-save - will only save when explicitly requested
  };

  // Manual save function - only called when user explicitly saves
  const saveModuleToDatabase = async (moduleData: TrainingModule) => {
    try {
      console.log('🔄 Manual save to database:', moduleData.id, moduleData.title, 'Category:', moduleData.category);
      
      const { error, data } = await supabase
        .from('training_modules')
        .upsert({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          category: moduleData.category,
          tags: moduleData.tags,
          difficulty_level: moduleData.difficulty_level,
          estimated_completion_time: moduleData.estimated_completion_time,
          scorm_compatible: moduleData.scorm_compatible,
          scorm_version: moduleData.scorm_version,
          accessibility_compliant: moduleData.accessibility_compliant,
          thumbnail_url: moduleData.thumbnail_url,
          metadata: moduleData.metadata,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('❌ Error saving module:', error);
        toast({
          title: "Save Error",
          description: "Failed to save settings: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ Module saved successfully:', data);
        toast({
          title: "Settings Saved",
          description: "Your training module settings have been saved successfully",
        });
      }
    } catch (error) {
      console.error('❌ Error saving module:', error);
      toast({
        title: "Save Error", 
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    }
  };


  const updateMetadata = (updates: Partial<TrainingModule['metadata']>) => {
    updateModule({
      metadata: { ...module.metadata, ...updates }
    });
  };

  const addTag = () => {
    if (newTag.trim() && !module.tags.includes(newTag.trim())) {
      updateModule({ tags: [...module.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateModule({ tags: module.tags.filter(tag => tag !== tagToRemove) });
  };

  const addRole = () => {
    if (newRole.trim() && !module.target_roles.includes(newRole.trim())) {
      updateModule({ target_roles: [...module.target_roles, newRole.trim()] });
      setNewRole("");
    }
  };

  const removeRole = (roleToRemove: string) => {
    updateModule({ target_roles: module.target_roles.filter(role => role !== roleToRemove) });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      updateMetadata({
        learning_objectives: [...(module.metadata?.learning_objectives || []), newObjective.trim()]
      });
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = (module.metadata?.learning_objectives || []).filter((_, i) => i !== index);
    updateMetadata({ learning_objectives: updatedObjectives });
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      updateMetadata({
        prerequisites: [...(module.metadata?.prerequisites || []), newPrerequisite.trim()]
      });
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    const updatedPrerequisites = (module.metadata?.prerequisites || []).filter((_, i) => i !== index);
    updateMetadata({ prerequisites: updatedPrerequisites });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-4 h-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="module-title">Module Title</Label>
            <Input
              id="module-title"
              value={module.title}
              onChange={(e) => {
                console.log('📝 Title input changed:', e.target.value);
                console.log('📍 About to call updateModule for title');
                updateModule({ title: e.target.value });
                console.log('✅ updateModule call completed for title');
              }}
              placeholder="Enter training module title"
            />
          </div>

          <div>
            <Label htmlFor="module-description">Description</Label>
            <Textarea
              id="module-description"
              value={module.description}
              onChange={(e) => updateModule({ description: e.target.value })}
              placeholder="Describe what learners will gain from this training"
              rows={3}
            />
          </div>

          <ThumbnailUploader
            currentThumbnail={module.thumbnail_url || ""}
            sceneTitle={module.title}
            sceneDescription={module.description}
            onThumbnailChange={(url) => updateModule({ thumbnail_url: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={module.category || 'General'} 
                onValueChange={(value) => {
                  console.log('📝 Category changed:', value);
                  console.log('📍 About to call updateModule for category');
                  updateModule({ category: value });
                  console.log('✅ updateModule call completed for category');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Diversity & Inclusion">Diversity & Inclusion</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={module.difficulty_level} onValueChange={(value: any) => updateModule({ difficulty_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="completion-time">Estimated Completion Time (minutes)</Label>
            <Input
              id="completion-time"
              type="number"
              min="1"
              value={module.estimated_completion_time}
              onChange={(e) => updateModule({ estimated_completion_time: parseInt(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization & Targeting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-4 h-4" />
            Localization & Targeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Primary Language</Label>
              <Select value={module.language} onValueChange={(value) => updateModule({ language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={module.industry} onValueChange={(value) => updateModule({ industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Tags</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">What are tags?</p>
                      <p className="text-sm">Tags help categorize and search for training modules. Use keywords that describe the content.</p>
                      <div className="text-sm">
                        <p className="font-medium text-primary">Examples:</p>
                        <p>• "safety", "harassment", "compliance"</p>
                        <p>• "new-hire", "annual", "refresher"</p>
                        <p>• "california", "federal", "osha"</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {module.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Target Roles</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">Who should take this training?</p>
                      <p className="text-sm">Specify job roles or departments that need this training.</p>
                      <div className="text-sm">
                        <p className="font-medium text-primary">Examples:</p>
                        <p>• "Manager", "Supervisor", "Team Lead"</p>
                        <p>• "HR Staff", "Safety Officer", "Security"</p>
                        <p>• "All Employees", "New Hires", "Contractors"</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {module.target_roles.map((role) => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {role}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeRole(role)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add target role..."
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRole()}
              />
              <Button variant="outline" onClick={addRole}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-4 h-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Learning Objectives</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">What will learners achieve?</p>
                      <p className="text-sm">Clear, measurable outcomes learners will achieve after completing this training.</p>
                      <div className="text-sm">
                        <p className="font-medium text-primary">Examples:</p>
                        <p>• "Identify workplace violence warning signs"</p>
                        <p>• "Demonstrate proper lifting techniques"</p>
                        <p>• "Explain company harassment policies"</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-1 mb-2">
              {(module.metadata?.learning_objectives || []).map((objective, index) => (
                <div key={index} className="flex items-center gap-2 p-1.5 bg-muted rounded text-sm">
                  <span className="flex-1">{objective}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add learning objective..."
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                className="text-sm"
              />
              <Button variant="outline" size="sm" onClick={addObjective}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Prerequisites</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">What's needed before starting?</p>
                      <p className="text-sm">Knowledge, training, or experience learners should have before taking this course.</p>
                      <div className="text-sm">
                        <p className="font-medium text-primary">Examples:</p>
                        <p>• "Basic Safety Orientation completed"</p>
                        <p>• "6 months work experience"</p>
                        <p>• "Manager approval required"</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-1 mb-2">
              {(module.metadata?.prerequisites || []).map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-2 p-1.5 bg-muted rounded text-sm">
                  <span className="flex-1">{prerequisite}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removePrerequisite(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add prerequisite..."
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                className="text-sm"
              />
              <Button variant="outline" size="sm" onClick={addPrerequisite}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-4 h-4" />
            Completion Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="completion-criteria-toggle">Enable Custom Completion Criteria</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      When enabled, learners must meet specific requirements. When disabled, 
                      learners must complete the entire course to receive a certificate.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="completion-criteria-toggle"
              checked={hasCompletionCriteria}
              onCheckedChange={setHasCompletionCriteria}
            />
          </div>

          {!hasCompletionCriteria && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Default Completion Requirement</p>
                <p>Learners must complete the entire course to receive a training certificate.</p>
              </div>
            </div>
          )}

          {hasCompletionCriteria && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="min-score" className="text-sm">Min Score (%)</Label>
                  <Input
                    id="min-score"
                    type="number"
                    min="0"
                    max="100"
                     value={module.metadata?.completion_criteria?.min_score || 80}
                     onChange={(e) => updateMetadata({
                       completion_criteria: {
                         ...module.metadata?.completion_criteria,
                         min_score: parseInt(e.target.value) || 80
                       }
                     })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="min-time" className="text-sm">Min Time (min)</Label>
                  <Input
                    id="min-time"
                    type="number"
                    min="0"
                     value={module.metadata?.completion_criteria?.time_requirements?.min_time_spent || 0}
                     onChange={(e) => updateMetadata({
                       completion_criteria: {
                         ...module.metadata?.completion_criteria,
                         time_requirements: {
                           ...module.metadata?.completion_criteria?.time_requirements,
                           min_time_spent: parseInt(e.target.value) || 0
                         }
                       }
                     })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max-time" className="text-sm">Max Time (optional)</Label>
                <Input
                  id="max-time"
                  type="number"
                  min="0"
                   value={module.metadata?.completion_criteria?.time_requirements?.max_time_allowed || ''}
                   onChange={(e) => updateMetadata({
                     completion_criteria: {
                       ...module.metadata?.completion_criteria,
                       time_requirements: {
                         ...module.metadata?.completion_criteria?.time_requirements,
                         max_time_allowed: e.target.value ? parseInt(e.target.value) : undefined
                       }
                     }
                   })}
                  placeholder="No limit"
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SCORM & Accessibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-4 h-4" />
            Standards & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="scorm-compatible"
              checked={module.scorm_compatible}
              onCheckedChange={(checked) => updateModule({ scorm_compatible: checked })}
            />
            <Label htmlFor="scorm-compatible">SCORM Compatible</Label>
          </div>

          {module.scorm_compatible && (
            <div>
              <Label htmlFor="scorm-version">SCORM Version</Label>
              <Select value={module.scorm_version} onValueChange={(value: any) => updateModule({ scorm_version: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select SCORM version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">SCORM 1.2</SelectItem>
                  <SelectItem value="2004">SCORM 2004</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="accessibility-compliant"
              checked={module.accessibility_compliant}
              onCheckedChange={(checked) => updateModule({ accessibility_compliant: checked })}
            />
            <Label htmlFor="accessibility-compliant">WCAG 2.2 AA Compliant</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};