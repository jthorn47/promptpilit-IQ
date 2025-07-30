import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Video, ExternalLink, Check } from "lucide-react";

interface VimeoVideoManagerProps {
  currentVideoId: string;
  currentEmbedUrl: string;
  onVideoUpdate: (videoData: any) => void;
}

export const VimeoVideoManager = ({ 
  currentVideoId, 
  currentEmbedUrl, 
  onVideoUpdate 
}: VimeoVideoManagerProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const extractVimeoId = (url: string): string | null => {
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
  };

  const validateAndSetVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Vimeo URL",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 Processing video URL:', videoUrl);
    setIsValidating(true);

    try {
      const videoId = extractVimeoId(videoUrl);
      console.log('🎯 Extracted video ID:', videoId);
      
      if (!videoId) {
        throw new Error("Invalid Vimeo URL format");
      }

      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      console.log('🔗 Generated embed URL:', embedUrl);
      
      // Update the parent component with video data
      onVideoUpdate({
        videoId,
        embedUrl,
        originalUrl: videoUrl
      });

      toast({
        title: "Success",
        description: "Vimeo video updated successfully",
      });

      setVideoUrl("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to validate Vimeo URL",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearVideo = () => {
    onVideoUpdate(null);
    setVideoUrl("");
    toast({
      title: "Video Cleared",
      description: "Vimeo video has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Vimeo Video Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Video Display */}
        {currentVideoId && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Video</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`https://vimeo.com/${currentVideoId}`, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Video ID: <code className="bg-background px-1 rounded">{currentVideoId}</code>
            </div>
            {currentEmbedUrl && (
              <div className="mt-2">
                <iframe
                  src={currentEmbedUrl}
                  className="w-full h-32 rounded"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title="Current Vimeo Video"
                />
              </div>
            )}
          </div>
        )}

        {/* Add/Update Video */}
        <div className="space-y-3">
          <Label htmlFor="vimeoUrl">Vimeo Video URL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="vimeoUrl"
                placeholder="https://vimeo.com/123456789"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={validateAndSetVideo} 
              disabled={isValidating || !videoUrl.trim()}
            >
              {isValidating ? (
                <>Validating...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {currentVideoId ? 'Update' : 'Set Video'}
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Paste any Vimeo URL or video ID (e.g., https://vimeo.com/123456789, https://player.vimeo.com/video/123456789, or just 123456789)
          </p>
        </div>

        {/* Clear Video */}
        {currentVideoId && (
          <Button
            variant="outline"
            onClick={clearVideo}
            className="w-full"
          >
            Remove Video
          </Button>
        )}
      </CardContent>
    </Card>
  );
};