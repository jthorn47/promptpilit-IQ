import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScormPackageUploadProps {
  uploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
}

export const ScormPackageUpload = ({ 
  uploading, 
  uploadProgress, 
  onFileSelect 
}: ScormPackageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (SCORM packages are typically .zip files)
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-zip',
      'application/octet-stream'
    ];
    
    const isZipFile = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.zip');
    
    if (!isZipFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a ZIP file containing your SCORM package.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "SCORM package must be smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose SCORM Package
              </>
            )}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Upload a ZIP file containing your SCORM package (max 100MB)
        </p>
      </div>
    </div>
  );
};