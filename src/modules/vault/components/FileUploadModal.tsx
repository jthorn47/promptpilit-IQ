import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  uploadType: 'policy' | 'legal_notice' | 'document' | 'certificate';
  title: string;
  acceptedTypes?: string[];
  maxFiles?: number;
}

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  uploadType,
  title,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'],
  maxFiles = 5
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    jurisdiction: uploadType === 'legal_notice' ? '' : undefined,
    document_type: uploadType === 'legal_notice' ? '' : undefined
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: uploadType === 'document'
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async (): Promise<any> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Prepare FormData for the edge function
    const uploadFormData = new FormData();
    
    // Add all files
    files.forEach(uploadFile => {
      uploadFormData.append('files', uploadFile.file);
    });
    
    // Add folder path based on upload type
    const folderPath = `/${uploadType}s/`;
    uploadFormData.append('folderPath', folderPath);

    // Call the vault-upload edge function
    const { data, error } = await supabase.functions.invoke('vault-upload', {
      body: uploadFormData
    });

    if (error) {
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(data?.message || 'Upload failed');
    }

    return data;
  };

  const createMetadataRecord = async (uploadResult: any) => {
    if (!uploadResult.results || uploadResult.results.length === 0) {
      throw new Error('No upload results received');
    }

    // For each successful upload, create additional metadata records if needed
    for (const result of uploadResult.results) {
      if (!result.success) continue;

      const baseMetadata = {
        title: formData.title || result.filename,
        description: formData.description,
        created_by: user?.id,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      // Create additional records in specific tables based on upload type
      switch (uploadType) {
        case 'policy':
          await supabase.from('hroiq_policy_versions').insert({
            policy_id: result.fileId,
            title: formData.title,
            body: formData.description || '',
            version: 1,
            created_by: user?.id,
            change_summary: 'Initial upload'
          });
          break;
          
        case 'legal_notice':
          await supabase.from('legal_clauses').insert({
            title: formData.title,
            content: formData.description || '',
            clause_type: formData.document_type || 'Notice',
            jurisdiction: formData.jurisdiction || 'Unknown',
            is_active: true,
            created_by: user?.id
          });
          break;
          
        case 'certificate':
          // Certificates are stored in vault_files only
          break;
          
        case 'document':
          // Documents are stored in vault_files only
          break;
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title and select at least one file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Set all files to uploading status
      setFiles(prev => prev.map(file => ({ ...file, status: 'uploading' as const, progress: 50 })));

      // Upload files using the edge function
      const uploadResult = await uploadFiles();
      
      // Update progress
      setFiles(prev => prev.map(file => ({ ...file, progress: 80 })));

      // Create metadata records
      await createMetadataRecord(uploadResult);

      // Mark all as successful
      setFiles(prev => prev.map(file => ({ ...file, status: 'success' as const, progress: 100 })));

      const successCount = uploadResult.results.filter((r: any) => r.success).length;
      const errorCount = uploadResult.results.filter((r: any) => !r.success).length;

      toast({
        title: "Upload Complete",
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount === 0 ? "default" : "destructive"
      });

      if (successCount > 0) {
        onSuccess();
        handleClose();
      }

    } catch (error) {
      console.error('Upload process error:', error);
      setFiles(prev => prev.map(file => ({ 
        ...file, 
        status: 'error' as const, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })));
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during the upload process",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      jurisdiction: uploadType === 'legal_notice' ? '' : undefined,
      document_type: uploadType === 'legal_notice' ? '' : undefined
    });
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter document description"
                rows={3}
              />
            </div>

            {uploadType === 'legal_notice' && (
              <>
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mandated Poster">Mandated Poster</SelectItem>
                      <SelectItem value="State Notification">State Notification</SelectItem>
                      <SelectItem value="Employer Notification">Employer Notification</SelectItem>
                      <SelectItem value="Employee Rights Notice">Employee Rights Notice</SelectItem>
                      <SelectItem value="Legal Clause">Legal Clause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                    placeholder="e.g., Federal, California, New York"
                  />
                </div>
              </>
            )}

            {uploadType === 'document' && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., policy, hr, compliance"
              />
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX, TXT, and images up to 10MB
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Files</h4>
              {files.map((uploadFile, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-2" />
                    )}
                    {uploadFile.status === 'error' && (
                      <p className="text-sm text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
              {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};