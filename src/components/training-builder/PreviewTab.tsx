import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LearnerContentPlayer } from "@/components/learner/LearnerContentPlayer";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Eye,
  User,
  Clock,
  Award,
  ChevronRight,
  CheckCircle,
  Circle,
  Download,
  Accessibility,
  PenTool,
  Monitor
} from "lucide-react";

interface TrainingScene {
  id: string;
  title: string;
  description: string;
  scene_type: 'video' | 'image' | 'quiz' | 'document' | 'scorm' | 'document_builder';
  content_url?: string;
  scorm_package_url?: string;
  html_content?: string;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  auto_advance: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  industry: string;
  target_roles: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_completion_time: number;
  scorm_compatible: boolean;
  accessibility_compliant: boolean;
  scenes: TrainingScene[];
  metadata: {
    learning_objectives: string[];
    prerequisites: string[];
    completion_criteria: {
      min_score: number;
      required_scenes: string[];
    };
  };
}

interface PreviewTabProps {
  module: TrainingModule;
}

export const PreviewTab = ({ module }: PreviewTabProps) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [completedScenes, setCompletedScenes] = useState<Set<string>>(new Set());

  const markSceneComplete = (sceneId: string) => {
    setCompletedScenes(prev => new Set([...prev, sceneId]));
  };

  const currentScene = module.scenes[currentSceneIndex];
  const completionPercentage = (completedScenes.size / module.scenes.length) * 100;

  // If there's a current scene with video or SCORM content, show the actual player
  if (currentScene && (currentScene.scene_type === 'video' || currentScene.scene_type === 'scorm')) {
    return (
      <div className="h-full">
        <LearnerContentPlayer
          scene={{
            id: currentScene.id,
            title: currentScene.title,
            description: currentScene.description,
            scene_type: currentScene.scene_type,
            content_url: currentScene.content_url || null,
            scorm_package_url: currentScene.scorm_package_url || null,
            estimated_duration: currentScene.estimated_duration,
            training_module_id: module.id
          }}
          assignment={{
            id: 'preview-assignment',
            training_module_id: module.id,
            employee_id: 'preview-user'
          }}
          onNext={() => {
            markSceneComplete(currentScene.id);
            if (currentSceneIndex < module.scenes.length - 1) {
              setCurrentSceneIndex(currentSceneIndex + 1);
            }
          }}
        />
      </div>
    );
  }

  // For other content types or no scenes, show simplified preview
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        {!currentScene ? (
          <>
            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Scenes Available</h3>
            <p className="text-sm text-muted-foreground">Add scenes to your training module to preview them here</p>
          </>
        ) : (
          <>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{currentScene.title}</h3>
              <p className="text-muted-foreground mb-4">{currentScene.description}</p>
              <div className="text-sm text-muted-foreground">
                Scene Type: {currentScene.scene_type.toUpperCase()}
              </div>
            </div>
            {module.scenes.length > 1 && (
              <div className="mt-6 flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                  disabled={currentSceneIndex === 0}
                >
                  Previous Scene
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSceneIndex(Math.min(module.scenes.length - 1, currentSceneIndex + 1))}
                  disabled={currentSceneIndex === module.scenes.length - 1}
                >
                  Next Scene
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};