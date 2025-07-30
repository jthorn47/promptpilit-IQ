import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HaaLOFileUploaderProps {
  onFilesChange: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export const HaaLOFileUploader: React.FC<HaaLOFileUploaderProps> = ({
  onFilesChange,
  acceptedFileTypes = [],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = true,
  className,
  disabled = false
}) => {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, maxFiles);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
  }, [uploadedFiles, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.length > 0 
      ? acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    maxSize: maxFileSize,
    multiple,
    disabled
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p className="mb-1">Drag & drop files here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Max {maxFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
            </p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)}KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};