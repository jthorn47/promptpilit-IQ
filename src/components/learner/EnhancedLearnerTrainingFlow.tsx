import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LearnerContentPlayer } from "./LearnerContentPlayer";
import { LearnerQuizPage } from "./LearnerQuizPage";
import { LearnerCompletionScreen } from "./LearnerCompletionScreen";
import { ProgressIndicator } from "./ProgressIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Award, ArrowLeft } from "lucide-react";

type FlowStep = 'content' | 'quiz' | 'completion';

interface Assignment {
  id: string;
  employee_id: string;
  training_module_id: string;
  due_date?: string;
  training_modules: {
    id: string;
    title: string;
    description: string;
    credit_value: number;
    estimated_duration: number;
    completion_threshold_percentage: number;
  };
}

interface TrainingScene {
  id: string;
  title: string;
  description: string;
  scene_type: string;
  content_url: string | null;
  scorm_package_url: string | null;
  estimated_duration: number;
  training_module_id: string;
}

export const EnhancedLearnerTrainingFlow = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('content');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [scene, setScene] = useState<TrainingScene | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  const {
    progress,
    loading: progressLoading,
    initializeProgress,
    updateProgress,
    markContentComplete,
    recordQuizAttempt,
    updateTimeSpent,
    logAnalyticsEvent
  } = useLearningProgress(assignmentId, assignment?.employee_id);

  useEffect(() => {
    if (assignmentId) {
      fetchTrainingData();
    }
  }, [assignmentId]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secondsSpent = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setTimeSpent(secondsSpent);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save time spent periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (timeSpent > 0 && progress) {
        updateTimeSpent(30); // Save every 30 seconds
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [timeSpent, progress, updateTimeSpent]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignment with training module details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("training_assignments")
        .select(`
          *,
          training_modules(
            id,
            title,
            description,
            credit_value,
            estimated_duration,
            completion_threshold_percentage
          )
        `)
        .eq("id", assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      // Fetch the first scene of the training module
      const { data: sceneData, error: sceneError } = await supabase
        .from("training_scenes")
        .select("*")
        .eq("training_module_id", assignmentData.training_module_id)
        .eq("status", "active")
        .order("scene_order")
        .limit(1)
        .single();

      if (sceneError) throw sceneError;
      setScene(sceneData as TrainingScene);

      // Initialize progress if it doesn't exist
      if (!progress) {
        await initializeProgress(assignmentData.training_module_id);
      }

      // Log session start
      await logAnalyticsEvent('session_start', {
        training_module_id: assignmentData.training_module_id,
        scene_id: sceneData.id
      });

      // Determine current step based on progress
      if (progress) {
        if (progress.status === 'completed') {
          setCurrentStep('completion');
        } else if (progress.status === 'quiz_complete' || progress.content_completed_at) {
          setCurrentStep('quiz');
        }
      }

    } catch (error: any) {
      console.error("Error fetching training data:", error);
      setError("Failed to load training content");
      toast({
        title: "Error",
        description: "Failed to load training content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentComplete = async () => {
    await markContentComplete();
    await logAnalyticsEvent('content_complete');
    setCurrentStep('quiz');
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    await recordQuizAttempt(score, passed);
    
    if (passed) {
      setCurrentStep('completion');
      toast({
        title: "Congratulations!",
        description: `You passed with a score of ${score}%!`,
      });
    } else {
      toast({
        title: "Try Again",
        description: `You scored ${score}%. You need ${assignment?.training_modules.completion_threshold_percentage || 80}% to pass.`,
        variant: "destructive"
      });
    }
  };

  const handleReturnToDashboard = async () => {
    // Save final time spent
    await updateTimeSpent(timeSpent);
    await logAnalyticsEvent('session_end', { total_time_spent: timeSpent });
    
    navigate(`/learner/${assignment?.employee_id}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'content': return 33;
      case 'quiz': return 66;
      case 'completion': return 100;
      default: return 0;
    }
  };

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your training...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment || !scene) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Training Not Found</h2>
              <p className="text-muted-foreground mb-4">{error || "Unable to load training content"}</p>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{assignment.training_modules.title}</h1>
                <p className="text-sm text-muted-foreground">{assignment.training_modules.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Time: {formatTime(timeSpent)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Est: {assignment.training_modules.estimated_duration}min</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>{assignment.training_modules.credit_value} credits</span>
              </div>
            </div>
          </div>
          
          <ProgressIndicator 
            currentProgress={progress?.overall_progress_percentage || 0}
            stepProgress={getStepProgress()}
            currentStep={currentStep}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentStep === 'content' && (
          <LearnerContentPlayer
            scene={{
              id: scene.id,
              title: scene.title,
              description: scene.description,
              scene_type: scene.scene_type,
              content_url: scene.content_url,
              scorm_package_url: scene.scorm_package_url,
              estimated_duration: scene.estimated_duration,
              training_module_id: scene.training_module_id
            }}
            assignment={assignment}
            onNext={handleContentComplete}
          />
        )}
        
        {currentStep === 'quiz' && (
          <LearnerQuizPage
            scene={scene}
            assignment={assignment}
            onNext={() => handleQuizComplete(0, false)}
            requireCorrectAnswers={true}
          />
        )}
        
        {currentStep === 'completion' && (
          <LearnerCompletionScreen
            assignment={assignment}
            onReturnToDashboard={handleReturnToDashboard}
          />
        )}
      </div>
    </div>
  );
};