import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DisclaimerSettings {
  id?: string;
  training_module_id: string;
  legal_disclaimer_text?: string;
  legal_disclaimer_enabled: boolean;
  legal_disclaimer_position: 'start' | 'end' | 'both';
  acknowledgment_disclaimer_text?: string;
  acknowledgment_disclaimer_enabled: boolean;
}

interface DisclaimerSettingsTabProps {
  moduleId: string;
  isEnabled: boolean;
}

export const DisclaimerSettingsTab = ({ moduleId, isEnabled }: DisclaimerSettingsTabProps) => {
  const [settings, setSettings] = useState<DisclaimerSettings>({
    training_module_id: moduleId,
    legal_disclaimer_enabled: false,
    legal_disclaimer_position: 'start',
    acknowledgment_disclaimer_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (moduleId) {
      fetchDisclaimerSettings();
    }
  }, [moduleId]);

  const fetchDisclaimerSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('training_disclaimers')
        .select('*')
        .eq('training_module_id', moduleId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          legal_disclaimer_position: data.legal_disclaimer_position as 'start' | 'end' | 'both'
        });
      }
    } catch (error) {
      console.error('Error fetching disclaimer settings:', error);
      toast({
        title: "Error",
        description: "Failed to load disclaimer settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('training_disclaimers')
        .upsert(settings, {
          onConflict: 'training_module_id'
        });

      if (error) {
        console.error('Database error:', error);
        // Handle specific permission errors
        if (error.code === '42501' || error.message?.includes('policy')) {
          toast({
            title: "Permission Error",
            description: "You need company admin permissions to save disclaimer settings",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Disclaimer settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving disclaimer settings:', error);
      toast({
        title: "Error",
        description: "Failed to save disclaimer settings. Please check your permissions.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Disclaimers Not Available</h3>
        <p className="text-muted-foreground mb-4">
          Disclaimer settings are available for published training modules.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading disclaimer settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Training Disclaimers
              </CardTitle>
              <CardDescription>
                Configure legal and acknowledgment disclaimers for this training module
              </CardDescription>
            </div>
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="bg-gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Legal Disclaimer Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Legal Disclaimer</CardTitle>
              <CardDescription>
                Informational disclaimer clarifying training purpose and legal advice limitations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="legal-enabled"
                checked={settings.legal_disclaimer_enabled}
                onCheckedChange={(enabled) => 
                  setSettings(prev => ({ ...prev, legal_disclaimer_enabled: enabled }))
                }
              />
              <Label htmlFor="legal-enabled">Enable Legal Disclaimer</Label>
            </div>
          </div>
        </CardHeader>
        
        {settings.legal_disclaimer_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="legal-position">Display Position</Label>
              <Select
                value={settings.legal_disclaimer_position}
                onValueChange={(value: 'start' | 'end' | 'both') => 
                  setSettings(prev => ({ ...prev, legal_disclaimer_position: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Beginning of training</SelectItem>
                  <SelectItem value="end">End of training</SelectItem>
                  <SelectItem value="both">Beginning and end</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="legal-text">Legal Disclaimer Text</Label>
              <Textarea
                id="legal-text"
                value={settings.legal_disclaimer_text || ''}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, legal_disclaimer_text: e.target.value }))
                }
                placeholder="This training is intended for informational purposes only..."
                className="min-h-[120px] mt-2"
                aria-describedby="legal-disclaimer-help"
              />
              <p id="legal-disclaimer-help" className="text-sm text-muted-foreground mt-1">
                This disclaimer will be displayed to clarify the educational nature of the training.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Acknowledgment Disclaimer Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Learner Acknowledgment</CardTitle>
              <CardDescription>
                Required acknowledgment that learners must accept before proceeding
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="acknowledgment-enabled"
                checked={settings.acknowledgment_disclaimer_enabled}
                onCheckedChange={(enabled) => 
                  setSettings(prev => ({ ...prev, acknowledgment_disclaimer_enabled: enabled }))
                }
              />
              <Label htmlFor="acknowledgment-enabled">Require Acknowledgment</Label>
            </div>
          </div>
        </CardHeader>
        
        {settings.acknowledgment_disclaimer_enabled && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Required Acknowledgment</h4>
                  <p className="text-sm text-amber-700">
                    Learners must check this acknowledgment before they can proceed with the training.
                    The acknowledgment will be logged with a timestamp for compliance tracking.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="acknowledgment-text">Acknowledgment Text</Label>
              <Textarea
                id="acknowledgment-text"
                value={settings.acknowledgment_disclaimer_text || ''}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, acknowledgment_disclaimer_text: e.target.value }))
                }
                placeholder="By continuing, I acknowledge that I am completing this training truthfully..."
                className="min-h-[100px] mt-2"
                aria-describedby="acknowledgment-disclaimer-help"
              />
              <p id="acknowledgment-disclaimer-help" className="text-sm text-muted-foreground mt-1">
                This text will be presented with a checkbox that learners must check to proceed.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disclaimer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Legal Disclaimer</span>
              <Badge variant={settings.legal_disclaimer_enabled ? "default" : "secondary"}>
                {settings.legal_disclaimer_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Required Acknowledgment</span>
              <Badge variant={settings.acknowledgment_disclaimer_enabled ? "default" : "secondary"}>
                {settings.acknowledgment_disclaimer_enabled ? "Required" : "Optional"}
              </Badge>
            </div>
          </div>
          
          {(settings.legal_disclaimer_enabled || settings.acknowledgment_disclaimer_enabled) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">WCAG 2.2 Accessibility</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Disclaimers include proper ARIA labels and descriptions</li>
                <li>• Text meets contrast requirements for readability</li>
                <li>• Keyboard navigation is fully supported</li>
                <li>• Screen reader announcements are properly structured</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};