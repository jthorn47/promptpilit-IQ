import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScormSettingsPanel as SettingsPanel } from '@/components/ui/scorm-settings-panel';
import { ScormPlayerSettings, defaultScormSettings } from '@/types/scorm-settings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save } from 'lucide-react';

interface ScormSettingsPanelProps {
  sceneId?: string;
  moduleName: string;
}

const DEFAULT_SCORM_PACKAGES = {
  'Workplace Violence Training': 'https://example.com/default-workplace-violence-scorm.zip',
  // Add more default packages here
};

export const ScormSettingsPanel = ({ sceneId, moduleName }: ScormSettingsPanelProps) => {
  const [settings, setSettings] = useState<ScormPlayerSettings>(defaultScormSettings);
  const [sceneSettings, setSceneSettings] = useState({
    estimatedDuration: 30,
    isRequired: true,
    isCompletionScene: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load scene settings on mount
  useEffect(() => {
    if (sceneId) {
      loadSceneSettings();
    }
  }, [sceneId]);

  // Check if this is Workplace Violence Training and set default SCORM
  useEffect(() => {
    if (moduleName.toLowerCase().includes('workplace violence') && sceneId) {
      setDefaultScormPackage();
    }
  }, [moduleName, sceneId]);

  const loadSceneSettings = async () => {
    if (!sceneId) return;

    try {
      const { data: scene, error } = await supabase
        .from('training_scenes')
        .select('*')
        .eq('id', sceneId)
        .single();

      if (error) throw error;

      if (scene) {
        setSceneSettings({
          estimatedDuration: scene.estimated_duration || 30,
          isRequired: scene.is_required || true,
          isCompletionScene: scene.is_completion_scene || true,
        });

        // Load SCORM settings from metadata if available
        if (scene.metadata && typeof scene.metadata === 'object' && 'scormSettings' in scene.metadata) {
          const scormSettings = scene.metadata.scormSettings as Partial<ScormPlayerSettings>;
          setSettings({ ...defaultScormSettings, ...scormSettings });
        }
      }
    } catch (error) {
      console.error('Failed to load scene settings:', error);
    }
  };

  const setDefaultScormPackage = async () => {
    if (!sceneId) return;

    const defaultPackageUrl = DEFAULT_SCORM_PACKAGES['Workplace Violence Training'];
    if (defaultPackageUrl) {
      try {
        const { error } = await supabase
          .from('training_scenes')
          .update({
            scorm_package_url: defaultPackageUrl,
            scene_type: 'scorm',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sceneId);

        if (error) throw error;

        toast({
          title: "Default SCORM Applied",
          description: "Workplace Violence Training SCORM package has been applied.",
        });
      } catch (error) {
        console.error('Failed to set default SCORM package:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!sceneId) return;

    setIsSaving(true);
    try {
      // Update scene with settings and metadata
      const { error } = await supabase
        .from('training_scenes')
        .update({
          title: `${moduleName} - Scene`,
          description: `Training scene for ${moduleName}`,
          estimated_duration: sceneSettings.estimatedDuration,
          is_required: sceneSettings.isRequired,
          is_completion_scene: sceneSettings.isCompletionScene,
          metadata: {
            scormSettings: settings as any,
          } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sceneId);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "SCORM settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save SCORM settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if this is Core WPV Training to hide certain settings
  const isCoreWPVTraining = moduleName === 'Core WPV Training';

  return (
    <div className="space-y-6">

      {/* SCORM Player Settings */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Save Button */}
      <Button 
        onClick={handleSaveSettings} 
        disabled={isSaving || !sceneId}
        className="w-full"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
            Saving Settings...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save SCORM Settings
          </>
        )}
      </Button>
    </div>
  );
};