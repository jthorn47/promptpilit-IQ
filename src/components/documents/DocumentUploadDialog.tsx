import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useCaseDocuments } from '@/hooks/useCaseDocuments';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCaseId?: string;
}

const documentTypes = [
  'Witness Statement',
  'Incident Report', 
  'Evidence',
  'Request Form',
  'Policy Document',
  'Email Evidence',
  'Photo Evidence',
  'Video Evidence',
  'Audio Recording',
  'Legal Document',
  'Other'
];

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  defaultCaseId = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState(defaultCaseId);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { uploadDocument } = useCaseDocuments();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !caseId || !documentType) {
      return;
    }

    setUploading(true);
    try {
      const result = await uploadDocument(file, caseId, documentType, isConfidential, description);
      if (result) {
        // Reset form
        setFile(null);
        setCaseId('');
        setDocumentType('');
        setDescription('');
        setIsConfidential(false);
        onOpenChange(false);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to be associated with a case. All documents are securely stored.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                      Click to upload
                    </Label>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Case ID */}
          <div className="space-y-2">
            <Label htmlFor="case-id">Case ID</Label>
            <Input
              id="case-id"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="e.g., CASE-001"
              required
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document..."
              rows={3}
            />
          </div>

          {/* Confidential Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confidential"
              checked={isConfidential}
              onCheckedChange={(checked) => setIsConfidential(checked as boolean)}
            />
            <Label htmlFor="confidential" className="text-sm">
              Mark as confidential
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !caseId || !documentType || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};