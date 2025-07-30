import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  CheckCircle,
  HelpCircle,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QuestionBuilderTabs } from "./QuestionBuilderTabs";
import { TrainingBuilderLayout } from "./TrainingBuilderLayout";
import { SceneViewer } from "./SceneViewer";
import { ContentUploadPanel } from "./ContentUploadPanel";
import { useSceneManagement } from "./hooks/useSceneManagement";
import { useVimeoIntegration } from "./hooks/useVimeoIntegration";

interface TrainingBuilderRefactoredProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
  isNewModule?: boolean;
}

export const TrainingBuilderRefactored = ({ 
  moduleId, 
  moduleName, 
  onClose, 
  isNewModule = false 
}: TrainingBuilderRefactoredProps) => {
  // State management
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isCompleteTraining, setIsCompleteTraining] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(isNewModule);
  const [showContentOptions, setShowContentOptions] = useState(false);
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  
  const { toast } = useToast();
  
  // Custom hooks
  const {
    scenes,
    currentScene,
    currentSceneIndex,
    setCurrentSceneIndex,
    loading,
    actualModuleId,
    fetchScenes,
    createFirstScene,
    addScene,
    markAsCompletion,
    updateSceneContent,
  } = useSceneManagement(moduleId);
  
  const { vimeoVideos, searchVimeoVideos } = useVimeoIntegration();
  
  // File upload hook
  const { uploading, uploadProgress, uploadFile } = useFileUpload({
    onFileUploaded: async (filePath: string, fileName: string) => {
      if (!currentScene) return;
      
      if (filePath.includes('vimeo.com')) {
        setIsRendering(true);
        setRenderingProgress(0);
        
        const renderingInterval = setInterval(() => {
          setRenderingProgress(prev => {
            if (prev >= 90) {
              clearInterval(renderingInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 1000);
        
        setTimeout(() => {
          clearInterval(renderingInterval);
          setRenderingProgress(100);
          setTimeout(() => {
            setIsRendering(false);
            setRenderingProgress(0);
          }, 2000);
        }, 8000);
      }
      
      try {
        await updateSceneContent(currentScene.id, filePath, 'video');
        setShowContentOptions(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update scene with video URL",
          variant: "destructive",
        });
        setIsRendering(false);
      }
    }
  });

  // SCORM upload handler
  const uploadScormFile = async (file: File) => {
    console.log('🎓 SCORM Upload started:', file.name, file.size);
    
    if (!currentScene) {
      console.log('❌ No current scene selected');
      toast({
        title: "Error",
        description: "No scene selected. Please select a scene first.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Current scene:', currentScene.id, currentScene.title);

    try {
      const fileName = `scorm_${Date.now()}_${file.name}`;
      const filePath = `training-files/${fileName}`;
      
      console.log('📤 Uploading to:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('training-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully');

      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrl);

      console.log('💾 Updating scene content...');
      console.log('Scene ID:', currentScene.id);
      console.log('URL:', publicUrl);
      console.log('Type:', 'scorm');
      
      await updateSceneContent(currentScene.id, publicUrl, 'scorm');
      console.log('✅ Scene content updated');
      
      // Force refresh the scenes to see the update
      await fetchScenes();
      console.log('✅ Scenes refreshed');
      
      setShowContentOptions(false);
      
      toast({
        title: "Success",
        description: "SCORM package uploaded successfully",
      });
    } catch (error: any) {
      console.error('❌ SCORM upload failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload SCORM package",
        variant: "destructive",
      });
    }
  };

  // Handlers
  const handleNext = () => {
    if (currentScene?.is_completion_scene || currentSceneIndex === scenes.length - 1) {
      setIsCompleteTraining(true);
      return;
    }
    
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (isCompleteTraining) {
      setIsCompleteTraining(false);
      return;
    }
    
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    } else {
      onClose();
    }
  };

  const handleVimeoSelect = async (videoId: string, embedUrl: string) => {
    if (!currentScene) {
      toast({
        title: "Error",
        description: "No scene selected. Please select a scene first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateSceneContent(currentScene.id, embedUrl, 'video');
      setShowContentOptions(false);
      
      toast({
        title: "Success",
        description: "Vimeo video selected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to select video",
        variant: "destructive",
      });
    }
  };

  const handleScormSelect = async (scormUrl: string) => {
    if (!currentScene) {
      toast({
        title: "Error",
        description: "No scene selected. Please select a scene first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateSceneContent(currentScene.id, scormUrl, 'scorm');
      setShowContentOptions(false);
      
      toast({
        title: "Success",
        description: "Existing SCORM package selected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to select SCORM package",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const { error } = await supabase
        .from("training_modules")
        .update({ status: "draft" })
        .eq("id", actualModuleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training saved as draft",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save as draft",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase
        .from("training_modules")
        .update({ status: "published" })
        .eq("id", actualModuleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training published to library",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish training",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading training builder...</p>
        </div>
      </div>
    );
  }

  // Introduction screen
  if (showIntroduction && scenes.length === 0) {
    return (
      <TrainingBuilderLayout
        moduleName={`${moduleName} - Introduction`}
        currentSceneIndex={0}
        totalScenes={0}
        isPreviewMode={false}
        showQuestions={false}
        isCompletionScene={false}
        onClose={onClose}
        onTogglePreview={() => {}}
        onToggleQuestions={() => {}}
        onMarkAsLast={() => {}}
      >
        <div className="flex-1 p-6">
          <Card className="max-w-4xl mx-auto h-full">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl mb-4">Welcome to Training Module Builder</CardTitle>
              <p className="text-lg text-muted-foreground">
                This is your training introduction screen. You can customize this content to introduce learners to your training module.
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="w-full max-w-2xl">
                <h2 className="text-2xl font-semibold mb-4">Training Objectives</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Learn key concepts and skills</li>
                  <li>• Apply knowledge through interactive exercises</li>
                  <li>• Complete assessments to demonstrate understanding</li>
                  <li>• Receive certification upon successful completion</li>
                </ul>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onClose}>
                  Edit Introduction
                </Button>
                <Button 
                  onClick={async () => {
                    const newModuleId = await createFirstScene();
                    if (newModuleId) {
                      setShowIntroduction(false);
                    }
                  }} 
                  className="bg-gradient-primary"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Building Scenes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TrainingBuilderLayout>
    );
  }

  // Completion screen
  if (isCompleteTraining) {
    return (
      <TrainingBuilderLayout
        moduleName={`${moduleName} - Complete Training`}
        currentSceneIndex={currentSceneIndex}
        totalScenes={scenes.length}
        isPreviewMode={false}
        showQuestions={false}
        isCompletionScene={false}
        onClose={onClose}
        onTogglePreview={() => {}}
        onToggleQuestions={() => {}}
        onMarkAsLast={() => {}}
      >
        <div className="flex-1 p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Training Complete!</CardTitle>
              <p className="text-muted-foreground text-lg">
                You have successfully completed: {moduleName}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{scenes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Scenes</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {scenes.reduce((acc, scene) => acc + scene.estimated_duration, 0)} min
                  </div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Completion</div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <Button onClick={() => setIsCompleteTraining(false)} className="bg-gradient-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Preview Training Again
                </Button>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleSaveAsDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button onClick={handlePublish} className="bg-gradient-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Publish to Library
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TrainingBuilderLayout>
    );
  }

  // Main builder interface
  return (
    <TrainingBuilderLayout
      moduleName={moduleName}
      currentSceneIndex={currentSceneIndex}
      totalScenes={scenes.length}
      isPreviewMode={isPreviewMode}
      showQuestions={showQuestions}
      isCompletionScene={currentScene?.is_completion_scene || false}
      onClose={onClose}
      onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
      onToggleQuestions={() => setShowQuestions(!showQuestions)}
      onMarkAsLast={() => currentScene && markAsCompletion(currentScene.id)}
    >
      {!isPreviewMode ? (
        <div className="h-full p-6">
          <div className="h-full grid grid-cols-2 gap-6">
            {/* Left Panel - Training Video Builder */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Training video builder</h2>
                {currentScene?.content_url && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentScene.content_url.split('/').pop() || 'training-video.mp4'}
                  </p>
                )}
              </div>
              
              <Card className="overflow-hidden">
                <SceneViewer 
                  scene={currentScene}
                  isRendering={isRendering}
                  renderingProgress={renderingProgress}
                />
              </Card>
              
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContentOptions(true)}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload video
                </Button>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContentOptions(true)}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowContentOptions(true)}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload SCORM or image
                </Button>
              </div>
            </div>

            {/* Right Panel - Question Builder */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Question builder</h2>
              </div>
              
              <QuestionBuilderTabs
                currentScene={currentScene}
                onClose={() => setShowQuestions(false)}
              />
            </div>
          </div>

          {/* Content Upload Panel */}
          <ContentUploadPanel
            isOpen={showContentOptions}
            onClose={() => setShowContentOptions(false)}
            hasExistingContent={!!(currentScene && (currentScene.content_url || currentScene.scorm_package_url || currentScene.html_content))}
            uploading={uploading}
            uploadProgress={uploadProgress}
            vimeoVideos={vimeoVideos}
            onFileUpload={uploadFile}
            onVimeoSearch={searchVimeoVideos}
            onVimeoSelect={handleVimeoSelect}
            onScormUpload={uploadScormFile}
            onScormSelect={handleScormSelect}
            showScormUpload={true} // Enable SCORM for regular modules too
          />
        </div>
      ) : (
        /* Learner Preview */
        <div className="h-full p-6 bg-gradient-to-br from-muted/20 to-background">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <Card className="flex-1">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">{currentScene?.title}</CardTitle>
                <p className="text-muted-foreground text-lg">{currentScene?.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <SceneViewer 
                  scene={currentScene}
                  isRendering={isRendering}
                  renderingProgress={renderingProgress}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleSaveAsDraft}>
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
              Preview Training
            </Button>
            <Button onClick={handlePublish} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Publish
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {scenes.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentSceneIndex
                    ? "bg-primary"
                    : index < currentSceneIndex
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentSceneIndex === scenes.length - 1 && !currentScene?.is_completion_scene ? (
              <>
                <Button variant="outline" onClick={addScene}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Add Scene
                </Button>
                <Button onClick={handleNext}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Training
                </Button>
              </>
            ) : (
              <Button onClick={handleNext}>
                {currentScene?.is_completion_scene ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Training
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </TrainingBuilderLayout>
  );
};