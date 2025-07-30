import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video, Wand2, Globe, Palette, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ColossyanGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoGenerated?: (videoData: any) => void;
  trainingModuleId?: string;
  trainingSceneId?: string;
}

interface GenerationStatus {
  id: string;
  status: string;
  colossyan_id?: string;
  video_url?: string;
  scorm_package_url?: string;
  error_message?: string;
}

const TRAINING_TEMPLATES = [
  { id: 'safety', name: 'Safety Training', description: 'Workplace safety and hazard awareness' },
  { id: 'compliance', name: 'Compliance Training', description: 'Regulatory and policy compliance' },
  { id: 'hr', name: 'HR Training', description: 'Human resources and workplace conduct' },
  { id: 'onboarding', name: 'Employee Onboarding', description: 'New employee orientation' },
  { id: 'leadership', name: 'Leadership Development', description: 'Management and leadership skills' },
  { id: 'technical', name: 'Technical Training', description: 'Job-specific technical skills' }
];

const SAMPLE_AVATARS = [
  { id: 'alex', name: 'Alex', gender: 'male', description: 'Professional presenter' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Friendly instructor' },
  { id: 'david', name: 'David', gender: 'male', description: 'Executive trainer' },
  { id: 'maria', name: 'Maria', gender: 'female', description: 'Diverse educator' }
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }
];

export const ColossyanGeneratorModal = ({
  open,
  onOpenChange,
  onVideoGenerated,
  trainingModuleId,
  trainingSceneId
}: ColossyanGeneratorModalProps) => {
  const [script, setScript] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [progress, setProgress] = useState(0);

  const maxChars = 2000;
  const remainingChars = maxChars - script.length;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (generationStatus?.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('colossyan_generations')
            .select('*')
            .eq('id', generationStatus.id)
            .single();

          if (error) throw error;
          
          if (data) {
            setGenerationStatus(data);
            
            if (data.status === 'completed') {
              setProgress(100);
              toast.success("Video generated successfully!");
              onVideoGenerated?.(data);
              onOpenChange(false);
            } else if (data.status === 'failed') {
              setIsGenerating(false);
              toast.error(data.error_message || "Video generation failed");
            } else {
              // Update progress for processing
              setProgress(prev => Math.min(prev + 5, 90));
            }
          }
        } catch (error) {
          console.error('Error checking generation status:', error);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationStatus?.id, generationStatus?.status, onVideoGenerated, onOpenChange]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      toast.error("Please enter a script for your video");
      return;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      const { data, error } = await supabase.functions.invoke('colossyan-generate', {
        body: {
          script: script.trim(),
          avatar: selectedAvatar,
          template: selectedTemplate,
          language: selectedLanguage,
          trainingModuleId,
          trainingSceneId,
          brandSettings: {
            // You can add brand settings here
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGenerationStatus({
          id: data.generation_id,
          status: 'processing',
          colossyan_id: data.colossyan_id
        });
        setProgress(30);
        toast.success("Video generation started! This may take a few minutes...");
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      setProgress(0);
      
      if (error.message?.includes('integration not configured')) {
        toast.error("Colossyan integration not configured. Please contact your administrator.");
      } else {
        toast.error(error.message || "Failed to generate video");
      }
    }
  };

  const handleReset = () => {
    setScript("");
    setSelectedAvatar("");
    setSelectedTemplate("");
    setSelectedLanguage("en");
    setIsGenerating(false);
    setGenerationStatus(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Training Video with Colossyan AI
          </DialogTitle>
        </DialogHeader>

        {isGenerating || generationStatus?.status === 'processing' ? (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generating Your Training Video</h3>
              <p className="text-muted-foreground mb-4">
                {generationStatus?.status === 'processing' 
                  ? "AI is creating your video with the selected avatar and script..."
                  : "Preparing your generation request..."}
              </p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
            </div>
            
            {generationStatus?.colossyan_id && (
              <div className="text-center">
                <Badge variant="outline">Generation ID: {generationStatus.colossyan_id}</Badge>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Script
                  </CardTitle>
                  <CardDescription>
                    Write the script for your training video. The AI will generate a professional video with your chosen avatar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="script">Training Script</Label>
                      <Textarea
                        id="script"
                        placeholder="Enter your training script here. For example: 'Welcome to our workplace safety training. Today we'll cover the essential safety protocols that every employee must follow...'"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={8}
                        className="resize-none"
                        maxLength={maxChars}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">
                          Tip: Be clear and conversational. The AI works best with natural speaking patterns.
                        </span>
                        <span className={`text-sm ${remainingChars < 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {remainingChars} characters remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avatar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Choose Avatar
                  </CardTitle>
                  <CardDescription>
                    Select the AI presenter for your training video
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SAMPLE_AVATARS.map((avatar) => (
                      <Card 
                        key={avatar.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedAvatar === avatar.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedAvatar(avatar.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                          </div>
                          <h4 className="font-medium">{avatar.name}</h4>
                          <p className="text-xs text-muted-foreground">{avatar.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Training Template</CardTitle>
                  <CardDescription>
                    Choose a template that matches your training content type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TRAINING_TEMPLATES.map((template) => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Branding
                  </CardTitle>
                  <CardDescription>
                    Configure language and brand settings for your video
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Video Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Brand Settings</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your company's brand kit will be automatically applied to maintain consistent branding across all generated videos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!script.trim() || isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};