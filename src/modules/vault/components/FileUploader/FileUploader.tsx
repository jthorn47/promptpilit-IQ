import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { microservicesClient } from '@/services/api/microservices';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    fileId: string;
    url: string;
    uploadedAt: string;
  };
}

export interface FileUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  maxFileSize?: number;
  acceptedTypes?: string[];
  folderPath?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'image/png',
  'image/jpeg',
  'text/csv',
  'application/zip'
];

const FILE_EXTENSIONS = '.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.csv,.zip';

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ALLOWED_TYPES,
  folderPath = '/',
  disabled = false
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${file.type}" is not allowed`;
    }
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }
    return null;
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadFile[] = [];
    
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      const uploadFile: UploadFile = {
        id: crypto.randomUUID(),
        file,
        status: error ? 'error' : 'pending',
        progress: 0,
        error
      };
      newFiles.push(uploadFile);
    });

    setUploadFiles(prev => [...prev, ...newFiles]);

    if (newFiles.some(f => f.status === 'error')) {
      toast({
        title: "File Validation Error",
        description: "Some files were rejected. Check file types and sizes.",
        variant: "destructive",
      });
    }
  }, [acceptedTypes, maxFileSize, toast]);

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFilesToServer = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        pendingFiles.some(pf => pf.id === f.id) 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.status === 'uploading' && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 200);

      // Upload files one by one using microservice
      const results = [];
      for (const uploadFile of pendingFiles) {
        try {
          const formData = new FormData();
          formData.append('file', uploadFile.file);
          formData.append('folderPath', folderPath);

          const result = await microservicesClient.uploadVaultFile(formData);
          
          results.push({
            filename: uploadFile.file.name,
            success: true,
            fileId: result.data.id,
            url: result.data.file_path,
            uploadedAt: result.data.created_at
          });
        } catch (error) {
          results.push({
            filename: uploadFile.file.name,
            success: false,
            error: error.message
          });
        }
      }

      clearInterval(progressInterval);

      // Update files with results
      setUploadFiles(prev => prev.map(uploadFile => {
        const fileResult = results.find(r => r.filename === uploadFile.file.name);
        
        if (fileResult) {
          return {
            ...uploadFile,
            status: fileResult.success ? 'success' as const : 'error' as const,
            progress: 100,
            error: fileResult.error,
            result: fileResult.success ? {
              fileId: fileResult.fileId,
              url: fileResult.url,
              uploadedAt: fileResult.uploadedAt
            } : undefined
          };
        }
        
        return uploadFile;
      }));

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Upload Failed",
          description: `${errorCount} file(s) failed to upload`,
          variant: "destructive",
        });
      }

      onUploadComplete?.(uploadFiles);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark all uploading files as error
      setUploadFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: error.message }
          : f
      ));

      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length;
  const successCount = uploadFiles.filter(f => f.status === 'success').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Files'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted types: PDF, DOCX, XLSX, PPTX, PNG, JPG, CSV, ZIP
              <br />
              Max file size: {formatFileSize(maxFileSize)}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={FILE_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Files ({uploadFiles.length})
              </h4>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCompleted}
                  >
                    Clear Completed
                  </Button>
                )}
                {pendingCount > 0 && (
                  <Button 
                    onClick={uploadFilesToServer} 
                    disabled={isUploading || disabled}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      `Upload ${pendingCount} file${pendingCount > 1 ? 's' : ''}`
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {uploadFile.status === 'error' && (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      </div>
                    )}
                    {uploadFile.status === 'pending' && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <File className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(uploadFile.file.size)}
                      </Badge>
                    </div>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1" />
                    )}
                    
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                    
                    {uploadFile.status === 'success' && uploadFile.result && (
                      <p className="text-xs text-green-600 mt-1">
                        Uploaded successfully
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={uploadFile.status === 'uploading'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};