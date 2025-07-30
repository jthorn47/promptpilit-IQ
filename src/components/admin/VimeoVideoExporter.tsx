import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Search, 
  Video, 
  Calendar, 
  ExternalLink, 
  Loader2,
  Filter,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  Copy
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface VimeoVideo {
  uri: string;
  name: string;
  link: string;
  created_time: string;
  tags?: { name: string }[];
  duration?: number;
  width?: number;
  height?: number;
  status?: string;
  pictures?: {
    sizes?: { link: string; width: number; height: number }[];
  };
}

interface VimeoResponse {
  data: VimeoVideo[];
  paging: {
    next?: string;
    total: number;
  };
}

export const VimeoVideoExporter = () => {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [totalVideos, setTotalVideos] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const extractVideoId = (uri: string): string => {
    return uri.replace('/videos/', '');
  };

  const generateEmbedCode = (video: VimeoVideo): string => {
    const videoId = extractVideoId(video.uri);
    return `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  };

  const fetchVideos = async (page = 1, isLoadMore = false) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vimeo-api', {
        body: {
          endpoint: 'videos',
          params: {
            page,
            per_page: 50,
            fields: 'uri,name,link,created_time,tags,duration,width,height,status,pictures.sizes',
            ...(tagFilter && { tag: tagFilter })
          }
        }
      });

      if (error) throw error;

      const response: VimeoResponse = data;
      
      if (isLoadMore) {
        setVideos(prev => [...prev, ...response.data]);
      } else {
        setVideos(response.data);
        setCurrentPage(1);
      }
      
      setTotalVideos(response.paging.total);
      setHasNextPage(!!response.paging.next);
      
      toast({
        title: "Videos Retrieved",
        description: `Found ${response.paging.total} total videos`,
      });

    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch videos from Vimeo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVideos = () => {
    if (hasNextPage && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVideos(nextPage, true);
    }
  };

  const exportToCSV = () => {
    if (videos.length === 0) {
      toast({
        title: "No Data",
        description: "No videos to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Video ID', 'Title', 'Direct Link', 'Created Date', 'Duration (seconds)', 'Resolution', 'Tags', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredVideos.map(video => [
        extractVideoId(video.uri),
        `"${video.name.replace(/"/g, '""')}"`,
        video.link,
        format(new Date(video.created_time), 'yyyy-MM-dd HH:mm:ss'),
        video.duration || 0,
        video.width && video.height ? `${video.width}x${video.height}` : 'Unknown',
        `"${video.tags?.map(tag => tag.name).join(', ') || ''}"`,
        video.status || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vimeo-videos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Export Complete",
      description: `Exported ${filteredVideos.length} videos to CSV`,
    });
  };

  const exportToJSON = () => {
    if (videos.length === 0) {
      toast({
        title: "No Data",
        description: "No videos to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = filteredVideos.map(video => ({
      videoId: extractVideoId(video.uri),
      title: video.name,
      directLink: video.link,
      createdDate: video.created_time,
      duration: video.duration,
      resolution: video.width && video.height ? `${video.width}x${video.height}` : null,
      tags: video.tags?.map(tag => tag.name) || [],
      status: video.status
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vimeo-videos-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();

    toast({
      title: "Export Complete",
      description: `Exported ${filteredVideos.length} videos to JSON`,
    });
  };

  const findDuplicateVideos = () => {
    const titleMap = new Map<string, VimeoVideo[]>();
    
    filteredVideos.forEach(video => {
      const title = video.name.toLowerCase().trim();
      if (!titleMap.has(title)) {
        titleMap.set(title, []);
      }
      titleMap.get(title)!.push(video);
    });
    
    const duplicates: VimeoVideo[] = [];
    titleMap.forEach((videos, title) => {
      if (videos.length > 1) {
        // Keep the most recent one, mark others for deletion
        const sorted = videos.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
        duplicates.push(...sorted.slice(1)); // All except the first (most recent)
      }
    });
    
    return duplicates;
  };

  const deleteDuplicateVideos = async () => {
    const duplicates = findDuplicateVideos();
    
    if (duplicates.length === 0) {
      toast({
        title: "No Duplicates Found",
        description: "No duplicate videos found to delete",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${duplicates.length} duplicate videos? This will keep only the most recent version of each title.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const videoIds = duplicates.map(video => extractVideoId(video.uri));
      
      const { data, error } = await supabase.functions.invoke('vimeo-api', {
        body: {
          action: 'bulkDelete',
          videoIds
        }
      });

      if (error) throw error;

      const results = data.results;
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.length - successCount;

      // Remove deleted videos from local state
      const deletedIds = new Set(results.filter((r: any) => r.success).map((r: any) => r.videoId));
      setVideos(prev => prev.filter(video => !deletedIds.has(extractVideoId(video.uri))));
      
      toast({
        title: "Duplicate Deletion Complete",
        description: `Successfully deleted ${successCount} duplicate videos${failCount > 0 ? `, ${failCount} failed` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Error deleting duplicates:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete duplicate videos",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteVideosByTitle = async (titleToDelete: string) => {
    const videosToDelete = filteredVideos.filter(video => 
      video.name.toLowerCase().includes(titleToDelete.toLowerCase())
    );
    
    if (videosToDelete.length === 0) {
      toast({
        title: "No Videos Found",
        description: `No videos found with title containing "${titleToDelete}"`,
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${videosToDelete.length} videos with title containing "${titleToDelete}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const videoIds = videosToDelete.map(video => extractVideoId(video.uri));
      
      const { data, error } = await supabase.functions.invoke('vimeo-api', {
        body: {
          action: 'bulkDelete',
          videoIds
        }
      });

      if (error) throw error;

      const results = data.results;
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.length - successCount;

      // Remove deleted videos from local state
      const deletedIds = new Set(results.filter((r: any) => r.success).map((r: any) => r.videoId));
      setVideos(prev => prev.filter(video => !deletedIds.has(extractVideoId(video.uri))));
      
      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} videos${failCount > 0 ? `, ${failCount} failed` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Error deleting videos:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete videos",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getThumbnailUrl = (video: VimeoVideo): string => {
    if (video.pictures?.sizes && video.pictures.sizes.length > 0) {
      // Get medium-sized thumbnail (usually around 200px width)
      const mediumThumb = video.pictures.sizes.find(size => size.width >= 200 && size.width <= 400);
      return mediumThumb?.link || video.pictures.sizes[0]?.link || '';
    }
    return '';
  };

  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = !searchTerm || video.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    fetchVideos();
  }, [tagFilter]);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vimeo Video Manager
          </CardTitle>
          <p className="text-muted-foreground">
            Retrieve, browse, and export all videos from your Vimeo account
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Videos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="tagFilter">Filter by Tag</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="tagFilter"
                  placeholder="Enter tag name (e.g., EaseBASE)"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => fetchVideos()} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Export and Delete Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={exportToCSV} disabled={filteredVideos.length === 0} variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToJSON} disabled={filteredVideos.length === 0} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button 
              onClick={() => deleteVideosByTitle("test")} 
              disabled={isDeleting || filteredVideos.filter(v => v.name.toLowerCase().includes('test')).length === 0}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete "Test" Videos ({filteredVideos.filter(v => v.name.toLowerCase().includes('test')).length})
                </>
              )}
            </Button>
            <Button 
              onClick={deleteDuplicateVideos} 
              disabled={isDeleting || findDuplicateVideos().length === 0}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Duplicates ({findDuplicateVideos().length})
                </>
              )}
            </Button>
          </div>

          {/* Stats */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalVideos}</div>
                <div className="text-sm text-muted-foreground">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{videos.length}</div>
                <div className="text-sm text-muted-foreground">Loaded Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredVideos.length}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
            </div>
          )}

          {/* Videos Table */}
          {loading && videos.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading videos from Vimeo...</p>
              </div>
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Thumbnail</TableHead>
                       <TableHead>Video ID</TableHead>
                       <TableHead>Title</TableHead>
                       <TableHead>Created</TableHead>
                       <TableHead>Duration</TableHead>
                       <TableHead>Tags</TableHead>
                       <TableHead>Embed Code</TableHead>
                       <TableHead>Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredVideos.map((video) => (
                       <TableRow key={video.uri}>
                          <TableCell className="w-20">
                            {getThumbnailUrl(video) ? (
                              <img 
                                src={getThumbnailUrl(video)} 
                                alt={video.name}
                                className="w-16 h-10 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                <Video className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="min-w-32">
                            <div className="flex flex-col gap-1">
                              <a
                                href={`https://vimeo.com/${extractVideoId(video.uri)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono bg-muted px-2 py-1 rounded text-primary hover:bg-primary/10 transition-colors duration-200 inline-block"
                                title="Open video on Vimeo"
                              >
                                {extractVideoId(video.uri)}
                              </a>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigator.clipboard.writeText(extractVideoId(video.uri))}
                                className="h-6 w-fit px-1 text-xs"
                                title="Copy video ID"
                              >
                                Copy ID
                              </Button>
                            </div>
                          </TableCell>
                         <TableCell className="max-w-xs">
                           <div className="truncate" title={video.name}>
                             {video.name}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(video.created_time), "MMM dd, yyyy")}
                           </div>
                         </TableCell>
                         <TableCell>
                           {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                         </TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                             {video.tags?.slice(0, 2).map((tag, index) => (
                               <Badge key={index} variant="outline" className="text-xs">
                                 {tag.name}
                               </Badge>
                             ))}
                             {video.tags && video.tags.length > 2 && (
                               <Badge variant="outline" className="text-xs">
                                 +{video.tags.length - 2}
                               </Badge>
                             )}
                           </div>
                          </TableCell>
                          <TableCell className="min-w-48">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                {generateEmbedCode(video)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(generateEmbedCode(video));
                                  toast({
                                    title: "Copied!",
                                    description: "Embed code copied to clipboard",
                                  });
                                }}
                                className="h-8 px-2 flex-shrink-0"
                                title="Copy embed code"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(video.link, '_blank')}
                              className="h-8 px-2"
                              title="Open video in Vimeo"
                              aria-label="Open video in Vimeo"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                </Table>
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="text-center">
                  <Button 
                    onClick={loadMoreVideos} 
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Load More Videos
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Videos Found</h3>
              <p className="text-muted-foreground mb-4">
                Click refresh to load videos from your Vimeo account
              </p>
              <Button onClick={() => fetchVideos()} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Videos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};