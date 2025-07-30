import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Layers,
  Plus,
  Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SceneQuestionManager } from "./SceneQuestionManager";
import { SceneFormDialog } from "./training/SceneFormDialog";
import { QuickAddButtons } from "./training/QuickAddButtons";
import { SceneList } from "./training/SceneList";
import { TrainingBuilder } from "./TrainingBuilder";
import { DocumentBuilder } from "./document-builder/DocumentBuilder";

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

interface TrainingSceneManagerProps {
  moduleId: string;
  moduleName: string;
}

export const TrainingSceneManager = ({ moduleId, moduleName }: TrainingSceneManagerProps) => {
  const [scenes, setScenes] = useState<TrainingScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<TrainingScene | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSceneForQuestions, setSelectedSceneForQuestions] = useState<TrainingScene | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDocumentBuilder, setShowDocumentBuilder] = useState(false);
  const [documentBuilderScene, setDocumentBuilderScene] = useState<TrainingScene | null>(null);
  const [autoOpenBuilder, setAutoOpenBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scene_type: "video" as TrainingScene['scene_type'],
    content_url: "",
    scorm_package_url: "",
    html_content: "",
    thumbnail_url: "",
    estimated_duration: 5,
    is_required: true,
    status: "active" as TrainingScene['status'],
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchScenes();
  }, [moduleId]);

  useEffect(() => {
    // Auto-open builder if no scenes exist (new module)
    if (!loading && scenes.length === 0) {
      setAutoOpenBuilder(true);
      setShowBuilder(true);
    }
  }, [loading, scenes.length]);

  const fetchScenes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_scenes")
        .select("*")
        .eq("training_module_id", moduleId)
        .order("scene_order", { ascending: true });

      if (error) {
        throw error;
      }

      setScenes((data || []) as TrainingScene[]);
    } catch (error) {
      console.error("Error fetching training scenes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch training scenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please enter a scene title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const sceneData = {
        ...formData,
        training_module_id: moduleId,
        estimated_duration: Number(formData.estimated_duration),
        scene_order: editingScene ? editingScene.scene_order : (scenes.length + 1),
        completion_criteria: { type: "time_based", required_percentage: 100 },
        metadata: {},
      };

      if (editingScene) {
        const { error } = await supabase
          .from("training_scenes")
          .update(sceneData)
          .eq("id", editingScene.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Training scene updated successfully",
        });
        
        setIsDialogOpen(false);
        resetForm();
        fetchScenes();
      } else {
        const { error } = await supabase
          .from("training_scenes")
          .insert([sceneData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Training scene created successfully. Opening builder...",
        });

        setIsDialogOpen(false);
        resetForm();
        await fetchScenes();
        
        // Auto-open builder when creating first scene
        setShowBuilder(true);
      }
    } catch (error: any) {
      console.error("Error saving training scene:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save training scene",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (scene: TrainingScene) => {
    // Handle document builder scenes specially
    if (scene.scene_type === 'document_builder') {
      setDocumentBuilderScene(scene);
      setShowDocumentBuilder(true);
      return;
    }
    
    setEditingScene(scene);
    setFormData({
      title: scene.title,
      description: scene.description || "",
      scene_type: scene.scene_type,
      content_url: scene.content_url || "",
      scorm_package_url: scene.scorm_package_url || "",
      html_content: scene.html_content || "",
      thumbnail_url: scene.thumbnail_url || "",
      estimated_duration: scene.estimated_duration,
      is_required: scene.is_required,
      status: scene.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training scene?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("training_scenes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training scene deleted successfully",
      });

      fetchScenes();
    } catch (error: any) {
      console.error("Error deleting training scene:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete training scene",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    console.log('Drag ended:', result); // Debug log
    
    if (!result.destination) {
      console.log('No destination, canceling drag'); // Debug log
      return;
    }
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    console.log('Moving from', sourceIndex, 'to', destinationIndex); // Debug log
    
    if (sourceIndex === destinationIndex) {
      console.log('Same position, no change needed'); // Debug log
      return;
    }

    try {
      // Create a new array with the reordered scenes
      const reorderedScenes = Array.from(scenes);
      const [removed] = reorderedScenes.splice(sourceIndex, 1);
      reorderedScenes.splice(destinationIndex, 0, removed);

      console.log('Reordered scenes:', reorderedScenes.map(s => `${s.scene_order}: ${s.title}`)); // Debug log

      // Update scene orders in the database
      const updates = reorderedScenes.map((scene, index) => ({
        id: scene.id,
        scene_order: index + 1
      }));

      console.log('Updates to apply:', updates); // Debug log

      // Update all scenes with new orders
      for (const update of updates) {
        await supabase
          .from("training_scenes")
          .update({ scene_order: update.scene_order })
          .eq("id", update.id);
      }

      toast({
        title: "Success",
        description: "Scenes reordered successfully",
      });

      fetchScenes();
    } catch (error) {
      console.error('Error reordering scenes:', error); // Debug log
      toast({
        title: "Error",
        description: "Failed to reorder scenes",
        variant: "destructive",
      });
    }
  };

  const moveScene = async (sceneId: string, direction: 'up' | 'down') => {
    const sceneIndex = scenes.findIndex(s => s.id === sceneId);
    const targetIndex = direction === 'up' ? sceneIndex - 1 : sceneIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    const currentScene = scenes[sceneIndex];
    const targetScene = scenes[targetIndex];

    try {
      // Swap scene orders
      await supabase.from("training_scenes").update({ scene_order: targetScene.scene_order }).eq("id", currentScene.id);
      await supabase.from("training_scenes").update({ scene_order: currentScene.scene_order }).eq("id", targetScene.id);
      
      fetchScenes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder scenes",
        variant: "destructive",
      });
    }
  };

  const toggleCompletionScene = async (sceneId: string) => {
    try {
      // First, unmark all other scenes as completion scenes
      await supabase
        .from("training_scenes")
        .update({ is_completion_scene: false })
        .eq("training_module_id", moduleId);

      // Then mark this scene as the completion scene
      const { error } = await supabase
        .from("training_scenes")
        .update({ is_completion_scene: true })
        .eq("id", sceneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Completion scene updated successfully",
      });

      fetchScenes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update completion scene",
        variant: "destructive",
      });
    }
  };

  const quickAddScene = async (type: TrainingScene['scene_type']) => {
    console.log('🚀 Quick adding scene of type:', type);
    const sceneCount = scenes.length;
    const quickData = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Scene ${sceneCount + 1}`,
      description: `Quick added ${type} scene`,
      scene_type: type,
      training_module_id: moduleId,
      estimated_duration: 5,
      scene_order: sceneCount + 1,
      is_required: true,
      status: 'active' as TrainingScene['status'],
      completion_criteria: { type: "time_based", required_percentage: 100 },
      metadata: {},
    };

    try {
      const { data, error } = await supabase
        .from("training_scenes")
        .insert([quickData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type} scene added successfully.`,
      });

      await fetchScenes();
      
      // Handle document builder scenes
      if (type === 'document_builder' && data) {
        console.log('🔧 Opening Document Builder for scene:', data);
        setDocumentBuilderScene(data as TrainingScene);
        setShowDocumentBuilder(true);
      } else if (sceneCount === 0) {
        // Auto-open builder for other scene types when creating first scene
        setShowBuilder(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add scene",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scene_type: "video",
      content_url: "",
      scorm_package_url: "",
      html_content: "",
      thumbnail_url: "",
      estimated_duration: 5,
      is_required: true,
      status: "active",
    });
    setEditingScene(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          Loading training scenes...
        </CardContent>
      </Card>
    );
  }

  if (showBuilder) {
    return (
      <TrainingBuilder
        moduleId={moduleId}
        moduleName={moduleName}
        onClose={() => {
          setShowBuilder(false);
          setAutoOpenBuilder(false);
        }}
        isNewModule={autoOpenBuilder}
      />
    );
  }

  if (showDocumentBuilder && documentBuilderScene) {
    return (
      <DocumentBuilder
        onSave={(document) => {
          // Update the scene with the document content
          supabase
            .from("training_scenes")
            .update({ 
              html_content: JSON.stringify(document),
              metadata: { document_id: document.id }
            })
            .eq("id", documentBuilderScene.id);
          
          toast({
            title: "Success",
            description: "Document saved successfully",
          });
          setShowDocumentBuilder(false);
          setDocumentBuilderScene(null);
        }}
        onClose={() => {
          setShowDocumentBuilder(false);
          setDocumentBuilderScene(null);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5" />
            <span>Training Scenes - {moduleName}</span>
          </CardTitle>
          <div className="flex gap-2">
            {scenes.length > 0 && (
              <Button onClick={() => setShowBuilder(true)} className="bg-gradient-primary">
                <Play className="w-4 h-4 mr-2" />
                Build Training
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scene
                </Button>
              </DialogTrigger>
            <SceneFormDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingScene={editingScene}
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isCreating={isCreating}
            />
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <QuickAddButtons onQuickAddScene={quickAddScene} />
        <SceneList
          scenes={scenes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveScene={moveScene}
          onToggleCompletionScene={toggleCompletionScene}
          onManageQuestions={setSelectedSceneForQuestions}
          onDragEnd={handleDragEnd}
        />
      </CardContent>
      
      {/* Question Manager */}
      {selectedSceneForQuestions && (
        <div className="mt-6">
          <SceneQuestionManager 
            sceneId={selectedSceneForQuestions.id}
            sceneName={selectedSceneForQuestions.title}
            onClose={() => setSelectedSceneForQuestions(null)}
          />
        </div>
      )}
    </Card>
  );
};