import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, AlertTriangle, Settings, Save, FileCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const ComplianceConfig = ({ onBack, clientId }: ComplianceConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    autoCompliance: true,
    realTimeMonitoring: true,
    complianceReports: true,
    alertSystem: true,
    auditTrail: true,
    documentExpiry: true,
    customPolicies: false,
    riskAssessment: true,
    trainingTracking: true,
    certificationManagement: false,
    regulatoryUpdates: true,
    thirdPartyIntegration: false,
    reportingFrequency: 'monthly',
    alertThreshold: 7,
    auditRetention: 5
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Compliance settings have been updated successfully.",
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
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Compliance Configuration</h2>
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
              Enable or disable main compliance features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-compliance" className="text-sm font-medium">
                Auto Compliance Monitoring
              </Label>
              <Switch
                id="auto-compliance"
                checked={config.autoCompliance}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoCompliance: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="real-time-monitoring" className="text-sm font-medium">
                Real-time Monitoring
              </Label>
              <Switch
                id="real-time-monitoring"
                checked={config.realTimeMonitoring}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, realTimeMonitoring: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compliance-reports" className="text-sm font-medium">
                Compliance Reports
              </Label>
              <Switch
                id="compliance-reports"
                checked={config.complianceReports}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, complianceReports: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="alert-system" className="text-sm font-medium">
                Alert System
              </Label>
              <Switch
                id="alert-system"
                checked={config.alertSystem}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, alertSystem: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="audit-trail" className="text-sm font-medium">
                Audit Trail
              </Label>
              <Switch
                id="audit-trail"
                checked={config.auditTrail}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auditTrail: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="document-expiry" className="text-sm font-medium">
                Document Expiry Tracking
              </Label>
              <Switch
                id="document-expiry"
                checked={config.documentExpiry}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, documentExpiry: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Configure advanced compliance and risk management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="flex items-center justify-between">
              <Label htmlFor="risk-assessment" className="text-sm font-medium">
                Risk Assessment
              </Label>
              <Switch
                id="risk-assessment"
                checked={config.riskAssessment}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, riskAssessment: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="training-tracking" className="text-sm font-medium">
                Training Tracking
              </Label>
              <Switch
                id="training-tracking"
                checked={config.trainingTracking}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trainingTracking: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="certification-management" className="text-sm font-medium">
                Certification Management
              </Label>
              <Switch
                id="certification-management"
                checked={config.certificationManagement}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, certificationManagement: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="regulatory-updates" className="text-sm font-medium">
                Regulatory Updates
              </Label>
              <Switch
                id="regulatory-updates"
                checked={config.regulatoryUpdates}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, regulatoryUpdates: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="third-party-integration" className="text-sm font-medium">
                Third-party Integration
              </Label>
              <Switch
                id="third-party-integration"
                checked={config.thirdPartyIntegration}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, thirdPartyIntegration: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Configuration Settings
            </CardTitle>
            <CardDescription>
              Customize compliance monitoring parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Alert Threshold (days)</Label>
                <Input
                  id="alert-threshold"
                  type="number"
                  value={config.alertThreshold}
                  onChange={(e) => setConfig(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="90"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audit-retention">Audit Retention (years)</Label>
                <Input
                  id="audit-retention"
                  type="number"
                  value={config.auditRetention}
                  onChange={(e) => setConfig(prev => ({ ...prev, auditRetention: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="20"
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