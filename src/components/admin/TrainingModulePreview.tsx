import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { CustomScormPlayer } from "@/components/ui/custom-scorm-player";

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: string;
  vimeo_embed_url: string | null;
  credit_value: number;
  is_required: boolean;
  quiz_enabled: boolean;
  scorm_file_path: string | null;
  scorm_file_name: string | null;
}

interface TrainingModulePreviewProps {
  module: TrainingModule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingModulePreview = ({
  module,
  isOpen,
  onClose
}: TrainingModulePreviewProps) => {
  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {module.title}</DialogTitle>
          <DialogDescription>
            Training module preview - {module.video_type}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Module Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Module Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Type:</span> {module.video_type}</p>
                    <p><span className="font-medium">Credits:</span> {module.credit_value}</p>
                    <p><span className="font-medium">Required:</span> {module.is_required ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Quiz:</span> {module.quiz_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.description || 'No description available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          {module.video_type === 'vimeo' && module.vimeo_embed_url && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Video Preview</h3>
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`${module.vimeo_embed_url}?autoplay=0&loop=0&byline=0&portrait=0&title=0`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={module.title}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scene-based Training Notice */}
          {module.video_type === 'vimeo' && !module.vimeo_embed_url && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Scene-Based Training</h3>
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Interactive Training Module</p>
                  <p className="text-muted-foreground mb-4">
                    This training consists of multiple interactive scenes and cannot be previewed here.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click "Proceed to Training" to experience the full interactive training.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTube Preview */}
          {module.video_type === 'youtube' && module.video_url && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Video Preview</h3>
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={module.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={module.title}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SCORM Player Preview */}
          {module.video_type === 'scorm' && module.scorm_file_path && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">SCORM Training Preview</h3>
                <div className="w-full bg-muted rounded-lg overflow-hidden">
                  <CustomScormPlayer
                    scormPackageUrl={module.scorm_file_path}
                    moduleName={module.title}
                    onComplete={(score, duration) => {
                      console.log('Preview SCORM completed:', { score, duration });
                    }}
                    onProgress={(progress) => {
                      console.log('Preview SCORM progress:', progress);
                    }}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Video Info */}
          {module.video_type === 'upload' && module.video_url && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Uploaded Video</h3>
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <video
                    src={module.video_url}
                    className="w-full h-full object-cover"
                    controls
                    title={module.title}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Content Available */}
          {((module.video_type === 'upload' && !module.video_url) ||
            (module.video_type === 'youtube' && !module.video_url) ||
            (module.video_type === 'scorm' && !module.scorm_file_path)) && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No Preview Available</p>
                  <p className="text-muted-foreground">
                    This training module doesn't have any content configured for preview.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button 
            onClick={() => {
              // Navigate to training based on type and availability
              if (module.video_type === 'vimeo' && module.vimeo_embed_url) {
                window.open(module.vimeo_embed_url, '_blank');
              } else if (module.video_type === 'youtube' && module.video_url) {
                window.open(module.video_url, '_blank');
              } else if (module.video_type === 'upload' && module.video_url) {
                window.open(module.video_url, '_blank');
              } else if (module.video_type === 'scorm' && module.scorm_file_path) {
                window.open(`/training/${module.id}`, '_blank');
              } else {
                // For scene-based training or modules without direct content
                window.open(`/training/${module.id}`, '_blank');
              }
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Proceed to Training →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};