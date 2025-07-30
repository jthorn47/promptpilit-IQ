import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, Maximize, X } from "lucide-react";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document';
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

interface Question {
  id: string;
  timestamp: string;
  questionText: string;
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
}

interface TrainingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: TrainingScene | null;
  moduleName: string;
  questions?: Question[];
}

export const TrainingPreviewModal = ({
  isOpen,
  onClose,
  scene,
  moduleName,
  questions = []
}: TrainingPreviewModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current && 'play' in videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && 'currentTime' in videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      if (duration > 0) {
        setProgress((time / duration) * 100);
      }

      // Check if we should show a question
      const questionAtTime = questions.find(q => {
        const [mins, secs] = q.timestamp.split(':').map(Number);
        const questionTime = mins * 60 + secs;
        return Math.abs(time - questionTime) < 1 && !showQuestion;
      });

      if (questionAtTime) {
        setCurrentQuestion(questionAtTime);
        setShowQuestion(true);
        if ('pause' in videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && 'duration' in videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect = currentQuestion?.options.find(o => o.id === selectedAnswer)?.isCorrect;
      // In a real implementation, you'd handle the answer here
      console.log('Answer submitted:', { questionId: currentQuestion?.id, selectedAnswer, isCorrect });
      
      setShowQuestion(false);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      
      // Resume video
      if (videoRef.current && 'play' in videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const renderVideoPlayer = () => {
    if (!scene?.content_url) {
      return (
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">No video content available</p>
        </div>
      );
    }

    if (scene.content_url.includes('vimeo.com') || scene.content_url.includes('player.vimeo.com')) {
      return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
          <iframe
            ref={videoRef as React.RefObject<HTMLIFrameElement>}
            src={scene.content_url}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={scene.title}
          />
        </div>
      );
    }

    return (
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          src={scene.content_url}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Custom Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Question Overlay */}
        {showQuestion && currentQuestion && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-background">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    Question at {currentQuestion.timestamp}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setSelectedAnswer(option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedAnswer === option.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`} />
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuestion(false);
                      setCurrentQuestion(null);
                      setSelectedAnswer(null);
                      if (videoRef.current && 'play' in videoRef.current) {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                    className="flex-1"
                  >
                    Skip Question
                  </Button>
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{moduleName} - Preview</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This is how learners will experience your training
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Training Info */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">{moduleName}</h1>
              <p className="text-muted-foreground">
                Scene: {scene?.title || 'Untitled Scene'}
              </p>
              {questions.length > 0 && (
                <p className="text-sm text-primary font-medium">
                  This training includes {questions.length} interactive question{questions.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Video Player */}
            {renderVideoPlayer()}

            {/* Training Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};