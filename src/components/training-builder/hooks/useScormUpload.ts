import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseScormUploadProps {
  onSceneRefresh?: () => void;
}

export const useScormUpload = ({ onSceneRefresh }: UseScormUploadProps = {}) => {
  const { toast } = useToast();

  const uploadScormPackage = async (file: File, sceneId: string) => {
    console.log('🎓 SCORM File selected:', file.name, file.type, file.size);
    
    if (!file.name.endsWith('.zip')) {
      console.log('❌ Invalid file type:', file.name);
      toast({
        title: "Invalid File",
        description: "Please select a ZIP file containing SCORM content",
        variant: "destructive",
      });
      return false;
    }

    if (!sceneId) {
      toast({
        title: "Error", 
        description: "No scene selected. Please select a scene first.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Upload to Supabase Storage
      const fileName = `scorm_${Date.now()}_${file.name}`;
      const filePath = `training-files/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('training-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(filePath);
      
      console.log('✅ SCORM file uploaded to:', publicUrl);

      // Update the scene with SCORM content
      const { error: updateError } = await supabase
        .from('training_scenes')
        .update({
          scene_type: 'scorm',
          scorm_package_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', sceneId);

      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "SCORM package uploaded and scene updated successfully",
      });
      
      // Refresh scene data
      if (onSceneRefresh) {
        onSceneRefresh();
      }
      
      return true;
      
    } catch (error: any) {
      console.error('❌ SCORM upload failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload SCORM package",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadScormPackage,
  };
};