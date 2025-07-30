import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileText, Sparkles, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const WPVPlan = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedContent, setUploadedContent] = useState("");
  const [generatedScenes, setGeneratedScenes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load previously saved WPV plan content
  useEffect(() => {
    const loadSavedContent = async () => {
      try {
        const { data: companySettings } = await supabase
          .from('company_settings')
          .select('wpv_plan_content')
          .single();

        if (companySettings?.wpv_plan_content) {
          setUploadedContent(companySettings.wpv_plan_content);
          toast({
            title: "Previous plan loaded",
            description: "Your previously uploaded WPV plan has been loaded for testing.",
          });
        }
      } catch (error) {
        console.error("Error loading saved content:", error);
      }
    };

    loadSavedContent();
  }, []);

  const saveContentToDatabase = async (content: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ wpv_plan_content: content })
        .eq('id', (await supabase.from('company_settings').select('id').single()).data?.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Warning",
        description: "Content uploaded but not saved to database for persistence.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Read file content based on type
      let content = "";
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For PDF and Word docs, we'll just store the file name for now
        // In a real implementation, you'd use a PDF/Word parser
        content = `Uploaded file: ${file.name}\nFile type: ${file.type}\nFile size: ${(file.size / 1024).toFixed(2)} KB`;
      }

      setUploadedFile(file);
      setUploadedContent(content);
      
      // Save content to database for testing
      await saveContentToDatabase(content);
      
      toast({
        title: "File uploaded and saved successfully",
        description: `${file.name} has been processed and saved for testing.`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateTrainingScenes = async () => {
    if (!uploadedContent) {
      toast({
        title: "No content",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wpv-scenes', {
        body: { content: uploadedContent }
      });

      if (error) throw error;

      setGeneratedScenes(data.scenes || []);
      toast({
        title: "Training scenes generated!",
        description: `Generated ${data.scenes?.length || 0} training scenes from your plan.`,
      });
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast({
        title: "Error",
        description: "Failed to generate training scenes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createTrainingScenes = async () => {
    if (generatedScenes.length === 0) return;

    try {
      // Find the Core WPV Training module
      const { data: module } = await supabase
        .from('training_modules')
        .select('id')
        .eq('title', 'Core WPV Training')
        .single();

      if (!module) {
        toast({
          title: "Error",
          description: "Core WPV Training module not found.",
          variant: "destructive",
        });
        return;
      }

      // Create training scenes
      const scenesToInsert = generatedScenes.map((scene, index) => ({
        training_module_id: module.id,
        title: scene.title,
        description: scene.description,
        scene_type: 'html' as const,
        html_content: scene.content,
        scene_order: index + 1,
        estimated_duration: scene.estimatedDuration || 300,
        is_required: true,
        status: 'active' as const
      }));

      const { error } = await supabase
        .from('training_scenes')
        .insert(scenesToInsert);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Created ${scenesToInsert.length} training scenes for Core WPV Training. Content remains saved for testing.`,
      });

      // Clear generated scenes but keep the uploaded content for testing
      setGeneratedScenes([]);
    } catch (error) {
      console.error("Error creating training scenes:", error);
      toast({
        title: "Error",
        description: "Failed to create training scenes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-card rounded-2xl p-8 shadow-soft border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin/training-modules'}
                className="hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Training Modules
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  WPV Plan AI Training Generator
                </h1>
                <p className="text-muted-foreground">
                  Upload your workplace violence prevention plan and generate AI-powered training scenes
                </p>
                {uploadedContent && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Plan content saved for testing
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/admin/wpv-training-preview')}
                      className="hover:bg-primary/5"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Complete Training
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="shadow-soft border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload WPV Plan Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                onClick={handleFileSelect}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing file...</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-primary" />
                    <h3 className="font-medium">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB • Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="font-medium">Upload your WPV plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, Word documents, and text files
                    </p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {uploadedContent && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Document Preview:</h4>
                  <div className="bg-muted/50 p-4 rounded-lg max-h-32 overflow-y-auto text-sm">
                    {uploadedContent.substring(0, 500)}
                    {uploadedContent.length > 500 && "..."}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Generation Section */}
        {(uploadedFile || uploadedContent) && (
          <Card className="shadow-soft border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Training Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Use AI to analyze your WPV plan and automatically generate customized training scenes
                  based on your client-specific data and requirements.
                </p>
                
                <Button 
                  onClick={generateTrainingScenes}
                  disabled={isGenerating}
                  className="bg-gradient-primary hover:opacity-90 shadow-medium transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Scenes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Training Scenes
                    </>
                  )}
                </Button>

                {generatedScenes.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">Generated Training Scenes ({generatedScenes.length})</h4>
                    <div className="space-y-3">
                      {generatedScenes.map((scene, index) => (
                        <div key={index} className="bg-muted/50 p-4 rounded-lg">
                          <h5 className="font-medium">{scene.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{scene.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Duration: ~{Math.floor((scene.estimatedDuration || 300) / 60)} minutes
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={createTrainingScenes}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create Training Scenes in Core WPV Training
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};