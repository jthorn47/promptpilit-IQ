import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FileUploadFieldProps {
  label: string;
  documentType: string;
  serviceType: string;
  onFileUpload: (documentType: string, serviceType: string, file: File) => Promise<string | null>;
  acceptedTypes?: string;
  disabled?: boolean;
  required?: boolean;
}

export const FileUploadField = ({
  label,
  documentType,
  serviceType,
  onFileUpload,
  acceptedTypes = ".pdf,.doc,.docx,.csv,.xlsx,.xls",
  disabled = false,
  required = false
}: FileUploadFieldProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const isLogoUpload = documentType === 'company_logo';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    // Create image preview for logo uploads
    if (isLogoUpload && isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      const filePath = await onFileUpload(documentType, serviceType, file);
      if (filePath) {
        setUploadedFiles(prev => [...prev, file]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const confirmDelete = () => {
    setUploadedFiles([]);
    setImagePreview(null);
    setShowDeleteDialog(false);
    toast({
      title: "Logo removed",
      description: "Company logo has been removed successfully."
    });
  };

  const handleLogoClick = () => {
    if (isLogoUpload && imagePreview) {
      setShowDeleteDialog(true);
    }
  };

  return (
    <div className="space-y-2">
      {/* Show upload interface only if no logo preview (for logos) or always (for other files) */}
      {(!isLogoUpload || !imagePreview) && (
        <>
          <Label>{label}{required && " *"}</Label>
          
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isUploading}
                  onClick={() => document.getElementById(`file-${documentType}-${serviceType}`)?.click()}
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted: {acceptedTypes.replace(/\./g, '').toUpperCase()}
                </p>
              </div>
              
              <input
                id={`file-${documentType}-${serviceType}`}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
              />
            </div>
          </div>
        </>
      )}

      {/* Clean logo display - centered, no label */}
      {isLogoUpload && imagePreview && (
        <div className="flex justify-center">
          <div 
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleLogoClick}
            title="Click to delete logo"
          >
            <img 
              src={imagePreview} 
              alt="Company Logo" 
              className="w-32 h-32 object-contain border rounded-lg bg-background"
            />
          </div>
        </div>
      )}

      {/* Display uploaded files for non-logo uploads */}
      {uploadedFiles.length > 0 && !isLogoUpload && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company Logo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the company logo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};