import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Video, FileText, Database, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VimeoVideo {
  id: string;
  name: string;
  duration: string;
  embedUrl: string;
}

interface ScormFile {
  id: string;
  title: string;
  scorm_package_url: string;
  created_at: string;
  training_module_title?: string;
}

interface ContentUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hasExistingContent: boolean;
  uploading: boolean;
  uploadProgress: number;
  vimeoVideos: VimeoVideo[];
  onFileUpload: (file: File) => void;
  onVimeoSearch: (query: string) => void;
  onVimeoSelect: (videoId: string, embedUrl: string) => void;
  onScormUpload?: (file: File) => void;
  onScormSelect?: (scormUrl: string) => void;
  showScormUpload?: boolean; // Add this to control SCORM visibility
}

export const ContentUploadPanel = ({
  isOpen,
  onClose,
  hasExistingContent,
  uploading,
  uploadProgress,
  vimeoVideos,
  onFileUpload,
  onVimeoSearch,
  onVimeoSelect,
  onScormUpload,
  onScormSelect,
  showScormUpload = false, // Default to false for regular modules
}: ContentUploadPanelProps) => {
  const [vimeoSearchQuery, setVimeoSearchQuery] = useState("");
  const [scormFiles, setScormFiles] = useState<ScormFile[]>([]);
  const [loadingScormFiles, setLoadingScormFiles] = useState(false);
  const [showExistingScorm, setShowExistingScorm] = useState(false);
  const { toast } = useToast();

  // Fetch existing SCORM files from database
  const fetchExistingScormFiles = async () => {
    setLoadingScormFiles(true);
    try {
      const { data, error } = await supabase
        .from('training_scenes')
        .select(`
          id,
          title,
          scorm_package_url,
          created_at,
          training_modules!inner(title)
        `)
        .eq('scene_type', 'scorm')
        .not('scorm_package_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFiles: ScormFile[] = (data || []).map(scene => ({
        id: scene.id,
        title: scene.title,
        scorm_package_url: scene.scorm_package_url!,
        created_at: scene.created_at,
        training_module_title: scene.training_modules?.title
      }));

      setScormFiles(formattedFiles);
      setShowExistingScorm(true);
    } catch (error) {
      console.error('Error fetching SCORM files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing SCORM files",
        variant: "destructive",
      });
    } finally {
      setLoadingScormFiles(false);
    }
  };

  if (!isOpen) return null;

  const handleContentAction = (action: () => void) => {
    if (hasExistingContent) {
      if (!confirm('This will replace existing content. Continue?')) return;
    }
    action();
  };

  return (
    <div className="absolute right-80 top-0 w-96 h-full border-l bg-background shadow-lg p-4 z-10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload Content</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Current Content Status */}
        {hasExistingContent && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">Current Content</h4>
                <p className="text-xs text-blue-700">Content is already uploaded</p>
              </div>
              <Button variant="outline" size="sm">
                Replace
              </Button>
            </div>
          </div>
        )}
        
        {/* Upload Progress */}
        {uploading && (
          <div className="p-3 bg-white rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading content...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        <div className="space-y-4">
          {/* Video Upload */}
          <div className="p-3 border rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </h4>
            <Button 
              variant="outline" 
              className="w-full mb-2"
              onClick={() => document.getElementById('video-file-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Video File"}
            </Button>
            <input
              id="video-file-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleContentAction(() => onFileUpload(file));
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              MP4, MOV, AVI files uploaded to Vimeo
            </p>
          </div>

          {/* Vimeo Search */}
          <div className="p-3 border rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vimeo
            </h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Search your Vimeo videos..."
                value={vimeoSearchQuery}
                onChange={(e) => setVimeoSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && vimeoSearchQuery.trim()) {
                    onVimeoSearch(vimeoSearchQuery.trim());
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => vimeoSearchQuery.trim() && onVimeoSearch(vimeoSearchQuery.trim())}
                disabled={!vimeoSearchQuery.trim()}
              >
                Search
              </Button>
            </div>
            
            {vimeoVideos.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {vimeoVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      handleContentAction(() => onVimeoSelect(video.id, video.embedUrl));
                    }}
                  >
                    <div className="text-sm font-medium">{video.name}</div>
                    <div className="text-xs text-muted-foreground">{video.duration}</div>
                  </div>
                ))}
              </div>
            )}
           </div>

          {/* SCORM Upload - Only show if enabled */}
          {showScormUpload && onScormUpload && (
            <div className="p-3 border rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                SCORM Package
              </h4>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('🎓 SCORM Upload button clicked - TESTING');
                  const fileInput = document.getElementById('scorm-file-upload');
                  console.log('🎓 File input element:', fileInput);
                  if (fileInput) {
                    fileInput.click();
                  } else {
                    console.error('❌ File input not found!');
                  }
                }}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload SCORM (.zip)"}
              </Button>
              <input
                id="scorm-file-upload"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  console.log('🎓 SCORM File input changed', e.target.files);
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('🎓 File selected:', file.name, file.type, file.size);
                    if (!file.name.endsWith('.zip')) {
                      console.log('❌ Invalid file type:', file.name);
                      toast({
                        title: "Invalid File",
                        description: "Please select a ZIP file containing SCORM content",
                        variant: "destructive",
                      });
                      return;
                    }
                    console.log('✅ Valid ZIP file, calling handleContentAction');
                    handleContentAction(() => onScormUpload(file));
                    
                    // Reset the input so the same file can be uploaded again
                    e.target.value = '';
                  } else {
                    console.log('❌ No file selected');
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Interactive learning packages
              </p>
              
              {/* Browse Existing SCORM */}
              <div className="mt-3 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={fetchExistingScormFiles}
                  disabled={loadingScormFiles}
                >
                  <Database className="w-4 h-4 mr-2" />
                  {loadingScormFiles ? "Loading..." : "Browse Existing SCORM Files"}
                </Button>
                
                {showExistingScorm && scormFiles.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {scormFiles.map((scormFile) => (
                      <div 
                        key={scormFile.id} 
                        className="p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          if (onScormSelect) {
                            handleContentAction(() => onScormSelect(scormFile.scorm_package_url));
                            setShowExistingScorm(false);
                          }
                        }}
                      >
                        <div className="text-sm font-medium">{scormFile.title}</div>
                        <div className="text-xs text-muted-foreground">
                          From: {scormFile.training_module_title || 'Unknown Module'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(scormFile.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showExistingScorm && scormFiles.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    No existing SCORM files found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};