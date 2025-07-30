import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Eye, Code, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface EmailSignatureSettings {
  id: string;
  template_html: string;
  template_text: string;
  is_enabled: boolean;
  allow_user_customization: boolean;
  available_tokens: string[];
  preview_data: Json;
}

const DEFAULT_TOKENS = ['first_name', 'last_name', 'title', 'email', 'phone', 'company_name'];

export const EmailSignatureSettings = () => {
  const [settings, setSettings] = useState<EmailSignatureSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("html");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_email_signature_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading email signature settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email signature settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('global_email_signature_settings')
        .update({
          template_html: settings.template_html,
          template_text: settings.template_text,
          is_enabled: settings.is_enabled,
          allow_user_customization: settings.allow_user_customization,
          available_tokens: settings.available_tokens,
          preview_data: settings.preview_data,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email signature settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!settings) return;

    setSettings({
      ...settings,
      template_html: `<div style="font-family: Arial, sans-serif; color: #333;">
  <p><strong>{{first_name}} {{last_name}}</strong><br>
  {{title}}<br>
  {{company_name}}</p>
  <p>Email: <a href="mailto:{{email}}">{{email}}</a><br>
  Phone: {{phone}}</p>
</div>`,
      template_text: `{{first_name}} {{last_name}}
{{title}}
{{company_name}}

Email: {{email}}
Phone: {{phone}}`,
    });
  };

  const replaceTokens = (template: string) => {
    if (!settings || !settings.preview_data || typeof settings.preview_data !== 'object') return template;
    
    let result = template;
    Object.entries(settings.preview_data as Record<string, string>).forEach(([token, value]) => {
      result = result.replace(new RegExp(`{{${token}}}`, 'g'), String(value));
    });
    return result;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!settings) {
    return <div className="text-center p-8">No settings found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Global Email Signature
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure the default email signature template for all users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="signature-enabled">Enable Signatures</Label>
          <Switch
            id="signature-enabled"
            checked={settings.is_enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, is_enabled: checked })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Template Editor
            </CardTitle>
            <CardDescription>
              Create your email signature using HTML or plain text with dynamic tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-4">
                <Textarea
                  value={settings.template_html}
                  onChange={(e) =>
                    setSettings({ ...settings, template_html: e.target.value })
                  }
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter HTML template with tokens like {{first_name}}"
                />
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  value={settings.template_text}
                  onChange={(e) =>
                    setSettings({ ...settings, template_text: e.target.value })
                  }
                  className="min-h-[200px]"
                  placeholder="Enter plain text template with tokens like {{first_name}}"
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Available Tokens</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TOKENS.map((token) => (
                  <Badge key={token} variant="outline" className="text-xs">
                    {`{{${token}}}`}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow-customization">Allow User Customization</Label>
                <p className="text-xs text-muted-foreground">
                  Users can edit their personal signature
                </p>
              </div>
              <Switch
                id="allow-customization"
                checked={settings.allow_user_customization}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allow_user_customization: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See how the signature will look with sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label className="text-sm font-medium text-muted-foreground">
                Preview Data
              </Label>
               <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                {settings.preview_data && typeof settings.preview_data === 'object' && 
                  Object.entries(settings.preview_data as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">HTML Preview</Label>
              <div 
                className="border rounded-lg p-4 bg-background min-h-[120px]"
                dangerouslySetInnerHTML={{ 
                  __html: replaceTokens(settings.template_html) 
                }}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Plain Text Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[120px] whitespace-pre-wrap font-mono text-sm">
                {replaceTokens(settings.template_text)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={resetToDefault}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};