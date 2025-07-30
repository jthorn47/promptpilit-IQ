import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  HelpCircle,
  GraduationCap,
  Video,
  Monitor,
  FileText,
  Upload,
  Layers,
  PenTool,
  GripVertical,
} from "lucide-react";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document' | 'document_builder';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  thumbnail_url: string | null;
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

interface SceneItemProps {
  scene: TrainingScene;
  index: number;
  totalScenes: number;
  onEdit: (scene: TrainingScene) => void;
  onDelete: (id: string) => void;
  onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  onToggleCompletionScene: (sceneId: string) => void;
  onManageQuestions: (scene: TrainingScene) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const SceneItem = ({
  scene,
  index,
  totalScenes,
  onEdit,
  onDelete,
  onMoveScene,
  onToggleCompletionScene,
  onManageQuestions,
  dragHandleProps,
  isDragging = false,
}: SceneItemProps) => {
  
  const getSceneTypeIcon = (type: string) => {
    switch (type) {
      case 'scorm':
        return <GraduationCap className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'html':
        return <Monitor className="w-4 h-4" />;
      case 'quiz':
        return <FileText className="w-4 h-4" />;
      case 'document':
        return <Upload className="w-4 h-4" />;
      case 'document_builder':
        return <PenTool className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getSceneTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'scorm':
        return 'default';
      case 'video':
        return 'secondary';
      case 'html':
        return 'outline';
      case 'document_builder':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className={`border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 ${
      isDragging ? 'shadow-lg bg-muted/50' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <button
            {...dragHandleProps}
            type="button"
            className="text-muted-foreground cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded select-none touch-none border-0 bg-transparent"
            title="Drag to reorder"
            style={{ touchAction: 'none' }}
            onClick={() => {
              console.log('Drag handle clicked!'); // Debug log
              alert('Drag handle clicked!');
            }}
          >
            <GripVertical className="w-4 h-4 pointer-events-none" />
          </button>
          {scene.thumbnail_url && (
            <img 
              src={scene.thumbnail_url} 
              alt={`${scene.title} thumbnail`}
              className="w-16 h-12 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span className="text-sm font-mono">#{scene.scene_order}</span>
            {getSceneTypeIcon(scene.scene_type)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{scene.title}</div>
            <div className="text-sm text-muted-foreground">
              {scene.description}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getSceneTypeBadgeVariant(scene.scene_type)} className="text-xs">
                {scene.scene_type.toUpperCase()}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{scene.estimated_duration} min</span>
              </div>
              {scene.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {scene.is_completion_scene && (
                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completion
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageQuestions(scene)}
            title="Manage questions"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={scene.is_completion_scene ? "default" : "outline"}
            onClick={() => onToggleCompletionScene(scene.id)}
            title="Mark as completion scene"
            className={scene.is_completion_scene ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveScene(scene.id, 'up')}
            disabled={index === 0}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveScene(scene.id, 'down')}
            disabled={index === totalScenes - 1}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(scene)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(scene.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};