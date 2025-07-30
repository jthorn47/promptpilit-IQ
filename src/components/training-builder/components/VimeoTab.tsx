import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Video, Clock, ExternalLink } from 'lucide-react';
import { useVimeoIntegration } from '../hooks/useVimeoIntegration';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface VimeoTabProps {
  onVideoSelected?: (videoUrl: string, videoName: string) => void;
}

export const VimeoTab = ({ onVideoSelected }: VimeoTabProps) => {
  const { vimeoVideos, searching, searchVimeoVideos, clearResults } = useVimeoIntegration();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchVimeoVideos(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVideoSelect = (video: any) => {
    if (onVideoSelected) {
      onVideoSelected(video.embedUrl, video.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search your Vimeo videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searching}
          />
          <Button 
            onClick={handleSearch} 
            disabled={searching || !searchQuery.trim()}
            className="shrink-0"
          >
            {searching ? (
              <LoadingSpinner className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {vimeoVideos.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearResults}
            className="text-xs"
          >
            Clear Results
          </Button>
        )}
      </div>

      {/* Results Section */}
      {vimeoVideos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Found {vimeoVideos.length} videos
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vimeoVideos.map((video) => (
              <Card key={video.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 bg-muted rounded overflow-hidden shrink-0">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate" title={video.name}>
                        {video.name}
                      </h4>
                      {video.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {video.duration && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {video.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleVideoSelect(video)}
                      className="flex-1"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Add to Training
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(video.embedUrl, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && vimeoVideos.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No videos found</p>
          <p className="text-xs">Try a different search term</p>
        </div>
      )}

      {/* Instructions */}
      {!searchQuery && vimeoVideos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Search your Vimeo library</p>
          <p className="text-xs">Find and add videos to your training</p>
        </div>
      )}
    </div>
  );
};