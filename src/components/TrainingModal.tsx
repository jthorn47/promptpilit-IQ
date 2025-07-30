import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VimeoPlayer } from "./VimeoPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  estimated_duration: number;
  video_type: string;
  vimeo_video_id: string | null;
  vimeo_embed_url: string | null;
  completion_threshold_percentage: number;
}

interface Assignment {
  id: string;
  due_date: string | null;
  status: string;
  priority: string;
  assigned_at: string;
  training_modules: TrainingModule;
}

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  employeeId: string;
  onTrainingComplete?: () => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  assignment,
  employeeId,
  onTrainingComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [showTrainingContent, setShowTrainingContent] = useState(false);
  const { toast } = useToast();

  if (!assignment) return null;

  const handleTrainingComplete = () => {
    toast({
      title: "Training Completed!",
      description: `You have successfully completed "${assignment.training_modules.title}"`,
    });
    
    onTrainingComplete?.();
    
    // Auto-close after a brief delay to let user see the completion message
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleProgress = (progressPercent: number) => {
    setProgress(progressPercent);
  };

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const daysUntilDue = assignment.due_date 
    ? Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-2">
                {assignment.training_modules.title}
              </DialogTitle>
              
              {/* Training Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{assignment.training_modules.estimated_duration || 'N/A'} min</span>
                </div>
                
                {assignment.training_modules.completion_threshold_percentage && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{assignment.training_modules.completion_threshold_percentage}% required</span>
                  </div>
                )}
                
                {assignment.due_date && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    {daysUntilDue !== null && (
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        ({isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}>
                  {assignment.priority === 'high' ? 'High Priority' : 'Normal Priority'}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
                {assignment.training_modules.video_type === 'vimeo' && (
                  <Badge variant="outline">Vimeo Video</Badge>
                )}
              </div>

              {/* Description */}
              {assignment.training_modules.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {assignment.training_modules.description}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Training Content */}
        <div className="flex-1 overflow-hidden">
          {!showTrainingContent ? (
            /* Training Introduction Screen */
            <div className="h-full flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center max-w-2xl mx-auto p-8">
                <BookOpen className="w-20 h-20 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">Ready to Begin Training</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  You're about to start your assigned training module. Please ensure you have enough time to complete the session.
                </p>
                
                {assignment.training_modules.estimated_duration && (
                  <div className="bg-background/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Estimated Duration: {assignment.training_modules.estimated_duration} minutes</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setShowTrainingContent(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Proceed to Training →
                </Button>
              </div>
            </div>
          ) : (
            /* Actual Training Content */
            <>
              {assignment.training_modules.video_type === 'vimeo' && assignment.training_modules.vimeo_video_id ? (
                <VimeoPlayer
                  videoId={assignment.training_modules.vimeo_video_id}
                  employeeId={employeeId}
                  trainingModuleId={assignment.training_modules.id}
                  assignmentId={assignment.id}
                  completionThreshold={assignment.training_modules.completion_threshold_percentage || 80}
                  onComplete={handleTrainingComplete}
                  onProgress={handleProgress}
                  autoplay={false}
                  showControls={true}
                  className="h-full"
                />
              ) : (
                /* Fallback for non-Vimeo content */
                <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Training Content</h3>
                    <p className="text-muted-foreground mb-4">
                      {assignment.training_modules.video_type === 'vimeo' 
                        ? 'No Vimeo video configured for this training module'
                        : 'This training module uses a different content type'
                      }
                    </p>
                    {assignment.training_modules.video_type !== 'vimeo' && (
                      <p className="text-sm text-muted-foreground">
                        Content type: {assignment.training_modules.video_type}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {progress > 0 && (
                <div className="flex-shrink-0 mt-4 p-2 bg-muted rounded">
                  <div className="text-sm text-center">
                    Current Progress: {Math.round(progress)}%
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingModal;