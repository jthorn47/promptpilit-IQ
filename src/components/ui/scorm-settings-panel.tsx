import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScormPlayerSettings } from '@/types/scorm-settings';

interface ScormSettingsPanelProps {
  settings: ScormPlayerSettings;
  onSettingsChange: (settings: ScormPlayerSettings) => void;
  className?: string;
}

export const ScormSettingsPanel = ({ settings, onSettingsChange, className }: ScormSettingsPanelProps) => {
  const handleSettingChange = (key: keyof ScormPlayerSettings, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>SCORM Player Settings</CardTitle>
        <CardDescription>
          Configure playback controls and user interaction options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Navigation Controls</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-fast-forward" className="text-sm">
                Allow Fast Forward
              </Label>
              <Switch
                id="allow-fast-forward"
                checked={settings.allowFastForward}
                onCheckedChange={(checked) => handleSettingChange('allowFastForward', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-rewind" className="text-sm">
                Allow Rewind
              </Label>
              <Switch
                id="allow-rewind"
                checked={settings.allowRewind}
                onCheckedChange={(checked) => handleSettingChange('allowRewind', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-seek" className="text-sm">
                Allow Seeking
              </Label>
              <Switch
                id="allow-seek"
                checked={settings.allowSeek}
                onCheckedChange={(checked) => handleSettingChange('allowSeek', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-3">User Interface</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-progress-bar" className="text-sm">
                Show Progress Bar
              </Label>
              <Switch
                id="show-progress-bar"
                checked={settings.showProgressBar}
                onCheckedChange={(checked) => handleSettingChange('showProgressBar', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-keyboard-shortcuts" className="text-sm">
                Keyboard Shortcuts
              </Label>
              <Switch
                id="allow-keyboard-shortcuts"
                checked={settings.allowKeyboardShortcuts}
                onCheckedChange={(checked) => handleSettingChange('allowKeyboardShortcuts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-volume-control" className="text-sm">
                Volume Control
              </Label>
              <Switch
                id="allow-volume-control"
                checked={settings.allowVolumeControl}
                onCheckedChange={(checked) => handleSettingChange('allowVolumeControl', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};