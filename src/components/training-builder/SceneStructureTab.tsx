import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  GripVertical,
  Video,
  Image,
  FileText,
  HelpCircle,
  Copy,
  Trash2,
  MoreVertical,
  Clock,
  Play,
  Wand2
} from "lucide-react";

interface TrainingScene {
  id: string;
  title: string;
  description: string;
  scene_type: 'video' | 'image' | 'quiz' | 'document' | 'scorm';
  content_url?: string;
  scorm_package_url?: string;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  auto_advance: boolean;
}

interface SceneStructureTabProps {
  scenes: TrainingScene[];
  onScenesChange: (scenes: TrainingScene[]) => void;
  onSceneSelect: (scene: TrainingScene) => void;
  selectedScene: TrainingScene | null;
}

export const SceneStructureTab = ({ 
  scenes, 
  onScenesChange, 
  onSceneSelect, 
  selectedScene 
}: SceneStructureTabProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update scene orders
    const updatedScenes = items.map((scene, index) => ({
      ...scene,
      scene_order: index
    }));

    onScenesChange(updatedScenes);
  };

  const addScene = (type: TrainingScene['scene_type']) => {
    const newScene: TrainingScene = {
      id: crypto.randomUUID(),
      title: `New ${type} Scene`,
      description: '',
      scene_type: type,
      scene_order: scenes.length,
      estimated_duration: 5,
      is_required: true,
      auto_advance: false
    };

    onScenesChange([...scenes, newScene]);
    onSceneSelect(newScene);
  };

  const deleteScene = (sceneId: string) => {
    const updatedScenes = scenes.filter(scene => scene.id !== sceneId);
    onScenesChange(updatedScenes);
    if (selectedScene?.id === sceneId) {
      onSceneSelect(updatedScenes[0] || null);
    }
  };

  const duplicateScene = (scene: TrainingScene) => {
    const duplicatedScene: TrainingScene = {
      ...scene,
      id: crypto.randomUUID(),
      title: `${scene.title} (Copy)`,
      scene_order: scenes.length
    };

    onScenesChange([...scenes, duplicatedScene]);
  };

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'scorm': return <Play className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSceneTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      case 'scorm': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex">
      {/* Scene List */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Course Structure</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Scene
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => addScene('video')}>
                <Video className="w-4 h-4 mr-2" />
                Video Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addScene('video')} className="bg-gradient-to-r from-purple-50 to-blue-50">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Video Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addScene('image')}>
                <Image className="w-4 h-4 mr-2" />
                Image Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addScene('quiz')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Questions Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addScene('document')}>
                <FileText className="w-4 h-4 mr-2" />
                Document Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addScene('scorm')}>
                <Play className="w-4 h-4 mr-2" />
                SCORM Scene
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="scenes">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {scenes.map((scene, index) => (
                  <Draggable key={scene.id} draggableId={scene.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`cursor-pointer transition-colors ${
                          selectedScene?.id === scene.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        onClick={() => onSceneSelect(scene)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getSceneIcon(scene.scene_type)}
                                <span className="font-medium text-sm truncate">
                                  {scene.title}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getSceneTypeColor(scene.scene_type)}`}
                                >
                                  {scene.scene_type.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {scene.estimated_duration}m
                                </div>
                                {scene.is_required && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => duplicateScene(scene)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteScene(scene.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {scenes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No scenes yet</p>
            <p className="text-xs">Add your first scene to get started</p>
          </div>
        )}

        {/* Course Statistics */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Course Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Total Scenes:</span>
              <span className="ml-2 font-medium">{scenes.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">
                {scenes.reduce((total, scene) => total + scene.estimated_duration, 0)}m
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Required:</span>
              <span className="ml-2 font-medium">
                {scenes.filter(scene => scene.is_required).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Quizzes:</span>
              <span className="ml-2 font-medium">
                {scenes.filter(scene => scene.scene_type === 'quiz').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Details */}
      <div className="flex-1 p-6">
        {selectedScene ? (
          <div>
            <h3 className="text-xl font-semibold mb-4">Scene Details</h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSceneIcon(selectedScene.scene_type)}
                  {selectedScene.title}
                  <Badge className={getSceneTypeColor(selectedScene.scene_type)}>
                    {selectedScene.scene_type.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {selectedScene.description || 'No description provided'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{selectedScene.estimated_duration} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium">Required:</span>
                    <span className="ml-2">{selectedScene.is_required ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auto-advance:</span>
                    <span className="ml-2">{selectedScene.auto_advance ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Order:</span>
                    <span className="ml-2">{selectedScene.scene_order + 1}</span>
                  </div>
                </div>

                {selectedScene.content_url && (
                  <div className="mt-4">
                    <span className="font-medium">Content URL:</span>
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedScene.content_url}
                    </p>
                  </div>
                )}

                {selectedScene.scorm_package_url && (
                  <div className="mt-4">
                    <span className="font-medium">SCORM Package:</span>
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedScene.scorm_package_url}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Scene</h3>
              <p className="text-sm">Choose a scene from the list to view and edit its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};