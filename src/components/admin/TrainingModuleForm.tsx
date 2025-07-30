import { useState } from "react";
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
import { VimeoVideoManager } from "./VimeoVideoManager";
import { ScormFileUpload } from "../ScormFileUpload";

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: string;
  vimeo_video_id: string | null;
  vimeo_embed_url: string | null;
  completion_threshold_percentage: number;
  is_required: boolean;
  credit_value: number;
  quiz_enabled: boolean;
  status: string;
  scorm_file_path: string | null;
  scorm_file_name: string | null;
  scorm_compatible: boolean;
  scorm_version: string | null;
}

interface FormData {
  title: string;
  description: string;
  video_url: string;
  video_type: string;
  vimeo_video_id: string;
  vimeo_embed_url: string;
  completion_threshold_percentage: number;
  is_required: boolean;
  credit_value: number;
  quiz_enabled: boolean;
  status: string;
  scorm_file_path: string;
  scorm_file_name: string;
  scorm_compatible: boolean;
  scorm_version: string;
}

interface TrainingModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingModule: TrainingModule | null;
  formData: FormData;
  onFormDataChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const TrainingModuleForm = ({
  isOpen,
  onClose,
  editingModule,
  formData,
  onFormDataChange,
  onSubmit,
  isCreating
}: TrainingModuleFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingModule ? "Edit Training Module" : "Create Training Module"}
          </DialogTitle>
          <DialogDescription>
            {editingModule 
              ? "Update the training module details below"
              : "Create the basic information for your training module. You'll add scenes next."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Training Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Workplace Violence Prevention"
                value={formData.title}
                onChange={(e) => onFormDataChange('title', e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a detailed description of the training content..."
                value={formData.description}
                onChange={(e) => onFormDataChange('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="video_type">Video Type</Label>
              <Select value={formData.video_type} onValueChange={(value) => onFormDataChange('video_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vimeo">Vimeo (Recommended)</SelectItem>
                  <SelectItem value="scorm">SCORM Package</SelectItem>
                  <SelectItem value="upload">Upload Video</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.video_type !== 'vimeo' && formData.video_type !== 'scorm' && (
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  placeholder="Enter video URL or upload path"
                  value={formData.video_url}
                  onChange={(e) => onFormDataChange('video_url', e.target.value)}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="credit_value">Credit Value</Label>
              <Input
                id="credit_value"
                type="number"
                min="1"
                value={formData.credit_value}
                onChange={(e) => onFormDataChange('credit_value', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onFormDataChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vimeo Video Configuration */}
          {formData.video_type === 'vimeo' && (
            <div className="mt-6">
              <VimeoVideoManager
                currentVideoId={formData.vimeo_video_id}
                currentEmbedUrl={formData.vimeo_embed_url}
                onVideoUpdate={(videoData) => {
                  if (videoData) {
                    onFormDataChange('vimeo_video_id', videoData.videoId);
                    onFormDataChange('vimeo_embed_url', videoData.embedUrl);
                    onFormDataChange('video_url', `https://vimeo.com/${videoData.videoId}`);
                  } else {
                    onFormDataChange('vimeo_video_id', '');
                    onFormDataChange('vimeo_embed_url', '');
                    onFormDataChange('video_url', '');
                  }
                }}
              />
            </div>
          )}

          {/* SCORM Package Upload */}
          {formData.video_type === 'scorm' && (
            <div className="mt-6">
              <ScormFileUpload
                currentFilePath={formData.scorm_file_path}
                currentFileName={formData.scorm_file_name}
                onFileUploaded={(filePath, fileName) => {
                  onFormDataChange('scorm_file_path', filePath);
                  onFormDataChange('scorm_file_name', fileName);
                }}
              />
            </div>
          )}

          {/* Completion Settings */}
          {formData.video_type === 'vimeo' && (
            <div className="border-t pt-4">
              <Label htmlFor="completion_threshold">Completion Threshold (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="completion_threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.completion_threshold_percentage}
                  onChange={(e) => onFormDataChange('completion_threshold_percentage', Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Learners must watch this percentage of the video to complete the training
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => onFormDataChange('is_required', checked)}
              />
              <Label htmlFor="is_required">Required Training</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="quiz_enabled"
                checked={formData.quiz_enabled}
                onCheckedChange={(checked) => onFormDataChange('quiz_enabled', checked)}
              />
              <Label htmlFor="quiz_enabled">Enable Quiz</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="scorm_compatible"
                checked={formData.scorm_compatible}
                onCheckedChange={(checked) => onFormDataChange('scorm_compatible', checked)}
              />
              <Label htmlFor="scorm_compatible">SCORM Compatible</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating}>
            {isCreating ? "Creating..." : (editingModule ? "Update Module" : "Create & Add Scenes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};