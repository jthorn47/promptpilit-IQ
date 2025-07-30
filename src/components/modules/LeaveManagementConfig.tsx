import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Users, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaveManagementConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const LeaveManagementConfig = ({ onBack, clientId }: LeaveManagementConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    autoApproval: false,
    managerApproval: true,
    hrApproval: false,
    accrualTracking: true,
    balanceAlerts: true,
    holidayIntegration: true,
    carryoverLimit: 40,
    maxConsecutiveDays: 14,
    advanceNotice: 14,
    emailNotifications: true,
    calendarSync: true,
    customPolicies: false
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Leave management settings have been updated successfully.",
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
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Leave Management Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Approval Workflow
            </CardTitle>
            <CardDescription>
              Configure leave request approval process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approval" className="text-sm font-medium">
                Auto Approval (Under 1 day)
              </Label>
              <Switch
                id="auto-approval"
                checked={config.autoApproval}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoApproval: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="manager-approval" className="text-sm font-medium">
                Manager Approval Required
              </Label>
              <Switch
                id="manager-approval"
                checked={config.managerApproval}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, managerApproval: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="hr-approval" className="text-sm font-medium">
                HR Approval Required
              </Label>
              <Switch
                id="hr-approval"
                checked={config.hrApproval}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, hrApproval: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              Enable or disable leave management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="accrual-tracking" className="text-sm font-medium">
                Accrual Tracking
              </Label>
              <Switch
                id="accrual-tracking"
                checked={config.accrualTracking}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, accrualTracking: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="balance-alerts" className="text-sm font-medium">
                Balance Alerts
              </Label>
              <Switch
                id="balance-alerts"
                checked={config.balanceAlerts}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, balanceAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="holiday-integration" className="text-sm font-medium">
                Holiday Integration
              </Label>
              <Switch
                id="holiday-integration"
                checked={config.holidayIntegration}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, holidayIntegration: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={config.emailNotifications}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="calendar-sync" className="text-sm font-medium">
                Calendar Sync
              </Label>
              <Switch
                id="calendar-sync"
                checked={config.calendarSync}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, calendarSync: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-policies" className="text-sm font-medium">
                Custom Policies
              </Label>
              <Switch
                id="custom-policies"
                checked={config.customPolicies}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, customPolicies: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Policy Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Policy Settings</CardTitle>
            <CardDescription>
              Configure leave policy parameters and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carryover-limit">Max Carryover Hours</Label>
                <Input
                  id="carryover-limit"
                  type="number"
                  value={config.carryoverLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, carryoverLimit: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-consecutive">Max Consecutive Days</Label>
                <Input
                  id="max-consecutive"
                  type="number"
                  value={config.maxConsecutiveDays}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="365"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="advance-notice">Advance Notice (days)</Label>
                <Input
                  id="advance-notice"
                  type="number"
                  value={config.advanceNotice}
                  onChange={(e) => setConfig(prev => ({ ...prev, advanceNotice: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="90"
                />
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