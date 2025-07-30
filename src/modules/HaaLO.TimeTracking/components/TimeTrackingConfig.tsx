import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin, Settings, Save } from "lucide-react";
import { useTimeTrackingState } from "../state/useTimeTrackingState";
import { useParams } from "react-router-dom";

interface TimeTrackingConfigProps {
  onBack?: () => void;
  clientId?: string;
}

export function TimeTrackingConfig({ onBack, clientId: propClientId }: TimeTrackingConfigProps) {
  const { clientId: routeClientId } = useParams<{ clientId: string }>();
  const clientId = propClientId || routeClientId;
  
  const { config, loading, updateConfig } = useTimeTrackingState(clientId);
  const [localConfig, setLocalConfig] = useState(config);

  React.useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = async () => {
    if (localConfig) {
      await updateConfig(localConfig);
    }
  };

  if (loading || !localConfig) {
    return (
      <div className="p-6">
        <div className="text-center">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Time Tracking Configuration</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Core Settings
            </CardTitle>
            <CardDescription>
              Configure basic time tracking features and policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="gps-tracking">GPS Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Enable location verification for time entries
                </p>
              </div>
              <Switch
                id="gps-tracking"
                checked={localConfig.gpsTracking}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, gpsTracking: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="project-billing">Project-Based Billing</Label>
                <p className="text-sm text-muted-foreground">
                  Track time by project for accurate billing
                </p>
              </div>
              <Switch
                id="project-billing"
                checked={localConfig.projectBasedBilling}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, projectBasedBilling: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="overtime-threshold">Overtime Threshold (hours per week)</Label>
              <Input
                id="overtime-threshold"
                type="number"
                value={localConfig.overtimeThreshold}
                onChange={(e) => 
                  setLocalConfig(prev => ({ ...prev!, overtimeThreshold: parseInt(e.target.value) || 40 }))
                }
                className="max-w-xs"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="break-reminders">Break Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send automated break reminders to employees
                </p>
              </div>
              <Switch
                id="break-reminders"
                checked={localConfig.breakReminders}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, breakReminders: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mobile & Offline Features
            </CardTitle>
            <CardDescription>
              Configure mobile app and offline capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="mobile-app">Mobile App Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow employees to track time via mobile app
                </p>
              </div>
              <Switch
                id="mobile-app"
                checked={localConfig.mobileApp}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, mobileApp: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="offline-mode">Offline Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable time tracking when internet is unavailable
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={localConfig.offlineMode}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, offlineMode: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="approval-workflow">Approval Workflow</Label>
                <p className="text-sm text-muted-foreground">
                  Require manager approval for time entries
                </p>
              </div>
              <Switch
                id="approval-workflow"
                checked={localConfig.approvalWorkflow}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev!, approvalWorkflow: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}