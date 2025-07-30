import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Video,
  GraduationCap,
  Monitor,
  FileText,
  Upload,
  PenTool,
  Wand2,
} from "lucide-react";

interface TrainingScene {
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document' | 'document_builder' | 'ai_video';
}

interface QuickAddButtonsProps {
  onQuickAddScene: (type: TrainingScene['scene_type']) => void;
}

export const QuickAddButtons = ({ onQuickAddScene }: QuickAddButtonsProps) => {
  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
      <Label className="text-sm font-medium mb-3 block">Quick Add Scenes:</Label>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('video')}
          className="flex items-center space-x-2"
        >
          <Video className="w-4 h-4" />
          <span>Video</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('ai_video')}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
        >
          <Wand2 className="w-4 h-4" />
          <span>AI Video</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('scorm')}
          className="flex items-center space-x-2"
        >
          <GraduationCap className="w-4 h-4" />
          <span>SCORM</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('html')}
          className="flex items-center space-x-2"
        >
          <Monitor className="w-4 h-4" />
          <span>HTML</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('quiz')}
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Question Builder</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('document')}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Document</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onQuickAddScene('document_builder')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
        >
          <PenTool className="w-4 h-4" />
          <span>Document Builder</span>
        </Button>
      </div>
    </div>
  );
};