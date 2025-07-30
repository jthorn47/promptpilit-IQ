import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accessibility, Check, X, Eye, Headphones, Keyboard, MonitorSpeaker, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccessibilitySettings {
  wcag_compliance_level: 'A' | 'AA' | 'AAA';
  keyboard_navigation: boolean;
  screen_reader_support: boolean;
  high_contrast_mode: boolean;
  captions_required: boolean;
  audio_descriptions: boolean;
  sign_language_interpretation: boolean;
  reduced_motion: boolean;
  focus_indicators: boolean;
  alt_text_required: boolean;
  color_contrast_ratio: number;
  font_size_adjustable: boolean;
  auto_pause_media: boolean;
  skip_navigation_links: boolean;
  aria_labels_complete: boolean;
  semantic_markup: boolean;
  error_identification: boolean;
  language_identification: boolean;
}

interface AccessibilitySettingsTabProps {
  moduleId: string;
  isEnabled: boolean;
  settings?: AccessibilitySettings;
  onSettingsUpdate: (settings: AccessibilitySettings) => void;
}

const defaultSettings: AccessibilitySettings = {
  wcag_compliance_level: 'AA',
  keyboard_navigation: true,
  screen_reader_support: true,
  high_contrast_mode: false,
  captions_required: true,
  audio_descriptions: false,
  sign_language_interpretation: false,
  reduced_motion: false,
  focus_indicators: true,
  alt_text_required: true,
  color_contrast_ratio: 4.5,
  font_size_adjustable: true,
  auto_pause_media: false,
  skip_navigation_links: true,
  aria_labels_complete: true,
  semantic_markup: true,
  error_identification: true,
  language_identification: true,
};

export const AccessibilitySettingsTab = ({ 
  moduleId, 
  isEnabled, 
  settings = defaultSettings,
  onSettingsUpdate 
}: AccessibilitySettingsTabProps) => {
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>(settings);
  const [complianceScore, setComplianceScore] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    calculateComplianceScore();
  }, [localSettings]);

  const calculateComplianceScore = () => {
    const totalChecks = Object.keys(localSettings).length - 2; // Exclude compliance level and contrast ratio
    const passedChecks = Object.entries(localSettings)
      .filter(([key, value]) => key !== 'wcag_compliance_level' && key !== 'color_contrast_ratio' && value === true)
      .length;
    
    const score = Math.round((passedChecks / totalChecks) * 100);
    setComplianceScore(score);
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsUpdate(newSettings);
  };

  const getComplianceColor = () => {
    if (complianceScore >= 90) return 'text-green-600';
    if (complianceScore >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const wcagRequirements = {
    'A': [
      'Images have alternative text',
      'Videos have captions for deaf users',
      'Content can be accessed with keyboard',
      'Content does not flash more than 3 times per second'
    ],
    'AA': [
      'Color contrast ratio is at least 4.5:1',
      'Text can be resized up to 200%',
      'Content is readable and functional when spacing is increased',
      'Content works in portrait and landscape orientations'
    ],
    'AAA': [
      'Color contrast ratio is at least 7:1',
      'Audio descriptions for videos',
      'Sign language interpretation',
      'Context-sensitive help is available'
    ]
  };

  if (!isEnabled) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Accessibility className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Accessibility Settings Not Available</h3>
        <p className="text-muted-foreground mb-4">
          Accessibility settings are available for published training modules.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Compliance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-primary" />
                WCAG 2.2 Accessibility Settings
              </CardTitle>
              <CardDescription>
                Configure accessibility features to ensure your training is compliant and inclusive
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getComplianceColor()}`}>
                {complianceScore}%
              </div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* WCAG Compliance Level */}
      <Card>
        <CardHeader>
          <CardTitle>WCAG 2.2 Compliance Level</CardTitle>
          <CardDescription>
            Choose the level of accessibility compliance for this training module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="compliance-level">Target Compliance Level</Label>
            <Select
              value={localSettings.wcag_compliance_level}
              onValueChange={(value: 'A' | 'AA' | 'AAA') => updateSetting('wcag_compliance_level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Level A (Minimum)</SelectItem>
                <SelectItem value="AA">Level AA (Standard) - Recommended</SelectItem>
                <SelectItem value="AAA">Level AAA (Enhanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Level {localSettings.wcag_compliance_level} Requirements
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {wcagRequirements[localSettings.wcag_compliance_level].map((requirement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard & Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">Enable full keyboard accessibility</p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={localSettings.keyboard_navigation}
              onCheckedChange={(checked) => updateSetting('keyboard_navigation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="focus-indicators">Visible Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">Show clear focus outlines for keyboard users</p>
            </div>
            <Switch
              id="focus-indicators"
              checked={localSettings.focus_indicators}
              onCheckedChange={(checked) => updateSetting('focus_indicators', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="skip-links">Skip Navigation Links</Label>
              <p className="text-sm text-muted-foreground">Add "Skip to content" links</p>
            </div>
            <Switch
              id="skip-links"
              checked={localSettings.skip_navigation_links}
              onCheckedChange={(checked) => updateSetting('skip_navigation_links', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSpeaker className="w-5 h-5" />
            Screen Reader Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
              <p className="text-sm text-muted-foreground">Optimize content for screen readers</p>
            </div>
            <Switch
              id="screen-reader"
              checked={localSettings.screen_reader_support}
              onCheckedChange={(checked) => updateSetting('screen_reader_support', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="aria-labels">Complete ARIA Labels</Label>
              <p className="text-sm text-muted-foreground">Ensure all interactive elements have ARIA labels</p>
            </div>
            <Switch
              id="aria-labels"
              checked={localSettings.aria_labels_complete}
              onCheckedChange={(checked) => updateSetting('aria_labels_complete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="semantic-markup">Semantic HTML Markup</Label>
              <p className="text-sm text-muted-foreground">Use proper heading structure and landmarks</p>
            </div>
            <Switch
              id="semantic-markup"
              checked={localSettings.semantic_markup}
              onCheckedChange={(checked) => updateSetting('semantic_markup', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alt-text">Required Alt Text</Label>
              <p className="text-sm text-muted-foreground">All images must have descriptive alt text</p>
            </div>
            <Switch
              id="alt-text"
              checked={localSettings.alt_text_required}
              onCheckedChange={(checked) => updateSetting('alt_text_required', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual & Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visual & Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">Support high contrast display options</p>
            </div>
            <Switch
              id="high-contrast"
              checked={localSettings.high_contrast_mode}
              onCheckedChange={(checked) => updateSetting('high_contrast_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="font-resize">Adjustable Font Size</Label>
              <p className="text-sm text-muted-foreground">Allow users to resize text up to 200%</p>
            </div>
            <Switch
              id="font-resize"
              checked={localSettings.font_size_adjustable}
              onCheckedChange={(checked) => updateSetting('font_size_adjustable', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduced-motion">Reduced Motion Support</Label>
              <p className="text-sm text-muted-foreground">Respect user's motion preferences</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={localSettings.reduced_motion}
              onCheckedChange={(checked) => updateSetting('reduced_motion', checked)}
            />
          </div>

          <div>
            <Label htmlFor="contrast-ratio">Color Contrast Ratio</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                id="contrast-ratio"
                type="number"
                step="0.1"
                min="3"
                max="21"
                value={localSettings.color_contrast_ratio}
                onChange={(e) => updateSetting('color_contrast_ratio', parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                :1 ratio (AA: 4.5:1, AAA: 7:1)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio & Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Audio & Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="captions">Captions Required</Label>
              <p className="text-sm text-muted-foreground">All video content must have closed captions</p>
            </div>
            <Switch
              id="captions"
              checked={localSettings.captions_required}
              onCheckedChange={(checked) => updateSetting('captions_required', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
              <p className="text-sm text-muted-foreground">Provide audio descriptions for visual content</p>
            </div>
            <Switch
              id="audio-descriptions"
              checked={localSettings.audio_descriptions}
              onCheckedChange={(checked) => updateSetting('audio_descriptions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sign-language">Sign Language Interpretation</Label>
              <p className="text-sm text-muted-foreground">Include sign language interpreter (AAA)</p>
            </div>
            <Switch
              id="sign-language"
              checked={localSettings.sign_language_interpretation}
              onCheckedChange={(checked) => updateSetting('sign_language_interpretation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-pause">Auto-pause Media</Label>
              <p className="text-sm text-muted-foreground">Automatically pause media after 5 seconds</p>
            </div>
            <Switch
              id="auto-pause"
              checked={localSettings.auto_pause_media}
              onCheckedChange={(checked) => updateSetting('auto_pause_media', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content & Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Content & Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="language-id">Language Identification</Label>
              <p className="text-sm text-muted-foreground">Properly identify content language</p>
            </div>
            <Switch
              id="language-id"
              checked={localSettings.language_identification}
              onCheckedChange={(checked) => updateSetting('language_identification', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="error-id">Error Identification</Label>
              <p className="text-sm text-muted-foreground">Clear error messages and form validation</p>
            </div>
            <Switch
              id="error-id"
              checked={localSettings.error_identification}
              onCheckedChange={(checked) => updateSetting('error_identification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">WCAG 2.2 Level</span>
                <Badge variant="default">{localSettings.wcag_compliance_level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Compliance Score</span>
                <span className={`font-bold ${getComplianceColor()}`}>{complianceScore}%</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Keyboard Accessible</span>
                {localSettings.keyboard_navigation ? 
                  <Check className="w-5 h-5 text-green-600" /> : 
                  <X className="w-5 h-5 text-red-600" />
                }
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Screen Reader Ready</span>
                {localSettings.screen_reader_support ? 
                  <Check className="w-5 h-5 text-green-600" /> : 
                  <X className="w-5 h-5 text-red-600" />
                }
              </div>
            </div>
          </div>

          {complianceScore < 70 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Accessibility Improvements Needed</h4>
              <p className="text-sm text-yellow-700">
                Your current compliance score is below 70%. Consider enabling more accessibility features 
                to ensure your training is inclusive for all learners.
              </p>
            </div>
          )}

          {complianceScore >= 90 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Excellent Accessibility</h4>
              <p className="text-sm text-green-700">
                Your training module meets high accessibility standards and is inclusive for learners with disabilities.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};