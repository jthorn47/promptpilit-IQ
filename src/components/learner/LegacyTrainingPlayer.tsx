import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Volume2,
  Maximize2,
  Clock,
  Users,
  Languages
} from "lucide-react";

interface Scene {
  id: string;
  title: string;
  description: string;
  content_url: string;
  scene_order: number;
  estimated_duration: number;
  questions?: Question[];
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  scene_question_options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface LegacyTrainingPlayerProps {
  trainingId: string;
  trainingTitle: string;
  onComplete: () => void;
}

export const LegacyTrainingPlayer = ({ 
  trainingId, 
  trainingTitle, 
  onComplete 
}: LegacyTrainingPlayerProps) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [sceneCompleted, setSceneCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    fetchTrainingData();
  }, [trainingId]);

  useEffect(() => {
    // Calculate progress
    const totalScenes = scenes.length;
    if (totalScenes > 0) {
      const completedScenes = currentSceneIndex;
      const sceneProgress = sceneCompleted ? 1 : (videoWatched ? 0.7 : 0);
      setProgress(((completedScenes + sceneProgress) / totalScenes) * 100);
    }
  }, [currentSceneIndex, videoWatched, sceneCompleted, scenes.length]);

  const fetchTrainingData = async () => {
    try {
      // Fetch scenes
      const { data: scenesData, error: scenesError } = await supabase
        .from('training_scenes')
        .select('*')
        .eq('training_module_id', trainingId)
        .order('scene_order');

      if (scenesError) throw scenesError;

      // Fetch questions for each scene
      const scenesWithQuestions = await Promise.all(
        scenesData.map(async (scene) => {
          const { data: questions, error: questionsError } = await supabase
            .from('scene_questions')
            .select(`
              *,
              scene_question_options (*)
            `)
            .eq('scene_id', scene.id)
            .order('question_order');

          if (questionsError) throw questionsError;

          return {
            ...scene,
            questions: questions || []
          };
        })
      );

      setScenes(scenesWithQuestions);
    } catch (error) {
      console.error('Error fetching training data:', error);
      toast({
        title: "Error",
        description: "Failed to load training content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    setVideoWatched(true);
    if (!currentScene.questions || currentScene.questions.length === 0) {
      setSceneCompleted(true);
    }
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswers = async () => {
    if (!currentScene.questions) return;

    try {
      // Validate all questions are answered
      const unansweredQuestions = currentScene.questions.filter(
        q => !selectedAnswers[q.id]
      );

      if (unansweredQuestions.length > 0) {
        toast({
          title: "Please answer all questions",
          description: "Complete all quiz questions before proceeding",
          variant: "destructive",
        });
        return;
      }

      // Submit answers (would typically save to database here)
      setSceneCompleted(true);
      
      toast({
        title: "Answers Submitted",
        description: "Great job! Moving to next scene...",
      });

    } catch (error) {
      console.error('Error submitting answers:', error);
      toast({
        title: "Error",
        description: "Failed to submit answers",
        variant: "destructive",
      });
    }
  };

  const nextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setVideoWatched(false);
      setSceneCompleted(false);
      setSelectedAnswers({});
    } else {
      // Training completed
      onComplete();
    }
  };

  const previousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
      setVideoWatched(false);
      setSceneCompleted(false);
      setSelectedAnswers({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading training content...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No training content available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{trainingTitle}</h1>
              <p className="text-muted-foreground">
                Scene {currentSceneIndex + 1} of {scenes.length}: {currentScene.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {currentScene.estimated_duration} min
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Training Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {currentScene.content_url ? (
                <iframe
                  src={currentScene.content_url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={currentScene.title}
                  onLoad={() => {
                    // Simulate video end for demo - in real implementation, 
                    // you'd listen to Vimeo player events
                    setTimeout(() => handleVideoEnd(), 3000);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>Video not available</p>
                </div>
              )}
              
              {!videoWatched && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Watch the video to continue</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Questions */}
        {videoWatched && currentScene.questions && currentScene.questions.length > 0 && !sceneCompleted && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Quiz Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentScene.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {index + 1}. {question.question_text}
                  </h3>
                  
                  {question.question_type === 'true_false' ? (
                    <RadioGroup
                      value={selectedAnswers[question.id] || ""}
                      onValueChange={(value) => handleQuestionAnswer(question.id, value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${question.id}-true`} />
                        <Label htmlFor={`${question.id}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}-false`} />
                        <Label htmlFor={`${question.id}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <RadioGroup
                      value={selectedAnswers[question.id] || ""}
                      onValueChange={(value) => handleQuestionAnswer(question.id, value)}
                    >
                      {question.scene_question_options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.option_text} id={option.id} />
                          <Label htmlFor={option.id}>{option.option_text}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
              
              <Button onClick={submitAnswers} className="w-full bg-gradient-primary">
                Submit Answers
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousScene}
            disabled={currentSceneIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {scenes.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < currentSceneIndex
                    ? "bg-green-500"
                    : index === currentSceneIndex
                    ? sceneCompleted
                      ? "bg-green-500"
                      : videoWatched
                      ? "bg-yellow-500"
                      : "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextScene}
            disabled={!sceneCompleted && !(videoWatched && (!currentScene.questions || currentScene.questions.length === 0))}
            className="flex items-center gap-2 bg-gradient-primary"
          >
            {currentSceneIndex === scenes.length - 1 ? (
              <>
                Complete Training
                <CheckCircle className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};