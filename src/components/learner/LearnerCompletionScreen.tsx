import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Award, 
  Download, 
  ArrowLeft, 
  Calendar,
  Clock,
  Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearnerCompletionScreenProps {
  assignment: {
    id: string;
    training_module_id: string;
    employee_id: string;
    training_modules?: {
      title: string;
      description: string | null;
      credit_value: number;
    };
  };
  onReturnToDashboard: () => void;
}

export const LearnerCompletionScreen = ({ 
  assignment, 
  onReturnToDashboard 
}: LearnerCompletionScreenProps) => {
  const [completion, setCompletion] = useState<any>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    completeTraining();
  }, []);

  const completeTraining = async () => {
    try {
      setLoading(true);

      // Mark training as completed
      const { data: completionData, error: completionError } = await supabase
        .from("training_completions")
        .upsert({
          assignment_id: assignment.id,
          training_module_id: assignment.training_module_id,
          employee_id: assignment.employee_id,
          completed_at: new Date().toISOString(),
          status: 'completed',
          progress_percentage: 100,
        })
        .select()
        .single();

      if (completionError) throw completionError;
      setCompletion(completionData);

      // Generate certificate if enabled
      await generateCertificate();

      toast({
        title: "Training Complete!",
        description: "Congratulations on completing your training.",
      });
    } catch (error) {
      console.error("Error completing training:", error);
      toast({
        title: "Error",
        description: "Failed to complete training",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      // Generate certificate using the edge function
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          assignmentId: assignment.id,
          employeeId: assignment.employee_id,
          moduleId: assignment.training_module_id,
        }
      });

      if (error) throw error;

      if (data?.success && data?.certificate?.certificateUrl) {
        setCertificateUrl(data.certificate.certificateUrl);
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      // Don't show error to user, certificates are optional
    }
  };

  const handleDownloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-muted-foreground">Completing your training...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      
      <div className="container mx-auto py-8 px-4 max-w-4xl" id="main-content">
        {/* Completion Header */}
        <header className="text-center mb-8" role="banner">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Training Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Congratulations on successfully completing your training
          </p>
        </header>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div role="region" aria-label="Training completion progress">
                <div className="flex justify-between text-sm mb-2">
                  <span id="completion-progress-label">Training Progress</span>
                  <span aria-live="polite">100% Complete</span>
                </div>
                <Progress 
                  value={100} 
                  className="h-3" 
                  aria-labelledby="completion-progress-label"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={100}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">Completed</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">Credits Earned</p>
                  <p className="font-semibold" aria-label={`${assignment.training_modules?.credit_value || 1} credits earned`}>
                    {assignment.training_modules?.credit_value || 1}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">Completed On</p>
                  <p className="font-semibold">
                    {completion?.completed_at ? 
                      new Date(completion.completed_at).toLocaleDateString() : 
                      new Date().toLocaleDateString()
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Training Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h2 className="font-semibold text-lg">
                  {assignment.training_modules?.title || 'Training Module'}
                </h2>
                {assignment.training_modules?.description && (
                  <p className="text-muted-foreground">
                    {assignment.training_modules.description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2" role="group" aria-label="Training status and credits">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                  Completed
                </Badge>
                <Badge variant="outline">
                  <Award className="w-3 h-3 mr-1" aria-hidden="true" />
                  {assignment.training_modules?.credit_value || 1} Credits
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Section */}
        {certificateUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6" aria-hidden="true" />
                Certificate of Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">
                    Your certificate is ready for download
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This certificate verifies your successful completion of the training
                  </p>
                </div>
                <Button 
                  onClick={handleDownloadCertificate}
                  className="focus:ring-2 focus:ring-primary"
                  aria-describedby="certificate-description"
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Download Certificate
                </Button>
                <div id="certificate-description" className="sr-only">
                  Download your completion certificate as a PDF file
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Great job completing this training! Here are some suggestions for your continued learning:
              </p>
              <ul className="space-y-2 text-sm" role="list">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span>Review your training dashboard for additional assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span>Share your achievement with your team</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span>Apply what you've learned in your daily work</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Return Button */}
        <div className="text-center">
          <Button 
            onClick={onReturnToDashboard} 
            size="lg" 
            className="focus:ring-2 focus:ring-primary"
            aria-describedby="return-button-description"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Return to Dashboard
          </Button>
          <div id="return-button-description" className="sr-only">
            Navigate back to your training dashboard to view other assignments
          </div>
        </div>
      </div>
    </div>
  );
};