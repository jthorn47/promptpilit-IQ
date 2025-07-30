import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Upload, Download, Settings, Shield, Clock, Award } from "lucide-react";
import { ScormFileUpload } from "../ScormFileUpload";

interface ScormConfig {
  enabled: boolean;
  version: '1.2' | '2004';
  manifestFile?: string;
  packageUrl?: string;
  launchSettings: {
    autoStart: boolean;
    allowReview: boolean;
    showNavigation: boolean;
    allowBookmarking: boolean;
    maxTimeAllowed?: number;
    timeLimitAction: 'exit' | 'continue' | 'message';
  };
  completionSettings: {
    trackingMode: 'completion_status' | 'success_status' | 'score';
    passingScore?: number;
    maxAttempts?: number;
    allowRetry: boolean;
    saveProgress: boolean;
  };
  dataSettings: {
    trackInteractions: boolean;
    trackObjectives: boolean;
    trackTime: boolean;
    suspendData: boolean;
    studentPreferences: boolean;
  };
  securitySettings: {
    preventCheating: boolean;
    allowPrintScreen: boolean;
    allowRightClick: boolean;
    allowTextSelection: boolean;
    secureMode: boolean;
  };
  displaySettings: {
    width: number;
    height: number;
    resizable: boolean;
    fullscreen: boolean;
    showMenubar: boolean;
    showStatusbar: boolean;
    showToolbar: boolean;
  };
}

interface ScormConfigTabProps {
  config: ScormConfig;
  onConfigChange: (config: ScormConfig) => void;
  isEnabled: boolean;
}

export const ScormConfigTab = ({ config, onConfigChange, isEnabled }: ScormConfigTabProps) => {
  const [activeTab, setActiveTab] = useState('general');

  const updateConfig = (updates: Partial<ScormConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateLaunchSettings = (updates: Partial<ScormConfig['launchSettings']>) => {
    updateConfig({
      launchSettings: { ...config.launchSettings, ...updates }
    });
  };

  const updateCompletionSettings = (updates: Partial<ScormConfig['completionSettings']>) => {
    updateConfig({
      completionSettings: { ...config.completionSettings, ...updates }
    });
  };

  const updateDataSettings = (updates: Partial<ScormConfig['dataSettings']>) => {
    updateConfig({
      dataSettings: { ...config.dataSettings, ...updates }
    });
  };

  const updateSecuritySettings = (updates: Partial<ScormConfig['securitySettings']>) => {
    updateConfig({
      securitySettings: { ...config.securitySettings, ...updates }
    });
  };

  const updateDisplaySettings = (updates: Partial<ScormConfig['displaySettings']>) => {
    updateConfig({
      displaySettings: { ...config.displaySettings, ...updates }
    });
  };

  if (!isEnabled) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">SCORM Not Enabled</h3>
        <p className="text-muted-foreground mb-4">
          Enable SCORM compatibility in the module settings to configure SCORM options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SCORM Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                SCORM Configuration
              </CardTitle>
              <CardDescription>
                Configure SCORM compliance and tracking settings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.enabled ? "default" : "secondary"}>
                SCORM {config.version}
              </Badge>
              {config.packageUrl && (
                <Badge variant="outline" className="text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Package Uploaded
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General SCORM Settings</CardTitle>
              <CardDescription>Basic SCORM package configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scorm-version">SCORM Version</Label>
                  <Select
                    value={config.version}
                    onValueChange={(value: '1.2' | '2004') => updateConfig({ version: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">SCORM 1.2</SelectItem>
                      <SelectItem value="2004">SCORM 2004</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="scorm-enabled"
                    checked={config.enabled}
                    onCheckedChange={(enabled) => updateConfig({ enabled })}
                  />
                  <Label htmlFor="scorm-enabled">Enable SCORM Tracking</Label>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">SCORM Package Upload</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your SCORM package (.zip file containing imsmanifest.xml)
                </p>
                <ScormFileUpload 
                  onFileUploaded={(filePath, fileName) => updateConfig({ packageUrl: filePath, manifestFile: fileName })}
                  currentFilePath={config.packageUrl}
                  currentFileName={config.manifestFile}
                />
              </div>

              {config.manifestFile && (
                <div>
                  <Label>Manifest File</Label>
                  <Input value={config.manifestFile} disabled />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Launch Settings */}
        <TabsContent value="launch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Launch Settings
              </CardTitle>
              <CardDescription>Configure how the SCORM content launches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-start"
                    checked={config.launchSettings.autoStart}
                    onCheckedChange={(autoStart) => updateLaunchSettings({ autoStart })}
                  />
                  <Label htmlFor="auto-start">Auto-start on load</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-review"
                    checked={config.launchSettings.allowReview}
                    onCheckedChange={(allowReview) => updateLaunchSettings({ allowReview })}
                  />
                  <Label htmlFor="allow-review">Allow review mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-navigation"
                    checked={config.launchSettings.showNavigation}
                    onCheckedChange={(showNavigation) => updateLaunchSettings({ showNavigation })}
                  />
                  <Label htmlFor="show-navigation">Show navigation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-bookmarking"
                    checked={config.launchSettings.allowBookmarking}
                    onCheckedChange={(allowBookmarking) => updateLaunchSettings({ allowBookmarking })}
                  />
                  <Label htmlFor="allow-bookmarking">Allow bookmarking</Label>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="0"
                    value={config.launchSettings.maxTimeAllowed || ''}
                    onChange={(e) => updateLaunchSettings({ 
                      maxTimeAllowed: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label htmlFor="time-action">Time Limit Action</Label>
                  <Select
                    value={config.launchSettings.timeLimitAction}
                    onValueChange={(value: 'exit' | 'continue' | 'message') => 
                      updateLaunchSettings({ timeLimitAction: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exit">Exit session</SelectItem>
                      <SelectItem value="continue">Continue session</SelectItem>
                      <SelectItem value="message">Show warning message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completion Settings */}
        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Completion & Scoring
              </CardTitle>
              <CardDescription>Define completion criteria and scoring rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tracking-mode">Tracking Mode</Label>
                <Select
                  value={config.completionSettings.trackingMode}
                  onValueChange={(value: 'completion_status' | 'success_status' | 'score') => 
                    updateCompletionSettings({ trackingMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion_status">Completion Status</SelectItem>
                    <SelectItem value="success_status">Success Status</SelectItem>
                    <SelectItem value="score">Score-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.completionSettings.trackingMode === 'score' && (
                <div>
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={config.completionSettings.passingScore || ''}
                    onChange={(e) => updateCompletionSettings({ 
                      passingScore: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="80"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-attempts">Max Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    value={config.completionSettings.maxAttempts || ''}
                    onChange={(e) => updateCompletionSettings({ 
                      maxAttempts: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="allow-retry"
                    checked={config.completionSettings.allowRetry}
                    onCheckedChange={(allowRetry) => updateCompletionSettings({ allowRetry })}
                  />
                  <Label htmlFor="allow-retry">Allow retry</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="save-progress"
                  checked={config.completionSettings.saveProgress}
                  onCheckedChange={(saveProgress) => updateCompletionSettings({ saveProgress })}
                />
                <Label htmlFor="save-progress">Save progress automatically</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tracking */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Data Tracking
              </CardTitle>
              <CardDescription>Configure what learner data to track and store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="track-interactions"
                    checked={config.dataSettings.trackInteractions}
                    onCheckedChange={(trackInteractions) => updateDataSettings({ trackInteractions })}
                  />
                  <Label htmlFor="track-interactions">Track interactions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="track-objectives"
                    checked={config.dataSettings.trackObjectives}
                    onCheckedChange={(trackObjectives) => updateDataSettings({ trackObjectives })}
                  />
                  <Label htmlFor="track-objectives">Track objectives</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="track-time"
                    checked={config.dataSettings.trackTime}
                    onCheckedChange={(trackTime) => updateDataSettings({ trackTime })}
                  />
                  <Label htmlFor="track-time">Track time spent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="suspend-data"
                    checked={config.dataSettings.suspendData}
                    onCheckedChange={(suspendData) => updateDataSettings({ suspendData })}
                  />
                  <Label htmlFor="suspend-data">Store suspend data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="student-preferences"
                    checked={config.dataSettings.studentPreferences}
                    onCheckedChange={(studentPreferences) => updateDataSettings({ studentPreferences })}
                  />
                  <Label htmlFor="student-preferences">Store preferences</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security & Anti-Cheating
              </CardTitle>
              <CardDescription>Configure security measures and prevent cheating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="prevent-cheating"
                    checked={config.securitySettings.preventCheating}
                    onCheckedChange={(preventCheating) => updateSecuritySettings({ preventCheating })}
                  />
                  <Label htmlFor="prevent-cheating">Anti-cheating mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="secure-mode"
                    checked={config.securitySettings.secureMode}
                    onCheckedChange={(secureMode) => updateSecuritySettings({ secureMode })}
                  />
                  <Label htmlFor="secure-mode">Secure mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-print-screen"
                    checked={config.securitySettings.allowPrintScreen}
                    onCheckedChange={(allowPrintScreen) => updateSecuritySettings({ allowPrintScreen })}
                  />
                  <Label htmlFor="allow-print-screen">Allow print screen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-right-click"
                    checked={config.securitySettings.allowRightClick}
                    onCheckedChange={(allowRightClick) => updateSecuritySettings({ allowRightClick })}
                  />
                  <Label htmlFor="allow-right-click">Allow right-click</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-text-selection"
                    checked={config.securitySettings.allowTextSelection}
                    onCheckedChange={(allowTextSelection) => updateSecuritySettings({ allowTextSelection })}
                  />
                  <Label htmlFor="allow-text-selection">Allow text selection</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display & Window Settings</CardTitle>
              <CardDescription>Configure the SCORM player window appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="400"
                    value={config.displaySettings.width}
                    onChange={(e) => updateDisplaySettings({ 
                      width: parseInt(e.target.value) || 800 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="300"
                    value={config.displaySettings.height}
                    onChange={(e) => updateDisplaySettings({ 
                      height: parseInt(e.target.value) || 600 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="resizable"
                    checked={config.displaySettings.resizable}
                    onCheckedChange={(resizable) => updateDisplaySettings({ resizable })}
                  />
                  <Label htmlFor="resizable">Resizable window</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fullscreen"
                    checked={config.displaySettings.fullscreen}
                    onCheckedChange={(fullscreen) => updateDisplaySettings({ fullscreen })}
                  />
                  <Label htmlFor="fullscreen">Allow fullscreen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-menubar"
                    checked={config.displaySettings.showMenubar}
                    onCheckedChange={(showMenubar) => updateDisplaySettings({ showMenubar })}
                  />
                  <Label htmlFor="show-menubar">Show menu bar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-statusbar"
                    checked={config.displaySettings.showStatusbar}
                    onCheckedChange={(showStatusbar) => updateDisplaySettings({ showStatusbar })}
                  />
                  <Label htmlFor="show-statusbar">Show status bar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-toolbar"
                    checked={config.displaySettings.showToolbar}
                    onCheckedChange={(showToolbar) => updateDisplaySettings({ showToolbar })}
                  />
                  <Label htmlFor="show-toolbar">Show toolbar</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};