import React from 'react';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ScormPackageUpload } from "./upload/ScormPackageUpload";
import { IndexFileUpload } from "./upload/IndexFileUpload";
import { FileUploadProgress } from "./upload/FileUploadProgress";
import { UploadedFileDisplay } from "./upload/UploadedFileDisplay";

interface ScormFileUploadProps {
  onFileUploaded: (filePath: string, fileName: string) => void;
  currentFilePath?: string;
  currentFileName?: string;
}

export const ScormFileUpload = ({ 
  onFileUploaded, 
  currentFilePath, 
  currentFileName 
}: ScormFileUploadProps) => {
  const { toast } = useToast();
  const { uploading, uploadProgress, uploadFile } = useFileUpload({ onFileUploaded });

  const handleRemoveFile = async () => {
    if (!currentFilePath) return;

    try {
      // Extract file path from URL
      const urlParts = currentFilePath.split('/');
      const filePath = `scorm/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('training-files')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        // Continue anyway as the file might not exist
      }

      // Notify parent component
      onFileUploaded('', '');

      toast({
        title: "Success",
        description: "File removed successfully.",
      });

    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: "Failed to remove file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Training Content Upload</Label>
      
      {currentFilePath && currentFileName ? (
        <UploadedFileDisplay 
          fileName={currentFileName}
          onRemove={handleRemoveFile}
        />
      ) : (
        <Tabs defaultValue="scorm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scorm">SCORM Package</TabsTrigger>
            <TabsTrigger value="index">Index File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scorm" className="space-y-4">
            <ScormPackageUpload
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileSelect={uploadFile}
            />
          </TabsContent>
          
          <TabsContent value="index" className="space-y-4">
            <IndexFileUpload
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileSelect={uploadFile}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {uploading && <FileUploadProgress progress={uploadProgress} />}
    </div>
  );
};