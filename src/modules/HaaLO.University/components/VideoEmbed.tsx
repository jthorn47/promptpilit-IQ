import React from 'react';
import { Card } from '@/components/ui/card';

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  // Extract video ID and determine platform
  const getVideoDetails = (url: string) => {
    // YouTube URL patterns
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return {
        platform: 'youtube',
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    }
    
    // Vimeo URL patterns
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return {
        platform: 'vimeo',
        id: videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}`
      };
    }
    
    // Direct video file
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        platform: 'direct',
        id: null,
        embedUrl: url
      };
    }
    
    return null;
  };

  const videoDetails = getVideoDetails(url);

  if (!videoDetails) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        Invalid video URL format
      </Card>
    );
  }

  if (videoDetails.platform === 'direct') {
    return (
      <Card className="p-2">
        <video 
          controls 
          className="w-full h-auto rounded"
          title={title}
        >
          <source src={videoDetails.embedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={videoDetails.embedUrl}
          title={title || 'Training Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded"
        />
      </div>
    </Card>
  );
}