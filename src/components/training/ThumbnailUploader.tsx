import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Wand2, Loader2, X, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ThumbnailUploaderProps {
  currentThumbnail: string;
  sceneTitle: string;
  sceneDescription?: string;
  onThumbnailChange: (url: string) => void;
}

export const ThumbnailUploader = ({ 
  currentThumbnail, 
  sceneTitle, 
  sceneDescription,
  onThumbnailChange 
}: ThumbnailUploaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("ai"); // Default to AI tab
  const [thumbnailType, setThumbnailType] = useState("real-photos");
  const [generatedImages, setGeneratedImages] = useState<Array<{id: number, image: string, prompt: string}>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log('🔧 ThumbnailUploader rendered with:', { currentThumbnail, sceneTitle, sceneDescription, activeTab });
  const { uploading, uploadFile } = useFileUpload({
    onFileUploaded: (filePath) => {
      const fullUrl = `https://xfamotequcavggiqndfj.supabase.co/storage/v1/object/public/training-assets/${filePath}`;
      onThumbnailChange(fullUrl);
      toast({
        title: "Thumbnail uploaded successfully",
        description: "Your thumbnail image has been uploaded and is ready to use.",
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    await uploadFile(file);
  };

  const validateAndProcessFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      validateAndProcessFile(imageFile);
    } else if (files.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please drop an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await validateAndProcessFile(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAIGeneration = async () => {
    // Require both title and description
    if (!sceneTitle?.trim()) {
      toast({
        title: "Title Required",
        description: "You must have a title to generate an AI thumbnail. Please add a title first.",
        variant: "destructive"
      });
      return;
    }

    if (!sceneDescription?.trim() && !customPrompt?.trim()) {
      toast({
        title: "Description Required", 
        description: "You must have a description to generate an AI thumbnail. Please add a description first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]); // Clear previous results
    
    // Show appropriate generation message
    if (thumbnailType === "real-photos") {
      toast({
        title: "Finding 6 Real Images",
        description: "Using AI to analyze your prompt and find relevant stock photos...",
        duration: 3000,
      });
    } else {
      toast({
        title: "Generating 6 AI Thumbnails",
        description: "This will take 60-90 seconds as we're creating 6 custom thumbnails with DALL-E 3...",
        duration: 5000,
      });
    }

    try {
      console.log('🚀 Starting thumbnail generation...');
      console.log('📝 Sending data:', { title: sceneTitle, description: sceneDescription, prompt: customPrompt, type: thumbnailType });
      
      if (thumbnailType === "real-photos") {
        // Search for real photos from the web
        const { data, error } = await supabase.functions.invoke('search-real-photos', {
          body: {
            title: sceneTitle,
            description: sceneDescription,
            prompt: customPrompt || undefined
          }
        });
        
        if (error) {
          console.error('🚨 Photo search error:', error);
          throw new Error(error.message || 'Failed to search for photos');
        }
        
        if (data?.images && data.images.length > 0) {
          console.log(`✅ ${data.images.length} real photos found`);
          setGeneratedImages(data.images);
          toast({
            title: `Found ${data.images.length} Real Photo Options`,
            description: "Choose your favorite from the authentic photos below!",
          });
        } else {
          throw new Error('No photos found');
        }
      } else {
        // Use AI generation with extended timeout
        console.log('🎨 Starting AI thumbnail generation...');
        const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
          body: {
            title: sceneTitle,
            description: sceneDescription,
            prompt: customPrompt || undefined
          }
        });

      console.log('📡 Response:', { data, error });

      if (error) {
        console.error('🚨 Error details:', error);
        throw new Error(error.message || 'Failed to generate/find thumbnails');
      }

      console.log('📊 Data received:', data);
      if (data?.images && data.images.length > 0) {
        console.log(`✅ ${data.images.length} images processed successfully`);
        setGeneratedImages(data.images);
        toast({
          title: `Generated ${data.images.length} Thumbnail Options`,
          description: "Choose your favorite from the options below!",
        });
      } else {
        console.error('❌ No image data in response:', data);
        throw new Error('No image data received');
      }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail with AI",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearThumbnail = () => {
    onThumbnailChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Thumbnail Image</Label>
        {currentThumbnail && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearThumbnail}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {currentThumbnail && (
        <div className="mb-4">
          <img 
            src={currentThumbnail} 
            alt="Scene thumbnail preview"
            className="w-32 h-20 object-cover rounded border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => {
        console.log('📋 Tab changed to:', value);
        setActiveTab(value);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="ai">🎨 AI Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-3">
          <Input
            placeholder="https://example.com/thumbnail.jpg"
            value={currentThumbnail.startsWith('data:') ? '' : currentThumbnail}
            onChange={(e) => onThumbnailChange(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-3">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/5 border-solid' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <div className="mb-3">
              <p className={`text-sm transition-colors ${
                isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {isDragOver ? 'Drop your image here!' : 'Drag & drop an image or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: 5MB • Formats: JPG, PNG, GIF
              </p>
            </div>
            
            {uploading && (
              <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="thumbnail-type" className="text-sm">
                Thumbnail Type
              </Label>
              <Select value={thumbnailType} onValueChange={setThumbnailType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select thumbnail type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-photos">🌐 Real Photos (Web Search)</SelectItem>
                  <SelectItem value="ai-generated">🎨 AI Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-prompt" className="text-sm">
                Custom Prompt (optional)
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder={sceneTitle && sceneDescription 
                  ? `Leave empty to auto-generate based on title: "${sceneTitle}" and description: "${sceneDescription?.substring(0, 50)}..."`
                  : "Custom prompt required since title/description missing"
                }
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
            <Button 
              onClick={handleAIGeneration} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {thumbnailType === "real-photos" ? "Searching for 6 AI-powered images..." : "Generating AI thumbnails..."}
                </>
              ) : (
                <>
                  {thumbnailType === "real-photos" ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Find 6 Real Images
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate 6 AI Thumbnails
                    </>
                  )}
                </>
              )}
            </Button>
            
            {/* Generated Images Grid */}
            {generatedImages.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Choose Your Favorite Thumbnail:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {generatedImages.map((genImage) => (
                    <div 
                      key={genImage.id}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        currentThumbnail === genImage.image 
                          ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                          : 'border-transparent hover:border-primary'
                      }`}
                      onClick={() => {
                        onThumbnailChange(genImage.image);
                        toast({
                          title: "Thumbnail Selected",
                          description: `Option ${genImage.id} has been set as your thumbnail!`
                        });
                      }}
                    >
                      <img 
                        src={genImage.image} 
                        alt={`Generated thumbnail option ${genImage.id}`}
                        className="w-full h-20 object-cover"
                      />
                      <div className={`absolute bottom-0 left-0 right-0 text-white text-xs p-1 text-center ${
                        currentThumbnail === genImage.image 
                          ? 'bg-primary bg-opacity-90' 
                          : 'bg-black bg-opacity-50'
                      }`}>
                        {currentThumbnail === genImage.image ? '✓ Selected' : `Option ${genImage.id}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};