import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { ScormPlayer } from "@/components/ui/scorm-player";
import { ScormSettingsPanel } from "@/components/ui/scorm-settings-panel";
import { SafeHtmlRenderer } from "@/components/ui/safe-html-renderer";
import { ScormPlayerSettings, defaultScormSettings } from "@/types/scorm-settings";
import { useState } from "react";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  is_completion_scene: boolean;
  auto_advance: boolean;
  completion_criteria: any;
  metadata: any;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

interface SceneViewerProps {
  scene: TrainingScene | null;
  isRendering?: boolean;
  renderingProgress?: number;
}

export const SceneViewer = ({ scene, isRendering = false, renderingProgress = 0 }: SceneViewerProps) => {
  const [scormSettings, setScormSettings] = useState<ScormPlayerSettings>(defaultScormSettings);
  
  // Debug logging
  console.log('🔍 SceneViewer Debug - FORCED LOGGING:', {
    scene: scene,
    sceneType: scene?.scene_type,
    scormPackageUrl: scene?.scorm_package_url,
    contentUrl: scene?.content_url,
    isRendering,
    hasScene: !!scene
  });
  
  // Force alert if scene has SCORM data
  if (scene?.scorm_package_url) {
    console.log('🚨 SCORM URL DETECTED:', scene.scorm_package_url);
  }

  if (!scene) {
    return (
      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No scene selected</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (scene.scene_type) {
      case 'video':
        if (isRendering) {
          return (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Rendering Video File</p>
                  <p className="text-sm text-muted-foreground">Please wait while your video is being processed...</p>
                  <div className="w-64 mx-auto">
                    <Progress value={renderingProgress} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{renderingProgress}% complete</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return scene.content_url ? (
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {scene.content_url.includes('vimeo.com') || scene.content_url.includes('player.vimeo.com') ? (
              <iframe
                src={scene.content_url}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={scene.title}
              />
            ) : (
              <video
                src={scene.content_url}
                className="w-full h-full object-cover"
                controls
                title={scene.title}
              />
            )}
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No video URL provided</p>
          </div>
        );
      
      case 'html':
        return (
          <div className="w-full min-h-96 bg-background border rounded-lg p-4">
            {scene.html_content ? (
              <SafeHtmlRenderer
                html={scene.html_content}
                className="w-full"
              />
            ) : (
              <p className="text-muted-foreground">No HTML content provided</p>
            )}
          </div>
        );
      
      case 'scorm':
        return (
          <div className="space-y-4">
            {scene.scorm_package_url ? (
              <ScormPlayer
                scormPackageUrl={scene.scorm_package_url}
                settings={scormSettings}
                onComplete={(score, duration) => {
                  console.log('SCORM completed:', { score, duration });
                }}
                onProgress={(progress) => {
                  console.log('SCORM progress:', progress);
                }}
              />
            ) : (
              <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No SCORM package uploaded</p>
                </div>
              </div>
            )}
            
            {/* SCORM Settings Panel */}
            <ScormSettingsPanel
              settings={scormSettings}
              onSettingsChange={setScormSettings}
              className="mt-4"
            />
          </div>
        );
      
      default:
        return (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Content type not supported in preview</p>
          </div>
        );
    }
  };

  return renderContent();
};