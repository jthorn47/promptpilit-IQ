import { useEffect } from "react";
import { VideoBuilderPanel } from "./VideoBuilderPanel";
import { TrainingBuilderRightPanel } from "./TrainingBuilderRightPanel";
import { TrainingPreviewModal } from "./TrainingPreviewModal";
import { TrainingIntroductionScreen } from "./components/TrainingIntroductionScreen";
import { TrainingBuilderLayout } from "./components/TrainingBuilderLayout";
import { TrainingActionBar } from "./components/TrainingActionBar";
import { useTrainingBuilder } from "./hooks/useTrainingBuilder";
import { useCompanyData } from "./hooks/useCompanyData";
import { useFileUpload } from "@/hooks/useFileUpload";

interface TrainingBuilderNewProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
  isNewModule?: boolean;
}

export const TrainingBuilderNew = ({ 
  moduleId, 
  moduleName, 
  onClose, 
  isNewModule = false 
}: TrainingBuilderNewProps) => {
  // Training builder hook
  const trainingBuilder = useTrainingBuilder({ moduleId, moduleName, isNewModule });
  
  // Company data hook
  const { companyLogo, companyName } = useCompanyData();
  
  // File upload hook - simplified since we mainly use SCORM
  const { uploading, uploadProgress, uploadFile } = useFileUpload({
    onFileUploaded: async (filePath: string, fileName: string) => {
      console.log('🔗 File uploaded:', { filePath, fileName });
      // Most file handling is now in the UploadManager component
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

  // Listen for custom events to create first scene
  useEffect(() => {
    const handleCreateFirstScene = async () => {
      const newModuleId = await createFirstScene();
      if (newModuleId) {
        fetchScenes();
      }
    };

    window.addEventListener('createFirstScene', handleCreateFirstScene);
    return () => window.removeEventListener('createFirstScene', handleCreateFirstScene);
  }, [createFirstScene, fetchScenes]);

  // Simple upload handlers (most logic moved to components)
  const handleUploadSCORM = () => {
    console.log('🎓 SCORM Upload button clicked');
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
          <p className="text-muted-foreground">Loading training builder...</p>
        </div>
      </div>
    );
  }

  // Introduction screen
  if (showIntroduction && (scenes.length === 0 || moduleName === "Core WPV Training")) {
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

  // Main builder interface
  return (
    <TrainingBuilderLayout
      moduleName={moduleName}
      lastSaved={formatLastSaved(lastSaved)}
      onClose={onClose}
      onBackToIntroduction={() => setShowIntroduction(true)}
      showBackButton={moduleName === "Core WPV Training" || moduleName.includes("WPV") || moduleName.includes("Workplace Violence")}
    >
      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-10 gap-8">
          {/* Left Panel - Video Builder (70%) */}
          <div className="col-span-7 space-y-6">
            {/* Only show header for non-Core WPV Training modules */}
            {!moduleName.includes("Core WPV") && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Training content builder</h2>
                {currentScene?.content_url && (
                  <p className="text-sm text-muted-foreground">
                    {currentScene.content_url.includes('vimeo.com') ? 'vimeo-video.mp4' : 'training-video.mp4'}
                  </p>
                )}
              </div>
            )}
            
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

          {/* Right Panel - Settings (30%) */}
          <div className="col-span-3">
            <TrainingBuilderRightPanel 
              key={`right-panel-${moduleId}`}
              sceneId={currentScene?.id}
              moduleId={moduleId}
              moduleName={moduleName}
              onVideoSelected={handleVideoSelected}
            />
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="border-t pt-6">
          <TrainingActionBar
            onSaveDraft={() => handleSaveAsDraft()}
            onPreview={handlePreviewTraining}
            onPublish={handlePublish}
          />
        </div>
      </div>

      {/* Training Preview Modal */}
      <TrainingPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        scene={currentScene}
        moduleName={moduleName}
      />
    </TrainingBuilderLayout>
  );
};