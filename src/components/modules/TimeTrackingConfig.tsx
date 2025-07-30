import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeTrackingConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const TimeTrackingConfig = ({ onBack, clientId }: TimeTrackingConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    gpsTracking: true,
    projectBasedBilling: true,
    overtimeThreshold: 40,
    breakReminders: true,
    mobileApp: true,
    offlineMode: true,
    approvalWorkflow: false,
    geofencing: true,
    faceRecognition: false,
    reportingFrequency: 'weekly'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Time tracking settings have been updated successfully.",
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
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Time Tracking Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Core Features
            </CardTitle>
            <CardDescription>
              Enable or disable main time tracking capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gps-tracking" className="text-sm font-medium">
                GPS Tracking
              </Label>
              <Switch
                id="gps-tracking"
                checked={config.gpsTracking}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, gpsTracking: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="project-billing" className="text-sm font-medium">
                Project-Based Billing
              </Label>
              <Switch
                id="project-billing"
                checked={config.projectBasedBilling}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, projectBasedBilling: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="break-reminders" className="text-sm font-medium">
                Break Reminders
              </Label>
              <Switch
                id="break-reminders"
                checked={config.breakReminders}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, breakReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="approval-workflow" className="text-sm font-medium">
                Approval Workflow
              </Label>
              <Switch
                id="approval-workflow"
                checked={config.approvalWorkflow}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, approvalWorkflow: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Configure advanced tracking and security options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile-app" className="text-sm font-medium">
                Mobile App Access
              </Label>
              <Switch
                id="mobile-app"
                checked={config.mobileApp}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mobileApp: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode" className="text-sm font-medium">
                Offline Mode
              </Label>
              <Switch
                id="offline-mode"
                checked={config.offlineMode}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, offlineMode: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="geofencing" className="text-sm font-medium">
                Geofencing
              </Label>
              <Switch
                id="geofencing"
                checked={config.geofencing}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, geofencing: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="face-recognition" className="text-sm font-medium">
                Face Recognition
              </Label>
              <Switch
                id="face-recognition"
                checked={config.faceRecognition}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, faceRecognition: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration Settings</CardTitle>
            <CardDescription>
              Customize time tracking parameters and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overtime-threshold">Overtime Threshold (hours/week)</Label>
                <Input
                  id="overtime-threshold"
                  type="number"
                  value={config.overtimeThreshold}
                  onChange={(e) => setConfig(prev => ({ ...prev, overtimeThreshold: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="168"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reporting-frequency">Reporting Frequency</Label>
                <select
                  id="reporting-frequency"
                  value={config.reportingFrequency}
                  onChange={(e) => setConfig(prev => ({ ...prev, reportingFrequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
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