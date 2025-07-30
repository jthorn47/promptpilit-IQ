import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Play } from "lucide-react";
import { SafeHtmlRenderer } from "@/components/ui/safe-html-renderer";
import { ThumbnailUploader } from "./ThumbnailUploader";

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

interface FormData {
  title: string;
  description: string;
  scene_type: TrainingScene['scene_type'];
  content_url: string;
  scorm_package_url: string;
  html_content: string;
  thumbnail_url: string;
  estimated_duration: number;
  is_required: boolean;
  status: TrainingScene['status'];
}

interface SceneFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingScene: TrainingScene | null;
  formData: FormData;
  onInputChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const SceneFormDialog = ({
  isOpen,
  onOpenChange,
  editingScene,
  formData,
  onInputChange,
  onSubmit,
  isCreating,
}: SceneFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editingScene ? "Edit Training Scene" : "Create Training Scene"}
          </DialogTitle>
          <DialogDescription>
            Add interactive content including SCORM packages, videos, HTML content, quizzes, and documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="scene_title">Scene Title *</Label>
              <Input
                id="scene_title"
                placeholder="e.g., Introduction Video, SCORM Module 1"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="scene_description">Description</Label>
              <Textarea
                id="scene_description"
                placeholder="Describe what learners will experience in this scene..."
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="scene_type">Scene Type *</Label>
              <Select value={formData.scene_type} onValueChange={(value) => onInputChange('scene_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scorm">SCORM Package</SelectItem>
                  <SelectItem value="video">Video Content</SelectItem>
                  <SelectItem value="html">HTML Content</SelectItem>
                  <SelectItem value="quiz">Interactive Quiz</SelectItem>
                  <SelectItem value="document">Document/PDF</SelectItem>
                  <SelectItem value="document_builder">Document Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="estimated_duration">Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) => onInputChange('estimated_duration', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <ThumbnailUploader
                currentThumbnail={formData.thumbnail_url}
                sceneTitle={formData.title}
                sceneDescription={formData.description}
                onThumbnailChange={(url) => onInputChange('thumbnail_url', url)}
              />
            </div>

            {formData.scene_type === 'scorm' && (
              <div className="md:col-span-2">
                <Label htmlFor="scorm_package_url">SCORM Package URL *</Label>
                <Input
                  id="scorm_package_url"
                  placeholder="https://example.com/scorm-package.zip"
                  value={formData.scorm_package_url}
                  onChange={(e) => onInputChange('scorm_package_url', e.target.value)}
                />
                {formData.scorm_package_url && (
                  <div className="mt-3 border rounded-md p-4">
                    <Label>SCORM Preview</Label>
                    <div className="mt-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded text-center">
                      <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                        <Play className="w-5 h-5" />
                        <span>SCORM Package Ready</span>
                      </div>
                      <p className="text-sm mt-2">SCORM package configured and ready for learners</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(formData.scene_type === 'video' || formData.scene_type === 'document') && (
              <div className="md:col-span-2">
                <Label htmlFor="content_url">Content URL *</Label>
                <Input
                  id="content_url"
                  placeholder="https://example.com/video.mp4 or /uploads/document.pdf"
                  value={formData.content_url}
                  onChange={(e) => onInputChange('content_url', e.target.value)}
                />
                {formData.scene_type === 'video' && formData.content_url && (
                  <div className="mt-3 border rounded-md p-4">
                    <Label>Video Preview</Label>
                    <video 
                      controls 
                      className="w-full max-w-md h-auto rounded-md border mt-2"
                      preload="metadata"
                    >
                      <source src={formData.content_url} type="video/mp4" />
                      <source src={formData.content_url} type="video/webm" />
                      <source src={formData.content_url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}

            {formData.scene_type === 'html' && (
              <div className="md:col-span-2">
                <Label htmlFor="html_content">HTML Content</Label>
                <Textarea
                  id="html_content"
                  placeholder="<div>Your interactive HTML content here...</div>"
                  value={formData.html_content}
                  onChange={(e) => onInputChange('html_content', e.target.value)}
                  rows={5}
                />
                {formData.html_content && (
                  <div className="mt-3 border rounded-md p-4">
                    <Label>HTML Preview</Label>
                    <SafeHtmlRenderer
                      html={formData.html_content}
                      className="mt-2 p-2 border rounded bg-muted/50"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label htmlFor="scene_status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => onInputChange('is_required', checked)}
              />
              <Label htmlFor="is_required">Required Scene</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating}>
            {isCreating ? "Saving..." : (editingScene ? "Update" : "Create")} Scene
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};