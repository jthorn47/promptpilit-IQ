import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LearnerContentPlayer } from "./LearnerContentPlayer";
import { LearnerQuizPage } from "./LearnerQuizPage";
import { LearnerCompletionScreen } from "./LearnerCompletionScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FlowStep = 'content' | 'quiz' | 'completion';

export const LearnerTrainingFlow = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('content');
  const [assignment, setAssignment] = useState<any>(null);
  const [scene, setScene] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentId) {
      fetchTrainingData();
    }
  }, [assignmentId]);

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
            video_code
          )
        `)
        .eq("id", assignmentId)
        .single();

      // Check if this is SBW-9237 and route to specialized flow
      if (assignmentData?.training_modules?.video_code === 'SBW-9237') {
        // Import and use SBW9237TrainingFlow
        const { SBW9237TrainingFlow } = await import('./SBW9237TrainingFlow');
        return <SBW9237TrainingFlow />;
      }

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
      setScene(sceneData);

      // Check if user has already completed content based on scene type
      let hasCompleted = false;
      
      if (sceneData.scene_type === 'scorm') {
        const { data: scormProgress } = await supabase
          .from("scorm_progress")
          .select("completion_status")
          .eq("employee_id", assignmentData.employee_id)
          .eq("scene_id", sceneData.id)
          .eq("assignment_id", assignmentData.id)
          .maybeSingle();
        
        hasCompleted = scormProgress?.completion_status === 'completed';
      } else {
        const { data: videoProgress } = await supabase
          .from("learner_video_progress")
          .select("is_completed")
          .eq("employee_id", assignmentData.employee_id)
          .eq("scene_id", sceneData.id)
          .eq("assignment_id", assignmentData.id)
          .maybeSingle();
        
        hasCompleted = videoProgress?.is_completed || false;
      }

      if (hasCompleted) {
        setCurrentStep('quiz');
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

  const handleContentComplete = () => {
    setCurrentStep('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentStep('completion');
  };

  const handleReturnToDashboard = () => {
    navigate(`/learner/${assignment.employee_id}`);
  };

  if (loading) {
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
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Training Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "Unable to load training content"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentStep === 'content' && (
        <LearnerContentPlayer
          scene={scene}
          assignment={assignment}
          onNext={handleContentComplete}
        />
      )}
      
      {currentStep === 'quiz' && (
        <LearnerQuizPage
          scene={scene}
          assignment={assignment}
          onNext={handleQuizComplete}
          requireCorrectAnswers={false}
        />
      )}
      
      {currentStep === 'completion' && (
        <LearnerCompletionScreen
          assignment={assignment}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}
    </>
  );
};