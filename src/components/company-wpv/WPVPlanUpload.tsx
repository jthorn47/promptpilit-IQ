import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";

interface WPVPlanUploadProps {
  companyId: string;
  onUploadComplete?: (planId: string) => void;
  onClose?: () => void;
}

export const WPVPlanUpload = ({ companyId, onUploadComplete, onClose }: WPVPlanUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [planName, setPlanName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      if (!planName) {
        setPlanName(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      }
    }
  }, [planName]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile || !planName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a plan name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wpv-plans')
        .upload(filePath, selectedFile);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(95);

      // Save plan record to database
      const { data: planData, error: dbError } = await supabase
        .from('wpv_plans')
        .insert({
          company_id: companyId,
          plan_name: planName.trim(),
          file_path: uploadData.path,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          uploaded_by: user.id,
          status: 'uploaded'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      setUploadComplete(true);

      toast({
        title: "Upload Successful",
        description: "Your WPV plan has been uploaded successfully.",
      });

      setTimeout(() => {
        onUploadComplete?.(planData.id);
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload WPV plan.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPlanName("");
    setUploadProgress(0);
    setUploadComplete(false);
  };

  if (uploadComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Upload Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Your WPV plan "{planName}" has been uploaded successfully.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={resetUpload} variant="outline">
              Upload Another Plan
            </Button>
            {onClose && (
              <Button onClick={onClose}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload WPV Plan
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Name Input */}
        <div className="space-y-2">
          <Label htmlFor="planName">Plan Name</Label>
          <Input
            id="planName"
            type="text"
            placeholder="Enter a name for your WPV plan"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            disabled={isUploading}
          />
        </div>

        {/* File Upload Zone */}
        <div className="space-y-2">
          <Label>Upload Document</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-green-500" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    Remove File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {isDragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, DOCX, or TXT files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Rejection Errors */}
          {fileRejections.length > 0 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                {fileRejections[0].errors[0].message}
              </span>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !planName.trim() || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Plan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};