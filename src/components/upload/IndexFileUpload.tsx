import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndexFileUploadProps {
  uploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
}

export const IndexFileUpload = ({ 
  uploading, 
  uploadProgress, 
  onFileSelect 
}: IndexFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate index file types
    const allowedExtensions = ['.html', '.htm', '.index', '.xml'];
    const fileName = file.name.toLowerCase();
    const isValidIndexFile = allowedExtensions.some(ext => fileName.endsWith(ext)) || 
                            fileName.includes('index') || 
                            fileName.includes('manifest');
    
    if (!isValidIndexFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an index file (.html, .htm, .xml, or files containing 'index' or 'manifest').",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB for index files)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Index file must be smaller than 10MB.",
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
                Choose Index File
              </>
            )}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.xml,.index"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Upload an index file (.html, .htm, .xml, or manifest files) (max 10MB)
        </p>
      </div>
    </div>
  );
};