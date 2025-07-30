import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings, Save, Building2, GraduationCap, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WelcomeScreenDesignerProps {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  onSave: (config: WelcomeScreenConfig) => void;
  currentConfig?: WelcomeScreenConfig;
}

export interface WelcomeScreenConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  welcomeMessage: string;
  showCompanyLogo: boolean;
  showDuration: boolean;
  autoAdvance: boolean;
  displayDuration: number; // seconds
  backgroundColor: string;
  textColor: string;
  template: 'professional' | 'modern' | 'elegant';
}

const defaultConfig: WelcomeScreenConfig = {
  enabled: true,
  title: 'Welcome to Your Training',
  subtitle: 'Essential Workplace Knowledge',
  welcomeMessage: 'Thank you for taking the time to complete this important training. This module will provide you with essential knowledge and skills to ensure a safe and compliant workplace.',
  showCompanyLogo: true,
  showDuration: true,
  autoAdvance: true,
  displayDuration: 8,
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  template: 'professional'
};

export const WelcomeScreenDesigner: React.FC<WelcomeScreenDesignerProps> = ({
  companyName,
  companyLogo,
  primaryColor = '#655DC6',
  onSave,
  currentConfig = defaultConfig
}) => {
  const [config, setConfig] = useState<WelcomeScreenConfig>(currentConfig);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(config);
    toast({
      title: "Welcome Screen Updated",
      description: "Your welcome screen configuration has been saved.",
    });
  };

  const updateConfig = (updates: Partial<WelcomeScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const templates = [
    { id: 'professional', name: 'Professional', description: 'Clean corporate look' },
    { id: 'modern', name: 'Modern', description: 'Contemporary gradient design' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated minimal style' }
  ];

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Welcome Screen Configuration
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => updateConfig({ enabled })}
              />
              <Label>Enable Welcome Screen</Label>
            </div>
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-3">
              <Label>Template Style</Label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      config.template === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => updateConfig({ template: template.id as any })}
                  >
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    placeholder="Welcome to Your Training"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={config.subtitle}
                    onChange={(e) => updateConfig({ subtitle: e.target.value })}
                    placeholder="Essential Workplace Knowledge"
                  />
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                    placeholder="Enter your welcome message..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayDuration">Display Duration (seconds)</Label>
                  <Input
                    id="displayDuration"
                    type="number"
                    min="3"
                    max="30"
                    value={config.displayDuration}
                    onChange={(e) => updateConfig({ displayDuration: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.showCompanyLogo}
                      onCheckedChange={(checked) => updateConfig({ showCompanyLogo: checked })}
                    />
                    <Label>Show Company Logo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.showDuration}
                      onCheckedChange={(checked) => updateConfig({ showDuration: checked })}
                    />
                    <Label>Show Training Duration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.autoAdvance}
                      onCheckedChange={(checked) => updateConfig({ autoAdvance: checked })}
                    />
                    <Label>Auto-advance after timer</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>

              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Preview */}
      {showPreview && config.enabled && (
        <WelcomeScreenPreview
          config={config}
          companyName={companyName}
          companyLogo={companyLogo}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
};

// Preview Component
interface WelcomeScreenPreviewProps {
  config: WelcomeScreenConfig;
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
}

const WelcomeScreenPreview: React.FC<WelcomeScreenPreviewProps> = ({
  config,
  companyName,
  companyLogo,
  primaryColor
}) => {
  const getTemplateStyles = () => {
    switch (config.template) {
      case 'modern':
        return {
          background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
          borderRadius: '0',
        };
      case 'elegant':
        return {
          background: '#fafafa',
          borderRadius: '0',
          border: 'none',
        };
      default: // professional
        return {
          background: '#ffffff',
          borderRadius: '0',
          border: '1px solid #e5e7eb',
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview
          <Badge variant="outline">Live Preview</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="aspect-video w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8 text-center"
          style={getTemplateStyles()}
        >
          {/* Company Logo */}
          {config.showCompanyLogo && (
            <div className="mb-6">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-16 w-auto mx-auto"
                />
              ) : (
                <div 
                  className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-4 max-w-2xl">
            <h1 
              className="text-3xl md:text-4xl font-bold"
              style={{ color: config.textColor }}
            >
              {config.title}
            </h1>
            
            <p 
              className="text-lg md:text-xl font-medium opacity-80"
              style={{ color: config.textColor }}
            >
              {config.subtitle}
            </p>
            
            <p 
              className="text-base md:text-lg leading-relaxed opacity-70"
              style={{ color: config.textColor }}
            >
              {config.welcomeMessage}
            </p>

            {/* Training Info */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-60">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Provided by {companyName}</span>
              </div>
              {config.showDuration && (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>~15 minutes</span>
                </div>
              )}
            </div>

            {/* Auto-advance indicator */}
            {config.autoAdvance && (
              <div className="mt-8">
                <div className="flex items-center justify-center gap-2 text-xs opacity-50">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <span>Automatically continuing in {config.displayDuration} seconds...</span>
                </div>
                <div 
                  className="mt-2 h-1 bg-current opacity-20 rounded-full overflow-hidden"
                >
                  <div 
                    className="h-full bg-current opacity-60 rounded-full animate-pulse"
                    style={{ 
                      width: '30%',
                      animation: `expand ${config.displayDuration}s linear infinite`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};