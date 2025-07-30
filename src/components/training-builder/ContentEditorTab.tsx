import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Video,
  Image,
  FileText,
  HelpCircle,
  Play,
  Volume2,
  Download,
  Eye,
  Settings,
  Globe,
  Accessibility,
  Plus
} from "lucide-react";

interface TrainingScene {
  id: string;
  title: string;
  description: string;
  scene_type: 'video' | 'image' | 'quiz' | 'document' | 'scorm';
  content_url?: string;
  scorm_package_url?: string;
  html_content?: string;
  estimated_duration: number;
  is_required: boolean;
  auto_advance: boolean;
}

interface ContentEditorTabProps {
  selectedScene: TrainingScene | null;
  onSceneUpdate: (scene: TrainingScene) => void;
}

export const ContentEditorTab = ({ selectedScene, onSceneUpdate }: ContentEditorTabProps) => {
  const [activeContentTab, setActiveContentTab] = useState<'basic' | 'media' | 'quiz' | 'accessibility' | 'multilingual'>('basic');

  if (!selectedScene) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Scene Selected</h3>
          <p className="text-sm">Select a scene from the structure tab to edit its content</p>
        </div>
      </div>
    );
  }

  const updateScene = (updates: Partial<TrainingScene>) => {
    onSceneUpdate({ ...selectedScene, ...updates });
  };

  const renderBasicEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scene-title">Scene Title</Label>
            <Input
              id="scene-title"
              value={selectedScene.title}
              onChange={(e) => updateScene({ title: e.target.value })}
              placeholder="Enter scene title"
            />
          </div>

          <div>
            <Label htmlFor="scene-description">Description</Label>
            <Textarea
              id="scene-description"
              value={selectedScene.description}
              onChange={(e) => updateScene({ description: e.target.value })}
              placeholder="Describe what learners will see or do in this scene"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={selectedScene.estimated_duration}
                onChange={(e) => updateScene({ estimated_duration: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Scene Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={selectedScene.is_required}
                    onCheckedChange={(checked) => updateScene({ is_required: checked })}
                  />
                  <Label htmlFor="required">Required Scene</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-advance"
                    checked={selectedScene.auto_advance}
                    onCheckedChange={(checked) => updateScene({ auto_advance: checked })}
                  />
                  <Label htmlFor="auto-advance">Auto-advance after completion</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedScene.scene_type !== 'quiz' && (
        <Card>
          <CardHeader>
            <CardTitle>HTML Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={selectedScene.html_content || ''}
              onChange={(e) => updateScene({ html_content: e.target.value })}
              placeholder="Add custom HTML content, instructions, or text overlays"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              HTML content will be displayed alongside media content. Use for instructions, captions, or additional information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMediaEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedScene.scene_type === 'video' && <Video className="w-5 h-5" />}
            {selectedScene.scene_type === 'image' && <Image className="w-5 h-5" />}
            {selectedScene.scene_type === 'document' && <FileText className="w-5 h-5" />}
            {selectedScene.scene_type === 'scorm' && <Play className="w-5 h-5" />}
            {selectedScene.scene_type.charAt(0).toUpperCase() + selectedScene.scene_type.slice(1)} Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedScene.scene_type === 'video' && (
            <>
              <div>
                <Label>Video URL or File</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={selectedScene.content_url || ''}
                    onChange={(e) => updateScene({ content_url: e.target.value })}
                    placeholder="Enter video URL or upload file"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="autoplay" />
                  <Label htmlFor="autoplay">Autoplay</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="controls" defaultChecked />
                  <Label htmlFor="controls">Show controls</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="subtitles" />
                  <Label htmlFor="subtitles">Subtitles available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="audio-desc" />
                  <Label htmlFor="audio-desc">Audio descriptions</Label>
                </div>
              </div>
            </>
          )}

          {selectedScene.scene_type === 'image' && (
            <>
              <div>
                <Label>Image URL or File</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={selectedScene.content_url || ''}
                    onChange={(e) => updateScene({ content_url: e.target.value })}
                    placeholder="Enter image URL or upload file"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Alt Text (Required for Accessibility)</Label>
                <Input
                  placeholder="Describe the image for screen readers"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {selectedScene.scene_type === 'document' && (
            <>
              <div>
                <Label>Document URL or File</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={selectedScene.content_url || ''}
                    onChange={(e) => updateScene({ content_url: e.target.value })}
                    placeholder="Enter document URL or upload PDF"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="downloadable" />
                <Label htmlFor="downloadable">Allow download</Label>
              </div>
            </>
          )}

          {selectedScene.scene_type === 'scorm' && (
            <>
              <div>
                <Label>SCORM Package</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={selectedScene.scorm_package_url || ''}
                    onChange={(e) => updateScene({ scorm_package_url: e.target.value })}
                    placeholder="SCORM package URL"
                    readOnly
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload SCORM
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4" />
                  SCORM Information
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Version:</strong> SCORM 2004</p>
                  <p><strong>Status:</strong> Ready for deployment</p>
                  <p><strong>Tracking:</strong> Completion, Score, Time</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <Label>Audio Narration (Optional)</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Upload audio narration for this scene" />
              <Button variant="outline">
                <Volume2 className="w-4 h-4 mr-2" />
                Upload Audio
              </Button>
            </div>
          </div>

          <div>
            <Label>Downloadable Resources</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Download className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Add downloadable resources like PDFs, worksheets, or reference materials
              </p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuizEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Quiz Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Configure quiz settings and questions for this scene.
          </p>
          <Button>
            <HelpCircle className="w-4 h-4 mr-2" />
            Open Quiz Builder
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilityEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Screen Reader Text</Label>
            <Textarea
              placeholder="Additional context for screen readers"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="keyboard-nav" defaultChecked />
              <Label htmlFor="keyboard-nav">Keyboard navigation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="high-contrast" />
              <Label htmlFor="high-contrast">High contrast mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="captions" />
              <Label htmlFor="captions">Captions available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="audio-descriptions" />
              <Label htmlFor="audio-descriptions">Audio descriptions</Label>
            </div>
          </div>

          <div>
            <Label>Focus Order</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Define the tab order for interactive elements
            </p>
            <Textarea
              placeholder="Describe the focus order for this scene"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMultilingualEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Multilingual Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Available Languages</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">English (Default)</Badge>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Spanish
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <Label>English Content</Label>
            <div className="space-y-3 mt-2">
              <Input
                value={selectedScene.title}
                onChange={(e) => updateScene({ title: e.target.value })}
                placeholder="Scene title in English"
              />
              <Textarea
                value={selectedScene.description}
                onChange={(e) => updateScene({ description: e.target.value })}
                placeholder="Scene description in English"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Spanish Translation</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add Spanish translations to make this training accessible to Spanish-speaking learners.
            </p>
            <div className="space-y-3">
              <Input placeholder="Título de la escena en español" />
              <Textarea
                placeholder="Descripción de la escena en español"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {selectedScene.scene_type.toUpperCase()}
          </Badge>
          <h2 className="text-xl font-semibold">{selectedScene.title}</h2>
        </div>
      </div>

      <Tabs value={activeContentTab} onValueChange={(value: any) => setActiveContentTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 border-b rounded-none h-auto p-0">
          <TabsTrigger value="basic" className="rounded-none py-3 px-4">
            <Settings className="w-4 h-4 mr-2" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-none py-3 px-4">
            <Video className="w-4 h-4 mr-2" />
            Media
          </TabsTrigger>
          {selectedScene.scene_type === 'quiz' && (
            <TabsTrigger value="quiz" className="rounded-none py-3 px-4">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quiz
            </TabsTrigger>
          )}
          <TabsTrigger value="accessibility" className="rounded-none py-3 px-4">
            <Accessibility className="w-4 h-4 mr-2" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="multilingual" className="rounded-none py-3 px-4">
            <Globe className="w-4 h-4 mr-2" />
            Multilingual
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          <TabsContent value="basic" className="m-0">
            {renderBasicEditor()}
          </TabsContent>
          
          <TabsContent value="media" className="m-0">
            {renderMediaEditor()}
          </TabsContent>
          
          {selectedScene.scene_type === 'quiz' && (
            <TabsContent value="quiz" className="m-0">
              {renderQuizEditor()}
            </TabsContent>
          )}
          
          <TabsContent value="accessibility" className="m-0">
            {renderAccessibilityEditor()}
          </TabsContent>
          
          <TabsContent value="multilingual" className="m-0">
            {renderMultilingualEditor()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};