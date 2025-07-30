/**
 * Photo Settings Panel
 * Admin panel for configuring photo capture requirements
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Camera, Settings, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhotoCaptureService, CompanyPhotoSettings } from '../services/PhotoCaptureService';

interface PhotoSettingsPanelProps {
  companyId: string;
  className?: string;
}

export const PhotoSettingsPanel: React.FC<PhotoSettingsPanelProps> = ({
  companyId,
  className
}) => {
  const [settings, setSettings] = useState<CompanyPhotoSettings>({
    requirePunchPhotos: false,
    photoVerificationEnabled: false,
    qualityThreshold: 80
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [companyId]);

  const loadSettings = async () => {
    try {
      const photoSettings = await PhotoCaptureService.getCompanyPhotoSettings(companyId);
      setSettings(photoSettings);
    } catch (error) {
      console.error('Failed to load photo settings:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load photo settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const success = await PhotoCaptureService.updateCompanyPhotoSettings(
        companyId,
        settings
      );

      if (success) {
        toast({
          title: "Settings Saved",
          description: "Photo capture settings have been updated",
          variant: "default"
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Failed to save photo settings:', error);
      toast({
        title: "Save Error",
        description: "Failed to save photo settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof CompanyPhotoSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Camera className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Photo Capture Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure photo requirements for time punches
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* Require Photos */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="require-photos" className="text-sm font-medium">
              Require Photos
            </Label>
            <p className="text-sm text-muted-foreground">
              Employees must take a photo with every punch
            </p>
          </div>
          <Switch
            id="require-photos"
            checked={settings.requirePunchPhotos}
            onCheckedChange={(checked) => updateSetting('requirePunchPhotos', checked)}
          />
        </div>

        {/* Photo Verification */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="photo-verification" className="text-sm font-medium">
              Photo Verification
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable additional photo quality checks and analysis
            </p>
          </div>
          <Switch
            id="photo-verification"
            checked={settings.photoVerificationEnabled}
            onCheckedChange={(checked) => updateSetting('photoVerificationEnabled', checked)}
          />
        </div>

        {/* Quality Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Photo Quality Threshold
            </Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {settings.qualityThreshold}%
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[settings.qualityThreshold]}
              onValueChange={(value) => updateSetting('qualityThreshold', value[0])}
              max={100}
              min={30}
              step={5}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Photos below this quality score will be flagged for review
          </p>
        </div>

        {/* Warnings */}
        {settings.requirePunchPhotos && (
          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Photo Required Mode</p>
              <p className="text-orange-700">
                Employees will not be able to punch in/out without taking a photo. 
                Ensure devices have camera access enabled.
              </p>
            </div>
          </div>
        )}

        {settings.photoVerificationEnabled && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Verification Enabled</p>
              <p className="text-blue-700">
                Photos will be analyzed for quality and flagged if they don't meet standards.
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          onClick={loadSettings}
          disabled={isSaving}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};