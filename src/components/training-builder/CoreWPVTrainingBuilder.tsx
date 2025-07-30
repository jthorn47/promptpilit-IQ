import { VideoBuilderPanel } from "./VideoBuilderPanel";
import { ScormSettingsPanel } from "./ScormSettingsPanel";
import { TrainingPreviewModal } from "./TrainingPreviewModal";
import { TrainingIntroductionScreen } from "./components/TrainingIntroductionScreen";
import { TrainingBuilderLayout } from "./components/TrainingBuilderLayout";
import { TrainingActionBar } from "./components/TrainingActionBar";
import { useTrainingBuilder } from "./hooks/useTrainingBuilder";
import { useCompanyData } from "./hooks/useCompanyData";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface CoreWPVTrainingBuilderProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
  isNewModule?: boolean;
}

export const CoreWPVTrainingBuilder = ({ 
  moduleId, 
  moduleName, 
  onClose, 
  isNewModule = false 
}: CoreWPVTrainingBuilderProps) => {
  const { toast } = useToast();
  
  // Training builder hook
  const trainingBuilder = useTrainingBuilder({ moduleId, moduleName, isNewModule });
  
  // Company data hook
  const { companyLogo, companyName } = useCompanyData();
  
  // File upload hook - Core WPV uses SCORM primarily
  const { uploading, uploadProgress, uploadFile } = useFileUpload({
    onFileUploaded: async (filePath: string, fileName: string) => {
      console.log('🔗 Core WPV File uploaded:', { filePath, fileName });
      // SCORM handling is in the UploadManager component
    }
  });

  // Extract values from training builder hook
  const {
    showIntroduction,
    setShowIntroduction,
    showPreview,
    setShowPreview,
    isRendering,
    renderingProgress,
    currentVideoTime,
    lastSaved,
    scenes,
    currentScene,
    loading,
    createFirstScene,
    fetchScenes,
    handleSaveAsDraft,
    handlePreviewTraining,
    handlePublish,
    handleVideoTimeUpdate,
    handleVideoSelected,
    formatLastSaved,
  } = trainingBuilder;

  // Clone Core WPV Training module
  const cloneModule = async (sourceModuleId: string, newTitle?: string) => {
    try {
      // Fetch source module
      const { data: sourceModule, error: moduleError } = await supabase
        .from('training_modules')
        .select('*')
        .eq('id', sourceModuleId)
        .single();

      if (moduleError) throw moduleError;

      // Fetch source scenes
      const { data: sourceScenes, error: scenesError } = await supabase
        .from('training_scenes')
        .select('*')
        .eq('training_module_id', sourceModuleId)
        .order('scene_order');

      if (scenesError) throw scenesError;

      // Generate new IDs
      const newModuleId = crypto.randomUUID();
      const newTitle_final = newTitle || `${sourceModule.title} (Clone)`;

      // Clone module data
      const clonedModuleData = {
        ...sourceModule,
        id: newModuleId,
        title: newTitle_final,
        status: 'draft'
      };
      
      // Remove timestamps to let database set new ones
      delete clonedModuleData.created_at;
      delete clonedModuleData.updated_at;

      // Insert cloned module
      const { error: insertModuleError } = await supabase
        .from('training_modules')
        .insert(clonedModuleData);

      if (insertModuleError) throw insertModuleError;

      // Clone scenes with new IDs
      const clonedScenes = (sourceScenes || []).map(scene => {
        const clonedScene = {
          ...scene,
          id: crypto.randomUUID(),
          training_module_id: newModuleId
        };
        
        // Remove timestamps to let database set new ones
        delete clonedScene.created_at;
        delete clonedScene.updated_at;
        
        return clonedScene;
      });

      // Insert cloned scenes
      if (clonedScenes.length > 0) {
        const { error: insertScenesError } = await supabase
          .from('training_scenes')
          .insert(clonedScenes);

        if (insertScenesError) throw insertScenesError;
      }

      toast({
        title: "Success",
        description: `Module "${newTitle_final}" cloned successfully with new ID: ${newModuleId}`,
      });

      // Give the database a moment to process, then redirect
      setTimeout(() => {
        window.location.href = `/admin/training-modules/edit/${newModuleId}`;
      }, 1000);

    } catch (error) {
      console.error('Error cloning module:', error);
      toast({
        title: "Error",
        description: "Failed to clone training module",
        variant: "destructive",
      });
    }
  };

  // Core WPV SCORM upload handler
  const handleUploadSCORM = () => {
    console.log('🎓 Core WPV SCORM Upload button clicked');
    const fileInput = document.getElementById('scorm-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Core WPV Training builder...</p>
        </div>
      </div>
    );
  }

  // Core WPV Introduction screen
  if (showIntroduction && scenes.length === 0) {
    return (
      <TrainingIntroductionScreen
        moduleName={moduleName}
        companyLogo={companyLogo}
        companyName={companyName}
        onClose={onClose}
        onStartBuilding={async () => {
          const newModuleId = await createFirstScene();
          if (newModuleId) {
            setShowIntroduction(false);
          }
        }}
      />
    );
  }

  // Core WPV Main builder interface
  return (
    <TrainingBuilderLayout
      moduleName={moduleName}
      lastSaved={formatLastSaved(lastSaved)}
      onClose={onClose}
      onBackToIntroduction={() => setShowIntroduction(true)}
      showBackButton={true}
      extraHeaderActions={
        <Button 
          onClick={() => cloneModule('fb33e984-b169-4b56-a442-09b4ac021f94', 'COR-1594 Clone')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Copy className="h-4 w-4 mr-2" />
          Clone COR-1594
        </Button>
      }
    >
      {/* Core WPV Main Content */}
      <div className="p-6 h-full overflow-hidden">
        <div className="h-full grid grid-cols-10 gap-8">
          {/* Left Panel - Core WPV Video Builder (70%) */}
          <div className="col-span-7 overflow-y-auto">
            <div className="space-y-6">
              <VideoBuilderPanel
                scene={currentScene}
                isRendering={isRendering}
                renderingProgress={renderingProgress}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onUploadVideo={() => {}}
                onUploadPDF={() => {}}
                onUploadSCORM={handleUploadSCORM}
                onTimeUpdate={handleVideoTimeUpdate}
                onVideoSelected={handleVideoSelected}
                onSceneRefresh={fetchScenes}
                moduleName={moduleName}
              />
            </div>
          </div>

          {/* Right Panel - Core WPV SCORM Settings (30%) */}
          <div className="col-span-3 overflow-y-auto">
            <ScormSettingsPanel 
              sceneId={currentScene?.id}
              moduleName={moduleName}
            />
          </div>
        </div>
      </div>

      {/* Core WPV Footer - Action Bar */}
      <TrainingActionBar
        onSaveDraft={() => handleSaveAsDraft()}
        onPreview={handlePreviewTraining}
        onPublish={handlePublish}
      />

      {/* Core WPV Training Preview Modal */}
      <TrainingPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        scene={currentScene}
        moduleName={moduleName}
      />
    </TrainingBuilderLayout>
  );
};