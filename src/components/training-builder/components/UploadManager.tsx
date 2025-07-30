
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Link, Wand2, FileText } from "lucide-react";
import { useScormUpload } from "../hooks/useScormUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ColossyanGeneratorModal } from "./ColossyanGeneratorModal";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  is_completion_scene: boolean;
  auto_advance: boolean;
  completion_criteria: any;
  metadata: any;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

interface UploadManagerProps {
  scene: TrainingScene | null;
  uploading?: boolean;
  uploadProgress?: number;
  onSceneRefresh?: () => void;
  moduleName?: string;
}

export const UploadManager = ({
  scene,
  uploading,
  uploadProgress,
  onSceneRefresh,
  moduleName,
}: UploadManagerProps) => {
  const { uploadScormPackage } = useScormUpload({ onSceneRefresh });
  const { toast } = useToast();
  const [vimeoUrl, setVimeoUrl] = useState("");
  const [savingVimeo, setSavingVimeo] = useState(false);
  const [showColossyanModal, setShowColossyanModal] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);

  const isWpvModule = moduleName?.includes("WPV") || moduleName?.includes("Workplace Violence");

  // If no scene exists, we need to create one first
  const ensureSceneExists = async () => {
    if (!scene) {
      toast({
        title: "No Scene Available",
        description: "Please create a training scene first before uploading content.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleUploadSCORM = async () => {
    if (!(await ensureSceneExists())) return;
    
    console.log('🎓 SCORM Upload button clicked');
    const fileInput = document.getElementById('scorm-file-input') as HTMLInputElement;
    if (fileInput) {
      console.log('📁 File input found, triggering click');
      fileInput.click();
    } else {
      console.error('❌ SCORM file input not found');
    }
  };

  const handleUploadPDF = async () => {
    if (!(await ensureSceneExists())) return;
    
    console.log('📄 PDF Upload button clicked');
    const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
    if (fileInput) {
      console.log('📁 PDF file input found, triggering click');
      fileInput.click();
    } else {
      console.error('❌ PDF file input not found');
    }
  };

  const handleScormFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎓 SCORM File input changed', e.target.files);
    const file = e.target.files?.[0];
    if (!file || !scene) return;

    const success = await uploadScormPackage(file, scene.id);
    
    // Reset the file input regardless of success/failure
    e.target.value = '';
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📄 PDF File input changed', e.target.files);
    const file = e.target.files?.[0];
    if (!file || !scene) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "PDF file must be smaller than 50MB.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setUploadingPdf(true);
    setPdfUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPdfUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const fileName = `pdf_${Date.now()}_${file.name}`;
      const filePath = `training-files/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('training-files')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setPdfUploadProgress(95);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(filePath);
      
      console.log('✅ PDF file uploaded to:', publicUrl);

      // Update the scene with PDF content
      const { error: updateError } = await supabase
        .from('training_scenes')
        .update({
          scene_type: 'document',
          content_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', scene.id);

      if (updateError) throw updateError;

      setPdfUploadProgress(100);
      
      toast({
        title: "Success",
        description: "PDF uploaded and scene updated successfully",
      });
      
      // Refresh scene data
      if (onSceneRefresh) {
        onSceneRefresh();
      }
      
    } catch (error: any) {
      console.error('❌ PDF upload failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setUploadingPdf(false);
      setPdfUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleVimeoEmbed = async () => {
    if (!(await ensureSceneExists())) return;
    
    if (!vimeoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Vimeo URL",
        variant: "destructive",
      });
      return;
    }

    setSavingVimeo(true);
    try {
      // Extract video ID from various Vimeo URL formats
      let videoId = null;
      const patterns = [
        /vimeo\.com\/(\d+)/,
        /vimeo\.com\/video\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/
      ];

      for (const pattern of patterns) {
        const match = vimeoUrl.match(pattern);
        if (match) {
          videoId = match[1];
          break;
        }
      }

      if (!videoId) {
        throw new Error("Invalid Vimeo URL format");
      }

      // Create embed URL
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;

      // Update the scene with Vimeo content
      const { error } = await supabase
        .from('training_scenes')
        .update({
          content_url: embedUrl,
          scene_type: 'video'
        })
        .eq('id', scene.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vimeo video embedded successfully",
      });

      setVimeoUrl("");
      onSceneRefresh?.();
    } catch (error) {
      console.error('Error embedding Vimeo video:', error);
      toast({
        title: "Error",
        description: "Failed to embed Vimeo video",
        variant: "destructive",
      });
    } finally {
      setSavingVimeo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* No Scene Warning */}
      {!scene && (
        <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium text-primary">No Training Scene Available</h3>
            <p className="text-sm text-muted-foreground">
              You need to create a training scene first before you can upload content.
            </p>
            <Button 
              onClick={() => {
                // Trigger scene creation
                window.dispatchEvent(new CustomEvent('createFirstScene'));
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Create First Scene
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {(uploading || uploadingPdf) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{uploadingPdf ? 'Uploading PDF...' : 'Uploading content...'}</span>
            <span>{uploadingPdf ? pdfUploadProgress : uploadProgress}%</span>
          </div>
          <Progress value={uploadingPdf ? pdfUploadProgress : uploadProgress} className="h-2" />
        </div>
      )}

      {/* Content Upload Options - Only show if scene exists */}
      {scene && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Colossyan AI Generator - Only for non-WPV modules */}
        {!isWpvModule && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Create SCORM videos with Colossyan AI
              </p>
              <Button 
                onClick={() => setShowColossyanModal(true)}
                className="w-full"
                disabled={!scene}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
              {!scene && (
                <p className="text-xs text-muted-foreground mt-2">
                  Scene required for generation
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* PDF Upload - Show for WPV modules or as general option */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {isWpvModule ? "WPV Plan PDF" : "PDF Document"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {isWpvModule ? "Upload your WPV plan PDF" : "Upload PDF documents"}
            </p>
            <Button 
              onClick={handleUploadPDF}
              className="w-full"
              disabled={!scene || uploadingPdf}
            >
              <FileText className="w-4 h-4 mr-2" />
              {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
            </Button>
            {!scene && (
              <p className="text-xs text-muted-foreground mt-2">
                Scene required for upload
              </p>
            )}
          </CardContent>
        </Card>

        {/* SCORM Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="w-4 h-4" />
              SCORM Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={handleUploadSCORM}
              className="w-full"
              disabled={!scene}
            >
              Upload SCORM Package
            </Button>
            {!scene && (
              <p className="text-xs text-muted-foreground mt-2">
                Scene required for upload
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vimeo Embed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vimeo Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="vimeo-url">Vimeo URL</Label>
              <Input
                id="vimeo-url"
                value={vimeoUrl}
                onChange={(e) => setVimeoUrl(e.target.value)}
                placeholder="https://vimeo.com/123456789"
                disabled={savingVimeo}
              />
            </div>
            <Button 
              onClick={handleVimeoEmbed}
              disabled={!vimeoUrl.trim() || savingVimeo || !scene}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              {savingVimeo ? 'Embedding...' : 'Embed Video'}
            </Button>
            {!scene && (
              <p className="text-xs text-muted-foreground mt-2">
                Scene required for upload
              </p>
            )}
          </CardContent>
        </Card>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        id="scorm-file-input"
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleScormFileChange}
      />

      <input
        id="pdf-file-input"
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePdfFileChange}
      />

      {/* Colossyan Generator Modal - Only for non-WPV modules */}
      {!isWpvModule && (
        <ColossyanGeneratorModal
          open={showColossyanModal}
          onOpenChange={setShowColossyanModal}
          onVideoGenerated={(videoData) => {
            // Handle successful video generation
            onSceneRefresh?.();
            toast({
              title: "Success",
              description: "AI video generated and added to your training scene!",
            });
          }}
          trainingModuleId={scene?.training_module_id}
          trainingSceneId={scene?.id}
        />
      )}
    </div>
  );
};
