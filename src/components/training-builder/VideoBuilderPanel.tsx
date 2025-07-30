import { Card } from "@/components/ui/card";
import { ContentRenderer } from "./components/ContentRenderer";
import { UploadManager } from "./components/UploadManager";

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

interface VideoBuilderPanelProps {
  scene: TrainingScene | null;
  isRendering?: boolean;
  renderingProgress?: number;
  uploading?: boolean;
  uploadProgress?: number;
  onUploadVideo: () => void;
  onUploadPDF: () => void;
  onUploadSCORM: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVideoSelected?: (videoUrl: string, videoName: string) => void;
  onSceneRefresh?: () => void;
  moduleName?: string;
}

export const VideoBuilderPanel = ({
  scene,
  isRendering,
  renderingProgress,
  uploading,
  uploadProgress,
  onUploadVideo,
  onUploadPDF,
  onUploadSCORM,
  onTimeUpdate,
  onVideoSelected,
  onSceneRefresh,
  moduleName,
}: VideoBuilderPanelProps) => {

  return (
    <div className="space-y-6">
      {/* Content Player Area */}
      <Card className="overflow-hidden">
        <ContentRenderer scene={scene} onTimeUpdate={onTimeUpdate} moduleName={moduleName} />
      </Card>

      {/* Upload Manager - Always show for all modules */}
      <UploadManager 
        scene={scene}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onSceneRefresh={onSceneRefresh}
      />
    </div>
  );
};