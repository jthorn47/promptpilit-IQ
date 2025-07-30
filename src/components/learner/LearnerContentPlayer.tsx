import { useState, useEffect } from "react";
import { LearnerVideoPlayer } from "./LearnerVideoPlayer";
import { ScormPlayer } from "@/components/ui/scorm-player";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Scene {
  id: string;
  title: string;
  description: string;
  scene_type: string;
  content_url: string | null;
  scorm_package_url: string | null;
  estimated_duration: number;
  training_module_id: string;
}

interface Assignment {
  id: string;
  training_module_id: string;
  employee_id: string;
}

interface LearnerContentPlayerProps {
  scene: Scene;
  assignment: Assignment;
  onNext: () => void;
}

export const LearnerContentPlayer = ({ scene, assignment, onNext }: LearnerContentPlayerProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  console.log("🔍 Debug scene data:", {
    sceneType: scene.scene_type,
    scormUrl: scene.scorm_package_url,
    contentUrl: scene.content_url,
    fullScene: scene
  });

  useEffect(() => {
    checkExistingProgress();
  }, [scene.id, assignment.id]);

  const checkExistingProgress = async () => {
    try {
      // For now, just check video progress. SCORM progress will be handled by the SCORM player itself
      if (scene.scene_type !== 'scorm') {
        const { data } = await supabase
          .from("learner_video_progress")
          .select("is_completed")
          .eq("employee_id", assignment.employee_id)
          .eq("scene_id", scene.id)
          .eq("assignment_id", assignment.id)
          .maybeSingle();

        if (data?.is_completed) {
          setIsCompleted(true);
        }
      }
    } catch (error) {
      console.error("Error checking progress:", error);
    }
  };

  const handleScormComplete = async (score?: number) => {
    console.log("🎉 SCORM completion detected, score:", score);
    
    setIsCompleted(true);
    toast({
      title: "SCORM Training Complete!",
      description: `Score: ${score || 100}%`,
    });

    // Auto-advance after short delay
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  const handleVideoComplete = () => {
    console.log("📹 Video completion detected");
    setIsCompleted(true);
    onNext();
  };

  // Render SCORM content
  if (scene.scene_type === 'scorm') {
    console.log("🎓 Rendering SCORM content:", scene.scorm_package_url);
    
    if (!scene.scorm_package_url) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Missing SCORM Package</h2>
                <p className="text-muted-foreground">No SCORM package URL found for this training.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{scene.title}</h1>
            {scene.description && (
              <p className="text-muted-foreground">{scene.description}</p>
            )}
          </div>
          
          <ScormPlayer
            scormPackageUrl={scene.scorm_package_url}
            onComplete={handleScormComplete}
            employeeId={assignment.employee_id}
            trainingModuleId={assignment.training_module_id}
          />
        </div>
      </div>
    );
  }

  // Render video content (existing behavior)
  if (scene.scene_type === 'video' || scene.content_url) {
    if (!scene.content_url) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Missing Video Content</h2>
                <p className="text-muted-foreground">No video URL found for this training.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <LearnerVideoPlayer
        scene={{
          id: scene.id,
          title: scene.title,
          content_url: scene.content_url,
          estimated_duration: scene.estimated_duration,
        }}
        assignment={assignment}
        onNext={handleVideoComplete}
      />
    );
  }

  // Fallback for unknown scene types
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unsupported Content Type</h2>
            <p className="text-muted-foreground">
              Scene type "{scene.scene_type}" is not supported yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};