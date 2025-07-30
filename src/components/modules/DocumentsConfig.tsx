import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Shield, Settings, Save, Upload, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentsConfigProps {
  onBack: () => void;
  clientId?: string;
}

export const DocumentsConfig = ({ onBack, clientId }: DocumentsConfigProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    eSignatures: true,
    versionControl: true,
    autoBackup: true,
    encryption: true,
    workflowAutomation: false,
    auditTrail: true,
    documentTemplates: true,
    bulkOperations: false,
    ocrProcessing: true,
    maxFileSize: 50,
    retentionPeriod: 7,
    allowedFormats: ['pdf', 'doc', 'docx', 'txt'],
    collaborativeEditing: false,
    expirationAlerts: true
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "Document management settings have been updated successfully.",
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

  const handleFormatToggle = (format: string) => {
    setConfig(prev => ({
      ...prev,
      allowedFormats: prev.allowedFormats.includes(format)
        ? prev.allowedFormats.filter(f => f !== format)
        : [...prev.allowedFormats, format]
    }));
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
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Documents Configuration</h2>
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
              Enable or disable main document management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="e-signatures" className="text-sm font-medium">
                E-Signatures
              </Label>
              <Switch
                id="e-signatures"
                checked={config.eSignatures}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, eSignatures: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="version-control" className="text-sm font-medium">
                Version Control
              </Label>
              <Switch
                id="version-control"
                checked={config.versionControl}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, versionControl: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup" className="text-sm font-medium">
                Auto Backup
              </Label>
              <Switch
                id="auto-backup"
                checked={config.autoBackup}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoBackup: checked }))}
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
              <Label htmlFor="document-templates" className="text-sm font-medium">
                Document Templates
              </Label>
              <Switch
                id="document-templates"
                checked={config.documentTemplates}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, documentTemplates: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="ocr-processing" className="text-sm font-medium">
                OCR Processing
              </Label>
              <Switch
                id="ocr-processing"
                checked={config.ocrProcessing}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ocrProcessing: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Advanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Advanced
            </CardTitle>
            <CardDescription>
              Configure security and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="encryption" className="text-sm font-medium">
                End-to-End Encryption
              </Label>
              <Switch
                id="encryption"
                checked={config.encryption}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, encryption: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="workflow-automation" className="text-sm font-medium">
                Workflow Automation
              </Label>
              <Switch
                id="workflow-automation"
                checked={config.workflowAutomation}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, workflowAutomation: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-operations" className="text-sm font-medium">
                Bulk Operations
              </Label>
              <Switch
                id="bulk-operations"
                checked={config.bulkOperations}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, bulkOperations: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="collaborative-editing" className="text-sm font-medium">
                Collaborative Editing
              </Label>
              <Switch
                id="collaborative-editing"
                checked={config.collaborativeEditing}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, collaborativeEditing: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="expiration-alerts" className="text-sm font-medium">
                Expiration Alerts
              </Label>
              <Switch
                id="expiration-alerts"
                checked={config.expirationAlerts}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, expirationAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Settings
            </CardTitle>
            <CardDescription>
              Configure file upload and storage parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={config.maxFileSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retention-period">Retention Period (years)</Label>
                <Input
                  id="retention-period"
                  type="number"
                  value={config.retentionPeriod}
                  onChange={(e) => setConfig(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Allowed File Formats</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['pdf', 'doc', 'docx', 'txt', 'xlsx', 'ppt', 'jpg', 'png'].map((format) => (
                  <div key={format} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={format}
                      checked={config.allowedFormats.includes(format)}
                      onChange={() => handleFormatToggle(format)}
                      className="rounded"
                    />
                    <Label htmlFor={format} className="text-sm font-normal">
                      .{format}
                    </Label>
                  </div>
                ))}
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