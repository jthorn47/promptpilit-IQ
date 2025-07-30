import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Clock, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScormPlayer } from "@/components/ui/scorm-player";
import { CustomVideoPlayer } from "@/components/ui/custom-video-player";

interface TrainingScene {
  id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  scene_order: number;
  estimated_duration: number;
  is_completion_scene: boolean;
  status: string;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  estimated_duration: number;
  credit_value: number;
}

export const WPVTrainingPreview = () => {
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [scenes, setScenes] = useState<TrainingScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWPVTrainingData();
  }, []);

  const fetchWPVTrainingData = async () => {
    try {
      setLoading(true);
      
      // Fetch Core WPV Training module
      const { data: moduleData, error: moduleError } = await supabase
        .from('training_modules')
        .select('id, title, description, estimated_duration, credit_value')
        .eq('title', 'Core WPV Training')
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Fetch all training scenes for this module
      const { data: scenesData, error: scenesError } = await supabase
        .from('training_scenes')
        .select(`
          id, title, description, scene_type, content_url, 
          scorm_package_url, html_content, scene_order, 
          estimated_duration, is_completion_scene, status
        `)
        .eq('training_module_id', moduleData.id)
        .eq('status', 'active')
        .order('scene_order');

      if (scenesError) throw scenesError;
      setScenes((scenesData || []) as TrainingScene[]);

    } catch (error) {
      console.error('Error fetching WPV training data:', error);
      toast({
        title: "Error",
        description: "Failed to load WPV training content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSceneContent = (scene: TrainingScene) => {
    // Handle SCORM content
    if (scene.scene_type === 'scorm' && scene.scorm_package_url) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-lg font-medium">SCORM Package</div>
            <p className="text-sm text-muted-foreground">Interactive training content</p>
            <Button 
              size="sm" 
              onClick={() => setActiveScene(activeScene === scene.id ? null : scene.id)}
              className="mt-2"
            >
              {activeScene === scene.id ? 'Hide Player' : 'Show Player'}
            </Button>
          </div>
        </div>
      );
    }

    // Handle video content
    if (scene.content_url) {
      if (scene.content_url.includes('vimeo.com') || scene.content_url.includes('player.vimeo.com')) {
        const embedMatch = scene.content_url.match(/player\.vimeo\.com\/video\/(\d+)/);
        const regularMatch = scene.content_url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        const videoId = embedMatch?.[1] || regularMatch?.[1];
        
        if (videoId) {
          return (
            <div className="aspect-video">
              <CustomVideoPlayer videoId={videoId} className="w-full" />
            </div>
          );
        }
      }
      
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video src={scene.content_url} className="w-full h-full object-cover" controls />
        </div>
      );
    }

    // Handle HTML content
    if (scene.html_content) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: scene.html_content }}
          />
        </div>
      );
    }

    // Default empty state
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">No Content</div>
          <p className="text-sm text-muted-foreground">Content not yet configured</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading WPV training preview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
        <div className="container mx-auto p-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Core WPV Training Not Found</h2>
            <p className="text-muted-foreground mb-6">Please create the Core WPV Training module first.</p>
            <Button onClick={() => navigate('/admin/training-modules')}>
              Go to Training Modules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalDuration = scenes.reduce((acc, scene) => acc + scene.estimated_duration, 0);
  const completionScene = scenes.find(scene => scene.is_completion_scene);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-card rounded-2xl p-8 shadow-soft border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/wpv-plan')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to WPV Plan
                </Button>
                <Button 
                  onClick={() => navigate('/admin/wpv-learner')}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learner Training
                </Button>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {module.title} - Complete Preview
                </h1>
                <p className="text-muted-foreground">{module.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(totalDuration / 60)} minutes
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {scenes.length} scenes
              </div>
              <Badge variant="outline">{module.credit_value} Credits</Badge>
            </div>
          </div>
        </div>

        {/* Introduction Screen */}
        <Card className="shadow-soft border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Introduction Screen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <h2 className="text-3xl font-bold">{module.title}</h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Welcome to your comprehensive workplace violence prevention training. 
                  This training has been customized based on your company's specific WPV plan and policies.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Estimated Duration: {Math.floor(totalDuration / 60)} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {module.credit_value} CE Credits
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Scenes */}
        {scenes.map((scene, index) => (
          <Card key={scene.id} className="shadow-soft border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Scene {scene.scene_order}</Badge>
                  <span>{scene.title}</span>
                  {scene.is_completion_scene && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completion
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {Math.floor(scene.estimated_duration / 60)} min
                </div>
              </CardTitle>
              {scene.description && (
                <p className="text-sm text-muted-foreground">{scene.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {renderSceneContent(scene)}
              
              {/* Show full SCORM player when active */}
              {activeScene === scene.id && scene.scene_type === 'scorm' && scene.scorm_package_url && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <ScormPlayer
                    scormPackageUrl={scene.scorm_package_url}
                    onComplete={(score, duration) => {
                      toast({
                        title: "Scene Complete",
                        description: `Completed "${scene.title}" with score: ${score || 'N/A'}`,
                      });
                    }}
                    onProgress={(progress) => {
                      console.log(`Scene ${scene.scene_order} progress:`, progress);
                    }}
                    employeeId="preview-user"
                    trainingModuleId={module.id}
                    moduleName={module.title}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {scenes.length === 0 && (
          <Card className="shadow-soft border border-border/50">
            <CardContent className="text-center py-16">
              <h3 className="text-lg font-medium mb-2">No Training Scenes Found</h3>
              <p className="text-muted-foreground mb-6">
                Generate training scenes from your WPV plan to see the complete training flow.
              </p>
              <Button onClick={() => navigate('/admin/wpv-plan')}>
                Go to WPV Plan Generator
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Final Completion Summary */}
        {scenes.length > 0 && (
          <Card className="shadow-soft border border-border/50 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Training Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-green-700">
                  Congratulations! You have completed all {scenes.length} scenes of the {module.title} training.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-green-600">
                  <div>Total Time: {Math.floor(totalDuration / 60)} minutes</div>
                  <div>Credits Earned: {module.credit_value}</div>
                  <div>Scenes Completed: {scenes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};