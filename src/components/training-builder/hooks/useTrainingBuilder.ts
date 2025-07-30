import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSceneManagement } from "./useSceneManagement";
import { useVimeoIntegration } from "./useVimeoIntegration";
import { useFileUpload } from "@/hooks/useFileUpload";

interface UseTrainingBuilderProps {
  moduleId: string;
  moduleName: string;
  isNewModule?: boolean;
}

export const useTrainingBuilder = ({ 
  moduleId, 
  moduleName, 
  isNewModule = false 
}: UseTrainingBuilderProps) => {
  const [showIntroduction, setShowIntroduction] = useState(isNewModule);
  const [showPreview, setShowPreview] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { toast } = useToast();
  
  // Custom hooks
  const {
    scenes,
    currentScene,
    currentSceneIndex,
    loading,
    actualModuleId,
    createFirstScene,
    updateSceneContent,
    fetchScenes,
  } = useSceneManagement(moduleId);
  
  const { vimeoVideos, searchVimeoVideos } = useVimeoIntegration();
  
  // Auto-save removed per El Jefe's request

  const handleSaveAsDraft = (silent = false) => {
    setLastSaved(new Date());
    if (!silent) {
      toast({
        title: "Success",
        description: "Training saved as draft",
      });
    }
  };

  const handlePreviewTraining = () => {
    if (!currentScene?.content_url && !currentScene?.scorm_package_url) {
      toast({
        title: "No Content",
        description: "Please add content before previewing",
        variant: "destructive",
      });
      return;
    }
    
    setShowPreview(true);
  };

  const handlePublish = () => {
    if (!currentScene?.content_url && !currentScene?.scorm_package_url) {
      toast({
        title: "Cannot Publish",
        description: "Please add content before publishing",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Training published successfully",
    });
  };

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentVideoTime(time);
  };

  const handleVideoSelected = async (videoUrl: string, videoName: string) => {
    console.log('🎯 handleVideoSelected called with:', { videoUrl, videoName });
    
    if (!currentScene) {
      console.error('❌ No current scene available');
      toast({
        title: "Error",
        description: "No training scene available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('💾 Updating scene content...');
      await updateSceneContent(currentScene.id, videoUrl, 'video');
      console.log('✅ Scene updated successfully');
      toast({
        title: "Video Added",
        description: `${videoName} has been added to your training`,
      });
    } catch (error) {
      console.error('❌ Failed to update scene:', error);
      toast({
        title: "Error",
        description: "Failed to add video to training",
        variant: "destructive",
      });
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Not saved";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Saved just now";
    if (diffMins === 1) return "Saved 1 minute ago";
    if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
    
    return `Saved at ${date.toLocaleTimeString()}`;
  };

  return {
    // State
    showIntroduction,
    setShowIntroduction,
    showPreview,
    setShowPreview,
    isRendering,
    setIsRendering,
    renderingProgress,
    setRenderingProgress,
    currentVideoTime,
    lastSaved,
    
    // Scene management
    scenes,
    currentScene,
    currentSceneIndex,
    loading,
    actualModuleId,
    createFirstScene,
    updateSceneContent,
    fetchScenes,
    
    // Vimeo integration
    vimeoVideos,
    searchVimeoVideos,
    
    // Handlers
    handleSaveAsDraft,
    handlePreviewTraining,
    handlePublish,
    handleVideoTimeUpdate,
    handleVideoSelected,
    formatLastSaved,
  };
};