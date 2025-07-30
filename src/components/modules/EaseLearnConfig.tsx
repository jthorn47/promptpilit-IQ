import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, GraduationCap, BookOpen, Settings, Save, Trophy, Video, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EaseLearnConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const EaseLearnConfig = ({ onBack, clientId }: EaseLearnConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    courseCatalog: true,
    certificationTracking: true,
    progressReports: true,
    gamification: true,
    mobileAccess: true,
    videoStreaming: true,
    assessments: true,
    socialLearning: false,
    aiRecommendations: false,
    customBranding: true,
    multiLanguage: false,
    scormCompliance: true,
    virtualClassrooms: false,
    learningPaths: true,
    maxUsers: 100,
    storageLimit: 50,
    courseRetention: 2
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "EaseLearn settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">EaseLearn Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Core Features
            </CardTitle>
            <CardDescription>
              Enable or disable main learning management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="course-catalog" className="text-sm font-medium">
                Course Catalog
              </Label>
              <Switch
                id="course-catalog"
                checked={config.courseCatalog}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, courseCatalog: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="certification-tracking" className="text-sm font-medium">
                Certification Tracking
              </Label>
              <Switch
                id="certification-tracking"
                checked={config.certificationTracking}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, certificationTracking: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="progress-reports" className="text-sm font-medium">
                Progress Reports
              </Label>
              <Switch
                id="progress-reports"
                checked={config.progressReports}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, progressReports: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="assessments" className="text-sm font-medium">
                Assessments & Quizzes
              </Label>
              <Switch
                id="assessments"
                checked={config.assessments}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, assessments: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="learning-paths" className="text-sm font-medium">
                Learning Paths
              </Label>
              <Switch
                id="learning-paths"
                checked={config.learningPaths}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, learningPaths: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="scorm-compliance" className="text-sm font-medium">
                SCORM Compliance
              </Label>
              <Switch
                id="scorm-compliance"
                checked={config.scormCompliance}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, scormCompliance: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Configure advanced learning and engagement features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gamification" className="text-sm font-medium">
                Gamification
              </Label>
              <Switch
                id="gamification"
                checked={config.gamification}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, gamification: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile-access" className="text-sm font-medium">
                Mobile Access
              </Label>
              <Switch
                id="mobile-access"
                checked={config.mobileAccess}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mobileAccess: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="video-streaming" className="text-sm font-medium">
                Video Streaming
              </Label>
              <Switch
                id="video-streaming"
                checked={config.videoStreaming}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, videoStreaming: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="social-learning" className="text-sm font-medium">
                Social Learning
              </Label>
              <Switch
                id="social-learning"
                checked={config.socialLearning}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, socialLearning: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-recommendations" className="text-sm font-medium">
                AI Recommendations
              </Label>
              <Switch
                id="ai-recommendations"
                checked={config.aiRecommendations}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, aiRecommendations: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="virtual-classrooms" className="text-sm font-medium">
                Virtual Classrooms
              </Label>
              <Switch
                id="virtual-classrooms"
                checked={config.virtualClassrooms}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, virtualClassrooms: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization
            </CardTitle>
            <CardDescription>
              Configure branding and customization options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-branding" className="text-sm font-medium">
                Custom Branding
              </Label>
              <Switch
                id="custom-branding"
                checked={config.customBranding}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, customBranding: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="multi-language" className="text-sm font-medium">
                Multi-language Support
              </Label>
              <Switch
                id="multi-language"
                checked={config.multiLanguage}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, multiLanguage: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system limits and parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-users">Maximum Users</Label>
              <Input
                id="max-users"
                type="number"
                value={config.maxUsers}
                onChange={(e) => setConfig(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                min="1"
                max="10000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
              <Input
                id="storage-limit"
                type="number"
                value={config.storageLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, storageLimit: parseInt(e.target.value) || 0 }))}
                min="1"
                max="1000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-retention">Course Retention (years)</Label>
              <Input
                id="course-retention"
                type="number"
                value={config.courseRetention}
                onChange={(e) => setConfig(prev => ({ ...prev, courseRetention: parseInt(e.target.value) || 0 }))}
                min="1"
                max="10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};