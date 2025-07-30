import { ScormPlayer } from "@/components/ui/scorm-player";
import { CustomVideoPlayer } from "@/components/ui/custom-video-player";
import VimeoEmbed from "@/components/ui/VimeoEmbed";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document' | 'embed';
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

interface ContentRendererProps {
  scene: TrainingScene | null;
  onTimeUpdate?: (currentTime: number) => void;
  moduleName?: string;
}

// Helper function to extract Vimeo ID
function extractVimeoId(url: string): string | null {
  // If it's HTML embed code, extract the iframe src
  if (url.includes('<iframe') && url.includes('vimeo.com')) {
    const iframeMatch = url.match(/src="([^"]*vimeo\.com[^"]*)"/);
    if (iframeMatch) {
      url = iframeMatch[1].replace(/&amp;/g, '&'); // Decode HTML entities
    }
  }

  const patterns = [
    /vimeo\.com\/(\d+)/,           // Regular Vimeo URL
    /player\.vimeo\.com\/video\/(\d+)/, // Embed URL
    /^(\d+)$/                     // Just the video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const ContentRenderer = ({ scene, onTimeUpdate, moduleName }: ContentRendererProps) => {
  const { toast } = useToast();
  const vimeoPlayerRef = useRef<any>(null);

  console.log('🔍 Debug scene data:', { 
    sceneType: scene?.scene_type, 
    scormUrl: scene?.scorm_package_url,
    contentUrl: scene?.content_url,
    description: scene?.description,
    title: scene?.title,
    fullScene: scene 
  });

  console.log('🔍 Preview check - Has content?', {
    hasScormUrl: !!scene?.scorm_package_url,
    hasContentUrl: !!scene?.content_url,
    canPreview: !!(scene?.content_url || scene?.scorm_package_url)
  });

  // Handle embed content (Vimeo)
  if (scene?.scene_type === 'embed') {
    console.log('🎬 Rendering embed content');
    
    // Use placeholder video ID for development or extract from content_url
    const videoId = scene?.content_url ? 
      extractVimeoId(scene.content_url) || "373273499" : 
      "373273499";
    
    return (
      <VimeoEmbed
        ref={vimeoPlayerRef}
        videoId={videoId}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => {
          console.log('▶️ Training video started');
          toast({
            title: "Video Started",
            description: "Training video is now playing",
          });
        }}
        onPause={() => {
          console.log('⏸️ Training video paused');
        }}
        onEnded={() => {
          console.log('🏁 Training video completed');
          toast({
            title: "Video Complete",
            description: "You have finished watching this training segment",
          });
        }}
        className="w-full"
        autoplay={false}
      />
    );
  }


  // Check for SCORM content
  if (scene?.scene_type === 'scorm' && scene?.scorm_package_url) {
    console.log('🎓 Rendering SCORM content:', scene.scorm_package_url);
    return (
      <ScormPlayer
        scormPackageUrl={scene.scorm_package_url}
        onComplete={(score, duration) => {
          console.log('🎉 SCORM completed:', { score, duration });
          toast({
            title: "Training Complete",
            description: `Completed with score: ${score || 'N/A'}`,
          });
        }}
        onProgress={(progress) => {
          console.log('📊 SCORM progress:', progress);
        }}
        employeeId="demo-employee"
        trainingModuleId={scene.training_module_id}
        moduleName={moduleName}
      />
    );
  }

  // Handle video content
  if (scene?.content_url) {
    if (scene.content_url.includes('vimeo.com') || scene.content_url.includes('player.vimeo.com')) {
      // Extract video ID from various Vimeo URL formats
      const videoId = extractVimeoId(scene.content_url);
      
      console.log('🎥 Displaying Vimeo video ID:', videoId);
      
      if (!videoId) {
        return (
          <div className="aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center border-muted-foreground/30 bg-muted/20">
            <div className="text-center space-y-4 p-8">
              <div className="text-lg font-medium">Invalid Vimeo URL</div>
              <p className="text-sm text-muted-foreground">Could not extract video ID from URL: {scene.content_url}</p>
            </div>
          </div>
        );
      }
      
      return (
        <VimeoEmbed
          ref={vimeoPlayerRef}
          videoId={videoId}
          onTimeUpdate={onTimeUpdate}
          onPlay={() => {
            console.log('▶️ Training video started');
          }}
          onPause={() => {
            console.log('⏸️ Training video paused');
          }}
          onEnded={() => {
            console.log('🏁 Training video completed');
          }}
          className="w-full"
        />
      );
    } else {
      return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
          <video
            src={scene.content_url}
            className="w-full h-full object-cover"
            onTimeUpdate={(e) => {
              const time = (e.target as HTMLVideoElement).currentTime;
              onTimeUpdate?.(time);
            }}
            controls
          />
        </div>
      );
    }
  }


  // Empty state
  return (
    <div className="aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center border-muted-foreground/30 bg-muted/20">
      <div className="text-center space-y-6 p-8">
        {/* Loading dots in 2x3 grid pattern matching brand colors */}
        <div className="grid grid-cols-2 gap-3 w-fit mx-auto">
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)' }}></div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)', animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)', animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)', animationDelay: '0.3s' }}></div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)', animationDelay: '0.4s' }}></div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(248 43% 58%)', animationDelay: '0.5s' }}></div>
        </div>
        <div className="text-lg font-medium">No content selected</div>
        <p className="text-sm text-muted-foreground">Use the options below to add SCORM content or embed a Vimeo video</p>
      </div>
    </div>
  );
};